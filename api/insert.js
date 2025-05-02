var dbconn = require('../dbconn/dbconn.js');

function execute(req, res) {

    var name = req.body.name
    console.log("클라이언트에서 전송된 요청 메시지: " + name)

    ///////////////////////////////////
    // Insert 예제
    /////////////////////////////////////
    var query = dbconn("test_tb") // knex(테이블명)
    .insert({
        name: name // name 컬럼에 클라이언트에서 넘어온 문자를 입력
    });

    query.then(() => {
        // insert 완료
        console.log("Insert 완료")

        var json = {};
        json.data = {}
        res.send(json)

    }).catch((err) => {
        console.log("Err : " + err)
        
    });
}

module.exports = execute;