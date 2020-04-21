const express = require('express')
const app     = express()
const port    = 3000
const http    = require('http').createServer(app)

const io      = require('socket.io')(http)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

// serve static files
app.use(express.static('public'))

// initialize an empty array, from 1 to informed limit.
function initializeArray(limit){
  var arr = new Array()

  for(var i = 1; i <= limit; i++){
    arr.push(i)
  }

  return arr;
}

// shuffle an informed array.
function shuffleArray(arr){
  for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
  return arr;
}

var cards   = {}  // for the current round, store played card from both players
var rounds  = 10  // limit of rounds.
var round   = 0   // current round. Control when reach limit and breaks.

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('start', (name) => {
    console.log('started as '+ name)

    var shuffledArray = shuffleArray(initializeArray(rounds));

    io.emit('start deck', name, JSON.stringify(shuffledArray))
  })

  socket.on('card', (player, deck) => {
    deck = JSON.parse(deck)
    card = deck.pop()

    console.log(`Player ${player} has played ${card}`)

    // creates round response
    if(cards[player]){
      console.log("Player "+ player +" already played for this round")
    } else {

      cards[player] = card

      // gives deck back to player who played
      io.emit('card', player, JSON.stringify(deck))

      // gives the played card to all players
      io.emit('round', player, JSON.stringify(cards))

      if(Object.keys(cards).length > 1){
        round += 1

        // get winner
        var winner  = null
        var score   = 0
        for (var [key, value] of Object.entries(cards)) {
          if(value > score){
            winner  = key
            score   = value
          }
        }
        io.emit('winner', winner)

        // clear
        cards = {}
        io.emit('clearBoard')

        // check if deck is empty
        if(round == rounds){
          io.emit('endGame')
        }
      }
    }
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

http.listen(port, () => console.log(`listening at *:${port}`))
