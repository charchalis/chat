import React, {useEffect, useState, useRef, Component} from 'react';
import { Text, TextInput, View, Button, ScrollView, TouchableHighlight, Pressable } from 'react-native';
import socket from "../initializeSocket";

var CONVERSATION_ID;

var USER_ID;

var NAMES_DICT = {};

function jsxifyMessage(userMessage){

  console.log("userMessage.id: ", userMessage.id);
  
  var messageCss = styles.othersText;
  var othersName = <Text style={{fontWeight: "bold", fontSize: 14, color: '#555555'}}>{NAMES_DICT[userMessage.userId]}</Text>;
  var TextPosition = {alignSelf: "flex-start"}

  if(userMessage.userId === USER_ID){
    messageCss = styles.myText;
    othersName = null;
    TextPosition = {alignSelf: "flex-end"}
  }
  
  return (
    <View key={userMessage.id} style={[styles.balloon, messageCss ,{flexDirection: "row"}]} >
      <View style ={{flexShrink: 1}}>  
          {othersName}
          <Text style={[TextPosition, {fontSize: 16, color: "#ffffff"}]}>{userMessage.text}</Text>
          <Text style={{alignSelf: "flex-end", fontSize: 10, color: '#eeeeee'}}> {userMessage.date} </Text>
      </View>
      {/* <View style={{flexDirection: 'column-reverse'}}>  
            <Text style={{fontSize: 10, color: '#eeeeee'}}> {userMessage.date} </Text>
          </View> */}
    </View>
  );
}

const MessagesJsx = (messages) => {
  console.log(messages);
  return messages.map((message) => {
    return jsxifyMessage(message);
  });
}

function HomescreenMessages(){

  const [msgsJsx, setMsgsJsx] = useState(); 

  const scrollViewRef = useRef();

  useEffect(() => {

    socket.on("users info", (users) => {
      users.forEach((user) => {
        NAMES_DICT[user.id] = user.username;
      });
    });

    socket.emit("gimme users info", CONVERSATION_ID);

    console.log("conversationId: ", CONVERSATION_ID);

    socket.on('pre messages', msgs => {
      console.log("PRE MESSAGES: ", msgs);
      setMsgsJsx(MessagesJsx(msgs));
    });

    console.log("yo, server, gimme pre messages")
    socket.emit("gimme pre messages", CONVERSATION_ID);
    console.log("thank you");

    socket.on("message", (userMessage) => {
      console.log("Got message from socket: ");
      console.log("id: ", userMessage.id, "conversation id: ", CONVERSATION_ID, "userId: ", userMessage.userId, "text: ", userMessage.text, "date: ", userMessage.date);
      setMsgsJsx(msgsJsx => [...msgsJsx, jsxifyMessage(userMessage)]);
    });
  }, []);

  return (
    <View style={{marginTop: 40}} >
      <ScrollView ref={scrollViewRef }
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}>
        { msgsJsx }
      </ScrollView>
    </View>
  );
}

function HomeScreenInput(){

  const [message, setMessage] = useState('');
  
  return(
    <View style = {
      {
       flex: 1,
       flexDirection: 'row',
       alignItems: 'flex-end',
       minHeight: 40,
       margin: 2,
      }
      }>
      <TextInput style={[styles.textInput, {width: '80%'}]} onChangeText={setMessage} value={message} type="reset"/>
      <View style={styles.messageButton}>
        <Button
          title="send"
          onPress={ () => {

            var d = new Date();
            var h = d.getHours();
            var m = d.getMinutes();
            if(h<10) h = "0" + h;
            if(m<10) m = "0" + m;
            var date = h + ":" + m;

            socket.emit("message", {conversationId: CONVERSATION_ID, userId: USER_ID, text: message, date : date}); //sended message to server. all devices will now receive the message
            setMessage('');

          }}
        />
      </View>
    </View>
  )
}

function HomeScreen({navigation}) {
  CONVERSATION_ID = navigation.state.params.conversationId;
  console.log("FDSDGAFDAGFDS: ", navigation.state);

  useEffect(() => {
    socket.on("user", (userId) => {
      USER_ID = userId;
      console.log("hello?");
    });
    
    socket.emit("gimme user id");
  }, []);

  return (
    <View style = {[styles.container, {flexDirection: "column", justifyContent: "flex-end"}]}>
      <View style = {{/*flexDirection: 'column', justifyContent: 'center' ,  alignItems: 'stretch' */}}>
        {HomescreenMessages()}
      </View>
        {HomeScreenInput()}
    </View>
  )
}

//--------------------------------------------------styles---------------------------------------------//

const styles = {
    container: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'center'
    },
    textInput: {
      height: 37,
      margin: 2,
      padding: 10,
      backgroundColor: 'white',
      borderColor: 'dodgerblue',
      borderWidth: 1,
      borderRadius: 20,
    },
    messageButton: {
      flex: 1,
      alignItems: 'stretch',
      margin: 2,
      height: 37,
      borderRadius: 20,
    },
    balloon: {
      paddingHorizontal: 15,
      paddingTop: 6,
      paddingBottom: 5,
      borderRadius: 20,
      margin: 4
    },
    myText: {
      backgroundColor: '#bebebe',
      alignSelf:'flex-end',
      marginLeft: "15%"
    },
    othersText: {
      backgroundColor: '#9c9c9c',
      alignSelf:'flex-start',
      marginRight: "15%"
    },
  }

export default HomeScreen;