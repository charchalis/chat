import React, {useEffect, useState, useRef, useLayoutEffect} from 'react';
import { Text, TextInput, View, ScrollView, Pressable } from 'react-native';
import socket from "../initializeSocket";
import styles from "../aesthetic/styles";
import colorPallet from "../aesthetic/colorPallet";

var CONVERSATION_ID;

var USER_ID;

var NAMES_DICT = {};

function jsxifyMessage(userMessage){
  
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

    console.log("\nconversationId: ", CONVERSATION_ID);

    socket.on('pre messages', msgs => {
      setMsgsJsx(MessagesJsx(msgs));
    });

    console.log("\nyo, server, gimme pre messages")
    socket.emit("gimme pre messages", CONVERSATION_ID);

    socket.on("message", (userMessage) => {
      console.log("\nGot message from socket:");
      console.log("id: ", userMessage.id, "\nconversation id: ", CONVERSATION_ID, "\nuserId: ", userMessage.userId, "\ntext: ", userMessage.text, "\ndate: ", userMessage.date);
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
  
  var buttonColor = "#555555";

  return(
    <View style = {
      {
       flex: 1,
       flexDirection: 'row',
       alignItems: 'flex-end',
       minHeight: 42,
       maxHeight: 42,
       flexShrink: 1,
       paddingRight: 5,
       backgroundColor: colorPallet.color1
      }
      }>
      <TextInput style={[styles.textInput, {flex: 1, backgroundColor: colorPallet.color4, color: "#ffffff"}]} onChangeText={setMessage} value={message} type="reset"/>
      
        <Pressable style={({pressed}) => [styles.messageButton, {backgroundColor: pressed ? "#333333": "#555555", margin: 4}]}
          onPress={ () => {

            var d = new Date();
            var h = d.getHours();
            var m = d.getMinutes();
            if(h<10) h = "0" + h;
            if(m<10) m = "0" + m;
            var date = h + ":" + m;

            socket.emit("message", {conversationId: CONVERSATION_ID, userId: USER_ID, text: message, date : date}); //sended message to server. all devices will now receive the message
            setMessage('');
          }}>
          <View style={{}}>
            <Text></Text>
          </View>
        </Pressable>
    </View>
  )
}

function HomeScreen({navigation}) {
  CONVERSATION_ID = navigation.state.params.conversationId;
  //console.log("NAVIGATION STATE: ", navigation);

  useEffect(() => {
    socket.on("user", (userId) => {
      USER_ID = userId;
    });
    
    socket.emit("gimme user id");

    return () => {
      socket.off("user");
      socket.off("usersInfo");
      socket.off("pre messages");
      socket.off("message");
    }
  }, []);

  return (
    <View style = {[styles.container, {flexDirection: "column", justifyContent: "flex-end", backgroundColor: colorPallet.color3}]}>
      {/* <ImageBackground source={{uri: "https://i.pinimg.com/736x/36/dc/05/36dc059bae1fe527968efb51521ac514.jpg"}} style={{flex: 1,  justifyContent: "flex-end"}}> */}
        {HomescreenMessages()}
        {HomeScreenInput()}
      {/* </ImageBackground> */}
    </View>
  )
}


export default HomeScreen;