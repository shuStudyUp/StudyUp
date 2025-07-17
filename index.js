// index.js

require('dotenv').config(); // .env 파일을 로드합니다.
const express = require('express');
const path = require('path'); // 파일 경로 처리를 위해 path 모듈이 필요합니다.
const bodyParser = require('body-parser'); // JSON 요청 본문을 파싱하기 위해 필요합니다.
const app = express();
const port = 3000;

// 데이터베이스 연결 모듈을 가져옵니다.
const knex = require('./dbconn/dbconn.js');

// API 라우터 파일들을 가져옵니다.
const usersApi = require('./api/users.js'); // 사용자 관련 API
const problemsApi = require('./api/problems.js'); // 문제 관련 API
const chatApi = require('./api/chat.js'); // ChatGPT 관련 API (이전 chat.js)

// 미들웨어 설정
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터를 파싱합니다.
app.use(bodyParser.json()); // JSON 요청 본문을 파싱합니다.
app.use(express.static(path.join(__dirname, 'public'))); // 'public' 폴더의 정적 파일을 제공합니다.

// .env 파일에 OPENAI_API_KEY가 설정되어 있는지 확인합니다.
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다!');
  // process.exit(1); // API 키가 없으면 앱을 종료할 수 있습니다. 개발 중에는 주석 처리하여 테스트할 수 있습니다.
}

// GET / 라우트: public/test.html 파일을 제공합니다.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// 기존 데이터 관리 (test_tb) 관련 라우트
// 이 라우트들은 특정 API 파일로 분리되어 있지 않으므로 여기에 직접 정의합니다.
// 실제 프로젝트에서는 이들도 별도의 라우트 파일로 분리하는 것이 좋습니다.
app.post("/select.do", async (req, res) => {
    try {
        const data = await knex('test_tb').select('*');
        res.status(200).json({ success: true, data: { list: data } });
    } catch (err) {
        console.error("❌ select.do 오류:", err);
        res.status(500).json({ success: false, error: '데이터 조회 중 오류 발생' });
    }
});

app.post("/insert.do", async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: '이름을 입력해주세요.' });
    try {
        await knex('test_tb').insert({ name: name });
        res.status(200).json({ success: true, message: '데이터가 성공적으로 추가되었습니다.' });
    } catch (err) {
        console.error("❌ insert.do 오류:", err);
        res.status(500).json({ success: false, error: '데이터 추가 중 오류 발생' });
    }
});

app.post("/delete.do", async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: '삭제할 이름을 입력해주세요.' });
    try {
        const deletedRows = await knex('test_tb').where({ name: name }).del();
        if (deletedRows > 0) {
            res.status(200).json({ success: true, message: '데이터가 성공적으로 삭제되었습니다.' });
        } else {
            res.status(404).json({ success: false, error: '해당 이름을 가진 데이터를 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error("❌ delete.do 오류:", err);
        res.status(500).json({ success: false, error: '데이터 삭제 중 오류 발생' });
    }
});


// API 라우터 연결
// 각 API 파일에서 내보낸 함수들을 개별 엔드포인트에 연결합니다.
// 💡 usersApi에 정의된 라우트들을 연결합니다.
app.post('/users/create', usersApi.createUser);
app.post('/users/list', usersApi.listUsers);
app.post('/users/stats', usersApi.userStats);
app.post('/users/delete', usersApi.deleteUser);
app.post('/users/login', usersApi.loginUser);
app.post('/users/logout', usersApi.logoutUser); // 💡 로그아웃 라우트 추가

// 💡 problemsApi에 정의된 라우트들을 연결합니다.
app.post('/problems/list', problemsApi.listProblems);
app.post('/problems/add', problemsApi.addProblem);
app.post('/problems/delete', problemsApi.deleteProblem);

// 💡 chatApi에 정의된 라우트들을 연결합니다.
// chat.js 파일이 handleChat 함수를 내보낸다고 가정합니다.
app.post('/chat', chatApi.handleChat);


// 서버 실행
app.listen(port, () => {
    console.log(`✅ 서버가 실행 중: http://localhost:${port}`);
});

