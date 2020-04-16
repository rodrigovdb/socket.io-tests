const express = require('express')
const app     = express()
const port    = 3000
const http    = require('http').createServer(app)

// socket.io stuffs
const io      = require('socket.io')(http)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('chat message', (msg) => {
    // show on console
    console.log('message: '+ msg)

    // show on chat
    io.emit('chat message', msg)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

http.listen(port, () => console.log(`listening at *:${port}`))

