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

$(document).ready(function(){
  userId = getOrCreateCookie();

  // Create an unique id to deck
  fieldId = setDeckName(userId);

  var socket = io();

  $('#start').click(function() {
    socket.emit('start', userId)
  })

  $('#play').click(function(){
    var field = $(`#${fieldId}`)
    var val = JSON.parse(field.val())
    var card = val.pop()

    field.val(JSON.stringify(val))

    if(val.length < 1){
      $('#play').prop("disabled", true)
    }

    socket.emit('card', userId, card);
  });

  socket.on('connect', function(){
    socket.emit('start', userId)
  });

  socket.on('card', function(msg){
    $('#messages').append($('<li>').text(msg));
  });

  socket.on('start deck', function(field, deck){
    var field = $(`#deck_${field}`)

    field.val(deck)
  })
});
