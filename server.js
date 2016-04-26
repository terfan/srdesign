var express = require('express'),
app = express(), 
http = require('http'),
socketIo = require('socket.io');

// start webserver on port 8080
var server = http.createServer(app);
var io = socketIo.listen(server);
server.listen(process.env.PORT || 8080);
app.use(express.static(__dirname));
console.log("Server running on 8080");

// array of all lines drawn
var line_history = [];
var debug_history = [];
var newLine_history = [];

// event-handler for new incoming connections
io.on('connection', function (socket) {

  // first send the history to the new client
  for (var i in line_history) {
    socket.emit('draw_line', { line: line_history[i], debug: debug_history[i], newLine: newLine_history[i] } );
  }

  // add handler for message type "draw_line".
  socket.on('draw_line', function (data) {
    // add received line to history 
    line_history.push(data.line);
    debug_history.push(data.debug);
    newLine_history.push(data.newLine);
    // send line to all clients
    io.emit('draw_line', { line: data.line, debug: data.debug, newLine: data.newLine });
  });

  socket.on('change_color', function (data) {
    io.emit('change_color', { color: data.color });
  });

  socket.on('change_thickness', function (data) {
    io.emit('change_thickness', { thickness: data.thickness });
  });
});