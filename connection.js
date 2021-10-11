const mysql = require('mysql')

const con = mysql.createConnection({
    host: 'localhost',
    user: 'seokjang',
    password: '1111',
    database: 'seokjang',
})

con.connect( function (err) {
    if (err) throw err
    console.log(" >>>>> MYSQL 연결됨...")
})
