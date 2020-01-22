if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// const express = require('express')
const routes = require('./routes/api/index')
const port = process.env.PORT || 3000
const cors = require('cors')
const bodyParser = require('body-parser')

// const passport = require('./config/passport')
// const helpers = require('./_helpers')
// 引入swagger
// const swaggerJsDoc = require('swagger-jsdoc')
// const swaggerUi = require('swagger-ui-express')

// const app = new express()
const app = require('express')()
// socket setup
const http = require('http').Server(app);
const io = require('socket.io')(http);

// use middleware
app.use(cors())
// parser json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

io.on('connection', (socket) => {
  // socket.emit('status', 'hello socket! fuck')
  // console.log('a user is connected', socket.id)
  // require('./config/socket')(socket)
  app.set('socket', socket)
})


//app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
// app.use(flash())
//app.use(passport.initialize())
//app.use(passport.session())
// app.use((req, res, next) => {
//   res.locals.success_messages = req.flash('success_messages')
//   res.locals.error_messages = req.flash('error_messages')
//   res.locals.user = req.user
//   next()
// })

// app.use((req, res, next)=>{
//   res.io = io;
//   next();
// })

// use router
//app.use('/api/', routes)
require('./routes/api/index')(app)

// io.sockets.on('connection', my.respond)
// app.listen(port, () => console.log(`server is listening to port ${port}`))
http.listen(port, () => console.log(`server is listening to port ${port}`))

// module.exports = app
module.exports = http

