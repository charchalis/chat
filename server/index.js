const express = require("express");
const { DEFAULT_MAX_VERSION } = require("tls");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = 3000;

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

    socket.on("gimme pre messages", async () =>{
      const database = mongoClient.db("chat");
      const collection = database.collection("messages");
      messages = await collection.find(true).toArray();
      console.log("sending pre messages")
      socket.emit("pre messages", messages)
    });

    socket.on("message", userMessage => {
      const database = mongoClient.db("chat");
      const collection = database.collection("messages");
      collection.insertOne(userMessage);
      
      console.log(userMessage);
      io.emit("message", userMessage);
    });
});

server.listen(port, () => console.log("server running on port:" + port));