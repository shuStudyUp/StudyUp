let knex = require('knex')({
    client: 'mysql',
    connection: {
        host: '127.0.0.1',   // DB IP
        port : 3306,
        user: 'root',        // DB계정 유저아이디
        password: 'root',    // DB계정 패스워드
        database: 'testdb'  // 데이터베이스명 
    },
    pool: {min: 0, max: 10}
});
module.exports = knex;