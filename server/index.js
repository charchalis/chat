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

  var USER = {};
  var CONVERSATION_USERS =[];
    
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
          
          USER = {id: rows[0].id, username: rows[0].username}
          
          console.log("USER: ", USER);
          
          socket.emit("authenticated", USER.id);
        }
      });
  });

  socket.on("gimme user id", () => {
    socket.emit("user", USER.id);
  })
  
  /*----------GET CONVERSATIONS----------*/
  socket.on("gimme conversations", () => {
    console.log("sending conversations...")

    const querry = 'select conversation.* from conversation, conversationuser ' +
                  'where(conversationuser.userId = ? ' + 
                  'and conversationuser.conversationId = conversation.id)';
    
    console.log("user.id: ", USER.id);

    db.all(querry, USER.id, (err, conversations) => {
      console.log("conversations: ", conversations)
      socket.emit('conversations', conversations);
    });
  });

  socket.on('get me into conversation', (conversationId) => { //DDDDDDDIIIIIISSSSSGGGGGUUUUUUSSSSSSTTTTTAAAANNNNGGGG
    console.log("conversationID: ", conversationId);
    socket.emit('conversation pass', conversationId);
  })

  socket.on('gimme users info', (conversationId) => {

    var querry = 'select user.id, user.username from user, conversationUser ' +
                  'where conversationUser.conversationId = ? and conversationUser.userId = user.id';

    db.all(querry, conversationId, (err, usersDb) => {
      
      var users = [];

      console.log("usersDB: ", usersDb);
      
      usersDb.forEach((user) => {
        console.log("user: ", user);
        users.push(user);
      });

      console.log("users: ", users);

      socket.emit("users info", users);
    });
  });

  /*----------GET PRE MESSAGES----------*/
  socket.on("gimme pre messages", (conversationId) =>{
    console.log("conversationID: ", conversationId);
    db.all('select id, userId, text, date from message where conversationId = ?', conversationId, (err, messages) => {
      console.log("sending pre messages");
      socket.emit("pre messages", messages);
    })
  });


  /*----------SEND NEW MESSAGE----------*/
  socket.on("message", userMessage => {
    
    console.log(userMessage);

    db.all('select MAX(id) from message', (err, topMessageId) => {

      userMessageId = topMessageId[0]['MAX(id)'] + 1;

      console.log(userMessageId);

      userMessage.id = userMessageId;

      db.run(`INSERT INTO Message VALUES(?, ?, ?, ?, ?)`,
            userMessage.id, userMessage.conversationId, userMessage.userId, userMessage.text, userMessage.date, function(err) {
      if (err) {
        console.log("ERROR");
        console.log(err.message);
      }
      else{
        console.log('message inserted into database');
        io.emit("message", userMessage);
      }
    });
    });
  });
});

server.listen(port, () => console.log("server running on port:" + port));