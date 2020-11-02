const express = require("express");
const { DEFAULT_MAX_VERSION } = require("tls");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = 3000;

var messages = [ {username: "pre mensagens", message: "a pintar", date: "4:20"} ];

/*---------------------------MONGO DB-------------------------*/

const {MongoClient} = require('mongodb');

const uri = 'mongodb://127.0.0.1';

const mongoClient = new MongoClient(uri, {useUnifiedTopology: true});

/*---------------------------SOCKET-------------------------*/

io.on("connection", socket => {
    console.log("a user connected :D");

    socket.on("user data", async userData => {
      console.log(userData);
      
      await mongoClient.connect();

      const database = mongoClient.db("chat");
      const collection = database.collection("users");


      const auth = await collection.findOne(userData);

      if(auth) socket.emit("authenticated", userData.username)
      else socket.emit('impostor');
    });

    socket.on("gimme pre messages", () =>{
      console.log("sending pre messages")
      socket.emit("pre messages", messages)
    });

    socket.on("message", userMessage => {
        console.log(userMessage);
        messages.push(userMessage);
        console.log(messages.length);
        io.emit("message", userMessage);
    });
});

server.listen(port, () => console.log("server running on port:" + port));