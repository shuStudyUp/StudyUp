// api/chat.js
require('dotenv').config(); // .env 파일의 환경 변수를 로드합니다.

// 💡 OpenAI 4.x 버전에 맞게 'openai' 라이브러리 임포트 방식 변경
// 이전: const { Configuration, OpenAIApi } = require('openai');
const OpenAI = require('openai'); // Configuration, OpenAIApi 대신 OpenAI 클래스 임포트

// 데이터베이스 연결 모듈을 가져옵니다.
const dbconn = require('../dbconn/dbconn.js');

// .env 파일에 OPENAI_API_KEY가 설정되어 있는지 확인합니다.
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다!');
  // process.exit(1); // API 키가 없으면 앱을 종료할 수 있습니다. 개발 중에는 주석 처리하여 테스트할 수 있습니다.
}

// 💡 OpenAI 인스턴스 생성 방식 변경: Configuration 없이 OpenAI 인스턴스 직접 생성
// 이전:
// const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY, });
// const openai = new OpenAIApi(configuration);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ChatGPT 연동 핸들러 함수
async function handleChat(req, res) {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: '메시지가 필요합니다.' });
  }

  try {
    // 💡 OpenAI API 호출 방식 변경: createChatCompletion 대신 chat.completions.create
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // gpt-4 모델 사용 시 API 키 권한 및 비용 확인 필요
      messages: [{ role: 'user', content: message }],
    });

    // 💡 응답 데이터 접근 방식 변경: response.data.choices[0].message.content 대신 response.choices[0].message.content
    const reply = response.choices[0].message.content;

    // DB 저장 (chat_logs 테이블이 존재해야 합니다!)
    await dbconn('chat_logs').insert({
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
}

module.exports = {
  handleChat,
};
