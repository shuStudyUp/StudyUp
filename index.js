const express = require('express');
const app = express();
const port = 3000; // 포트
var bodyParser = require('body-parser');
var public_dirname = '/public'; // 웹페이지 경로 설정

app.use(express.urlencoded({ extended: true })); // URL 인코딩 설정
app.use(express.static(__dirname + public_dirname)); // express에 웹페이지 경로 설정
app.use(bodyParser.json());
require('dotenv').config(); // .env 파일 로드

// 라우터 연결
app.post('/select.do', require('./api/select.js'));    // select.do API 
app.post('/insert.do', require('./api/insert.js'));    // insert.do API 
app.post('/delete.do', require('./api/delete.js'));    // delete.do API 

// OpenAI 설정
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// ChatGPT 연동 라우터
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: [{ role: 'user', content: message }],
        });

        const reply = response.data.choices[0].message.content;
        res.status(200).json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// 서버 실행
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});