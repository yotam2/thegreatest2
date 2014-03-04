var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');

// Configure the Express web server
var router = express();
var server = http.createServer(router);

// Tell Express to serve static assets
router.use(express.static(path.resolve(__dirname, 'client')));

// Tell Socket.IO to listen for websockets
var io = socketio.listen(server);

// Global variables
var sockets = [];

// Whenever a new client connects
io.on('connection', function(socket) {

  // Add this client to our list of clients
  sockets.push(socket);
   
  // Listen for when this client disconnects
  socket.on('disconnect', function() {
    // Remove this client from our list of clients
    sockets.splice(sockets.indexOf(socket), 1);
  });

  // Listen for when this client sends a message
  socket.on('message', function(message) {
    
    // Build a message from the input (in case we want to transform it)
    var newMessage = {
      name: message.name,
      text: message.text,
      color: message.color,
      time: new Date()
    };

    // Broadcast this message to all clients
    sockets.forEach(function(socket) {
      socket.emit('message', newMessage);
    });

  });

});

// Start our web server
server.listen(process.env.PORT);
