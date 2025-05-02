var dbconn = require('../dbconn/dbconn.js');

function execute(req, res) {
    
    var name = req.body.name
    console.log("클라이언트에서 전송된 요청 메시지: " + name)

    /////////////////////////////////////
    // Delete Where 예제
    /////////////////////////////////////
    var query = dbconn('test_tb')
    .delete()
    .where({
        name: name
    });

    query.then(() => {
        console.log("삭제완료")
        
        var json = {};
        json.data = {}
        res.send(json)

    }).catch((err) => {
        console.log("Err : " + err)

    });

}

module.exports = execute;