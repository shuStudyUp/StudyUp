var dbconn = require('../dbconn/dbconn.js');

function execute(req, res) {
    /////////////////////////////////////
    // Select 예제
    /////////////////////////////////////
    var query = dbconn('test_tb') // knex(테이블명) select * from test_tb 
    query.then((rows) => { 
        console.log("======================================")
        console.log("row 개수 " + rows.length)
        console.log("======================================")

        var data = {};
		var list = [];
		data.list = list;
        for (i in rows) {
            var row = rows[i]
            var item = {};
			item.id = row.id;
			item.create_time = row.create_time;
			item.name = row.name;
            list.push(item);

            console.log("Row["+i+"]  id: "+ row.id + " create_time: " + row.create_time + " name: " + row.name)        
        }

        var json = {};
        json.data = data
        console.log('- RESULT(' + JSON.stringify(json) + ')')       
        res.send(json)
        
    }).catch((err) => {
        console.log("Error : " + err)
    });
}

module.exports = execute;