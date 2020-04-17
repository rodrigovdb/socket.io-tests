const express = require('express')
const app     = express()
const port    = 3000
const http    = require('http').createServer(app)

// socket.io stuffs
const io      = require('socket.io')(http)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

// serve static files
app.use(express.static('public'))

function shuffleArray(arr){
  for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
  return arr;
}

// Current round
var cards = {}

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('start', (name) => {
    console.log('started as '+ name)

    var shuffledArray = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

    io.emit('start deck', name, JSON.stringify(shuffledArray))
  })

  socket.on('card', (player, deck) => {
    deck = JSON.parse(deck)
    card = deck.pop()

    console.log(`Player ${player} has played ${card}`)

    // creates round response
    if(cards[player]){
      console.log("Already exists")
    } else {
      cards[player] = card

      // gives deck back to player who played
      io.emit('card', player, JSON.stringify(deck))

      // gives the played card to all players
      io.emit('round', player, JSON.stringify(cards))
    }

    if(Object.keys(cards).length > 1){
      for (var [key, value] of Object.entries(cards)) {
        cards[key] = null
      }
    }
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

http.listen(port, () => console.log(`listening at *:${port}`))
