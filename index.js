
const express = require('express')
const app = express() 
const port = 3000 // 포트
var bodyParser = require('body-parser')
var public_dirname = '/public'; // 웹페이지 경로 설정

app.use(express.urlencoded({ extended: true })); // url 인코딩 설정 True
app.use(express.static(__dirname + public_dirname)); // express에 웹페이지 경로 설정
app.use(bodyParser.json()); 

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/', function (req, res) {
		res.sendFile(__dirname + public_dirname +'/test.html'); // /(root) 경로 호출시 test.html으로 이동
})

app.post('/select.do', require('./api/select.js')); // select.do api 
app.post('/insert.do', require('./api/insert.js')); // insert.do api 
app.post('/delete.do', require('./api/delete.js')); // delete.do api 