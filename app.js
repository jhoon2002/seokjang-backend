const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const multer = require('multer')

const indexRouter = require('./routes/index')
const paysRouter = require('./routes/pays')
const filesRouter = require('./routes/files')

// mysql 연결
const db = require("./models/index.js")

// 실행 모드
// db.sequelize.sync()

// 개발 모드
db.sequelize.sync({ alter: true }).then(() => {
  console.log(">>>>>>>>>>>> MYSQL 접속, 테이블 생성")
})

console.log("process.env.VUE_APP_SOCKET_URL: ", process.env.VUE_APP_SOCKET_URL)

const app = express()

// const server = app.listen(3001, function() {
//   console.log('server running on port 3001')
// })
//
// const io = require('socket.io')(server)
//
// io.on('connection', function(socket) {
//   socket.on('SEND_MESSAGE', function(data) {
//     io.emit('MESSAGE', data)
//   })
// })

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(require('connect-history-api-fallback')())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/api/pays', paysRouter)
app.use('/api/file', filesRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development

  console.log(err)
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

// global.변수명 = 사용하려는 변수명
let emailResultCount = 0
let emailTotalCount = 0
global.emailResultCount = emailResultCount
global.emailTotalCount = emailTotalCount

module.exports = app
