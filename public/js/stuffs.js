/** Retrieve or create a new userId from cookie and retur nit **/
function getOrCreateCookie(){
  var cookie = JSON.parse(document.cookie || '{}')

  if(cookie.userId){
    return cookie.userId;
  }
  else{
    var userId = new Date().getTime();

    document.cookie = JSON.stringify({ userId: userId })

    return userId;
  }
}

/** Override #deck id and name to deck_$userId **/
function renameElements(userId){
  input = $('#deck')
  value = `deck_${userId}`

  input.attr('id', value)
  input.attr('name', value)
}

/** Update deck field with received deck **/
function refreshDeck(player, deck){
  var field = $(`#deck_${player}`)

  field.val(deck)
}

$(document).ready(function(){
  userId = getOrCreateCookie();

  // Create an unique id to deck
  renameElements(userId);
  fieldId = `deck_${userId}`

  var socket = io();

  $('#start').click(function() {
    socket.emit('start', userId)
  })

  $('#card').click(function(){
    var field = $(`#${fieldId}`)
    var deck  = JSON.parse(field.val())

    if(deck.length < 2){
      $('#card').prop("disabled", true)
    }

    socket.emit('card', userId, JSON.stringify(deck));
  });

  socket.on('connect', function(){
    socket.emit('start', userId)
  });

  socket.on('card', function(player, deck){
    refreshDeck(player, deck)
  });

  socket.on('round', function(player, cards){
    cards = JSON.parse(cards)

    for (var [key, value] of Object.entries(cards)) {
      cell = key == userId ? 'mine' : 'other'

      $(`#${cell}`).html(value)
    }
  });

  socket.on('winner', function(player){
    field = (userId == player) ? $('#wins') : $('#losts')
    value = parseInt(field.html())

    field.html(value + 1)
  })

  socket.on('start deck', function(player, deck){
    refreshDeck(player, deck)
  })

  socket.on('clearBoard', function(){
    $('#mine').html(null);
    $('#other').html(null);
  });

  socket.on('endGame', function(){
    wins  = parseInt($('#wins').html())
    losts = parseInt($('#losts').html())

    result = wins > losts ? "win" : "lose";

    $('#gameResult').html('Game has finished. You '+ result);
  });
});
