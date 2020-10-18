const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = 3000;

var messages = [{username: "pre mensagens", message: "a pintar"}];

io.on("connection", socket => {
    console.log("a user connected :D");
    socket.on("user data", userData => {
      console.log(userData);
      console.log('sending messages');
      socket.emit('gimme messages', messages);
      console.log("there u go");
    });
    socket.on("user message", userMessage => {
        console.log(userMessage);
        messages.push(userMessage);
        console.log(messages.length);
        io.emit("user message", userMessage);
    });
  });

  server.listen(port, () => console.log("server running on port:" + port));