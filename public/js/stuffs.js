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
function setDeckName(userId){
  input = $('#deck')
  value = `deck_${userId}`

  input.attr('id', value)
  input.attr('name', value)

  return value
}

function refreshDeck(player, deck){
  var field = $(`#deck_${player}`)

  field.val(deck)
}

$(document).ready(function(){
  userId = getOrCreateCookie();

  // Create an unique id to deck
  fieldId = setDeckName(userId);

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
    //$('#messages').append($('<li>').text(msg));
  });

  socket.on('round', function(player, cards){
    cards = JSON.parse(cards)

    for (var [key, value] of Object.entries(cards)) {
      cell = key == userId ? 'mine' : 'other'

      console.log(cell)
      $(`#${cell}`).html(value)
    }
  });

  socket.on('start deck', function(player, deck){
    refreshDeck(player, deck)
  })
});
