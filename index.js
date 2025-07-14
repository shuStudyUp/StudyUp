// index.js

require('dotenv').config(); // .env 파일 로드
const express = require('express');
const path = require('path'); // 파일 경로 처리를 위해 path 모듈 필요
const bodyParser = require('body-parser');

// 💡 OpenAI 4.x 버전에 맞게 'openai' 라이브러리 임포트
//    이전: const { Configuration, OpenAIApi } = require('openai');
const OpenAI = require('openai'); // Configuration, OpenAIApi 대신 OpenAI 클래스 임포트

// knex는 DB 저장을 위해 필요하므로 그대로 둡니다.
const knex = require('./dbconn/dbconn.js');

const app = express();
const port = 3000;

// .env 키 확인
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY가 설정되지 않았습니다!');
  process.exit(1);
}

// 💡 OpenAI 인스턴스 생성 방식 변경: Configuration 없이 OpenAI 인스턴스 직접 생성
//    이전:
//    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY, });
//    const openai = new OpenAIApi(configuration);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // public 폴더의 정적 파일 제공

// GET / 라우트: public/test.html 파일을 서빙합니다.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// 기존 API 라우터 연결 (이 파일들은 수정하지 않습니다.)
app.post('/select.do', require('./api/select.js'));
app.post('/insert.do', require('./api/insert.js'));
app.post('/delete.do', require('./api/delete.js'));

// 💡 새로운 API 파일들 임포트
const usersApi = require('./api/users.js');
const problemsApi = require('./api/problems.js');

// 💡 새로운 API 라우터 연결
// 각 API 파일에서 내보낸 함수들을 개별 엔드포인트에 연결합니다.
app.post('/users/create', usersApi.createUser);
app.post('/users/list', usersApi.listUsers);
app.post('/users/stats', usersApi.userStats);

app.post('/problems/list', problemsApi.listProblems);
app.post('/problems/add', problemsApi.addProblem); // 문제 추가 기능도 필요하다면 연결


// ChatGPT 연동 라우터
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    // 💡 OpenAI API 호출 방식 변경: createChatCompletion 대신 chat.completions.create
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // gpt-4 모델 사용 시 API 키 권한 및 비용 확인 필요
      messages: [{ role: 'user', content: message }],
    });

    // 💡 응답 데이터 접근 방식 변경: response.data.choices[0].message.content 대신 response.choices[0].message.content
    const reply = response.choices[0].message.content;

    // DB 저장 (chat_logs 테이블이 존재해야 합니다!)
    await knex('chat_logs').insert({
      user_input: message,
      ai_response: reply,
    });

    res.status(200).json({ reply });
  } catch (err) {
    console.error('❌ OpenAI API 호출 또는 DB 저장 중 오류 발생:', err);
    // 오류 상세 정보 로깅을 추가하여 문제 진단을 돕습니다.
    if (err.response) {
      console.error('OpenAI API 응답 상태:', err.response.status);
      console.error('OpenAI API 응답 데이터:', err.response.data);
    } else if (err.request) {
      console.error('OpenAI API 요청 오류: 응답 없음');
    } else {
      console.error('일반 오류 메시지:', err.message);
      console.error('오류 스택:', err.stack); // 오류의 발생 위치 추적
    }
    res.status(500).json({ error: '서버 내부 오류: 챗봇 응답 처리 또는 DB 저장 실패' });
  }
});

// 서버 실행
app.listen(port, () => {
    console.log(`✅ 서버가 실행 중: http://localhost:${port}`);
});