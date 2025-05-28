require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// ✅ OpenAI 3.x 방식
const { Configuration, OpenAIApi } = require('openai');
const knex = require('./dbconn/dbconn.js');

const app = express();
const port = 3000;

// .env 키 확인
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY가 설정되지 않았습니다!');
  process.exit(1);
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.post('/select.do', require('./api/select.js'));
app.post('/insert.do', require('./api/insert.js'));
app.post('/delete.do', require('./api/delete.js'));

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const reply = response.data.choices[0].message.content;

    // DB 저장
    await knex('chat_logs').insert({
      user_input: message,
      ai_response: reply,
    });

    res.status(200).json({ reply });
  } catch (err) {
    console.error('OpenAI API 오류:', err);
    res.status(500).json({ error: 'OpenAI API 호출 중 오류' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ 서버가 실행 중: http://43.203.52.123:${port}`);
});
