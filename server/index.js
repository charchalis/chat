const { SSL_OP_NO_TICKET } = require("constants");
const express = require("express");
const { DEFAULT_MAX_VERSION } = require("tls");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = 3000;

/*---------------------------MONGO DB-------------------------*/

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('test.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

/* db.all('select * from user where username = ? and password = ?', "Miro", "boavista", (err, rows) => {
  rows.forEach((row) => {
    console.log("row: ", row);
  });
}); */

/* db.run(`INSERT INTO User VALUES(?, ?, ?)`, 6,"Miro", "boavista", function(err) {
  if (err) {
    return console.log(err.message);
  }
  // get the last insert id
  console.log(`A row has been inserted with rowid ${this.lastID}`);
}); */

/* db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
}); */

/*---------------------------SOCKET-------------------------*/

io.on("connection", socket => {
    
  console.log("a user connected :D");

    
  /*----------LOGIN----------*/
  socket.on("user data", userData => {
    console.log(userData);

    db.all('select * from user where username = ? and password = ?', userData.username, userData.password, (err, rows) => { 
        if(rows.length == 0){
          console.log("wrong username-password combo");
          socket.emit('impostor');
        }
        else{
          console.log("valid username-password combo");
          console.log(rows[0]);
          socket.emit("authenticated", userData.username)
        }
      });
  });
  
  /*----------GET CONVERSATIONS----------*/
  socket.on("gimme conversations", (username) => {
    console.log("sending conversations...")

    const querry = 'select conversation.* from conversation, conversationuser, user where(conversationuser.userId = user.id and conversationuser.conversationId = conversation.id and user.username = ?)';
    
    db.all(querry, username, (err, conversations) => {
      console.log("converesations: ", conversations)
      socket.emit('conversations', conversations);
    });
  });

  socket.on('get me into conversation', (id) => { //DDDDDDDIIIIIISSSSSGGGGGUUUUUUSSSSSSTTTTTAAAANNNNGGGG
    socket.emit('conversation pass', id);
  })

  /*----------GET PRE MESSAGES----------*/
  socket.on("gimme pre messages", (conversationId) =>{
    db.all('select * from message where conversationId = ?', conversationId, (err, messages) => {
      console.log(messages);
      console.log("sending pre messages");
      socket.emit("pre messages", messages);
    })
  });


  /*----------SEND NEW MESSAGE----------*/
  socket.on("message", userMessage => {
    
    console.log(userMessage);
    //io.emit("message", userMessage);
  });
});

server.listen(port, () => console.log("server running on port:" + port));