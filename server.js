var http = require('http');
var path = require('path');

var socketio = require('socket.io');
var express = require('express');
var MongoClient = require('mongodb').MongoClient;

// Configure the Express web server
var router = express();
var server = http.createServer(router);

// Tell Express to serve static assets
router.use(express.static(path.resolve(__dirname, 'client')));

// Tell Socket.IO to listen for websockets
var io = socketio.listen(server);

// Global variables
var sockets = [];

// Connect to the database
// Node mongodb documentation: https://github.com/mongodb/node-mongodb-native
// General MongoDB documentation: http://docs.mongodb.org/manual/core/crud-introduction/
// Command line: mongo ds027829.mongolab.com:27829/networks -u networks -p networks1156
// (Substitute your database URL, db username, and db password)
// Shell: http://docs.mongodb.org/manual/tutorial/getting-started-with-the-mongo-shell/
MongoClient.connect('mongodb://networks:networks1156@ds027829.mongolab.com:27829/networks', function(err, db) {
  if (err) throw err;
  
  // Get a reference to the "messages" collection in the database. It will be created
  // if it doesn't exist (the first time it's actually used, below).
  var messages = db.collection('messages');
    
  // Whenever a new client connects
  io.on('connection', function(socket) {

    // Send all existing messages to the new client, so they receive a history.
    // "messages" is a "collection" in the database. It is created automatically in the database
    // if it doesn't already exist. You can have as many different collections as you want.
    // MongoDB queries: http://docs.mongodb.org/manual/tutorial/query-documents/
    messages.find().each(function(err, message) {
      // An idiosyncracy of Mongo is that each returns one extra "null" item to signify
      // the end of the collection; so we need to ignore that.
      if (message != null) {
        socket.emit('message', message);
      }
    });

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
        color: message.color
      };
  
      // Broadcast this message to all clients
      sockets.forEach(function(socket) {
        socket.emit('message', newMessage);
      });
  
      // Store this message in the database, within the "messages" collection.
      // http://docs.mongodb.org/manual/tutorial/insert-documents/
      // We aren't specifying an _id (unique id), so MongoDB will generate one for us automatically
      // in case we need it, and automatically add that to the document.
      messages.insert(newMessage, function(err, inserted) {
        if (err) throw err;
      });

    });
  
  });
  
  // Start our web server
  server.listen(process.env.PORT);
  
});

