var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');

// Configure the Express web server
var router = express();
var server = http.createServer(router);

// Tell Socket.IO to listen for websockets
var io = socketio.listen(server);

// Tell Express to serve static assets
router.use(express.static(path.resolve(__dirname, 'client')));

// Global variables
var messages = [];
var sockets = [];

// Whenever a new client connects
io.on('connection', function (socket) {
  
    // Send all existing messages to the new client, so they receive a history 
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    // Add this client to our list of clients
    sockets.push(socket);
     
    // Listen for when this client disconnects
    socket.on('disconnect', function () {
      // Remove this client from our list of clients
      sockets.splice(sockets.indexOf(socket), 1);
    });

    // Listen for when this client sends a message
    socket.on('message', function(msg) {

      // Build a message to broadcast
      var data = {
        name: msg.name,
        text: msg.text,
        color: msg.color
      };

      // Broadcast this message to all clients
      sockets.forEach(function(socket) {
        socket.emit('message', data);
      });

      // Add this message to our list of messages
      messages.push(data);
      
    });

  });

// Start our web server
server.listen(process.env.PORT);
