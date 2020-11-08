import React, {useEffect, useState, Component} from 'react';
import { Text, TextInput, View, Button, ScrollView, TouchableHighlight, Pressable } from 'react-native';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import io from "socket.io-client";

export const socket = io("http://192.168.1.129:3000");


var USERNAME = '';


function jsxifyMessage(userMessage){
  var backgroundColor = '#1084ff'
  if(userMessage.username === USERNAME){
    backgroundColor = '#bebebe'
  }

  return (
    <View key={userMessage.id} style={[styles.balloon, {backgroundColor: backgroundColor}]} >
      <View>  
        <Text style={{color: '#ffffff'}}>{userMessage.username}: {userMessage.text} </Text>
      </View>
      <View style={{flex: 1, flexDirection: 'row-reverse'}}>  
        <Text style={{fontSize: 12, color: '#eeeeee'}}> {userMessage.date} </Text>
      </View>
    </View>
  );
}

const MessagesJsx = (messages) => {
  console.log(messages);
  return messages.map((message) => {
    return jsxifyMessage(message);
  });
}

const Login = ({navigation}) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [impostor, setImpostor] = useState();

  useEffect(() => {

    socket.on('authenticated', usrname => {
      USERNAME = usrname;
      navigation.navigate('Conversations');
    });

    socket.on('impostor', () =>{
      setImpostor(<Text>Wrong username-password combo</Text>)
    });

  });
  
  return (
    <View style = {styles.container}>
      <TextInput style={styles.textInput} onChangeText={setUsername}/>
      <TextInput style={styles.textInput} secureTextEntry={true} onChangeText={setPassword}/>
      <Button
        title="Login"
        onPress={async () => {
          socket.emit('user data', {username: username, password: password});
        }}
      />
      {impostor}
    </View>
  );
}

function HomescreenMessages(conversationId){

  const [msgsJsx, setMsgsJsx] = useState(); 

  useEffect(() => {

    socket.on('pre messages', msgs => {
      setMsgsJsx(MessagesJsx(msgs));
    });

    console.log("yo, server, gimme pre messages")
    socket.emit("gimme pre messages", conversationId);
    console.log("thank you");

    socket.on("message", (userMessage) => {
      console.log("Got message from socket: ");
      console.log("username: ", userMessage.username, "message: ", userMessage.message, "date: ", userMessage.date);
      setMsgsJsx(msgsJsx => [...msgsJsx, jsxifyMessage(userMessage, msgsJsx.length + 1)]);
    });
  }, []);

  return (
    <View style={{marginTop: 40, alignSelf: 'stretch'}} >
      <ScrollView ref={ref => scrollView = ref }
        onContentSizeChange={() => scrollView.scrollToEnd({ animated: true })}>
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

            socket.emit("message", {username: USERNAME, message: message, date : date}); //sended message to server. all devices will now receive the message
            setMessage('');

          }}
        />
      </View>
    </View>
  )
}

function HomeScreen({navigation}) {

  const conversationId = navigation.state.params.id;

  return (
    <View style = {[styles.container, {flexDirection: "column", justifyContent: "flex-end"}]}>
      <View style = {{flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch'}}>
        {HomescreenMessages(conversationId)}
      </View>
        {HomeScreenInput()}
    </View>
  )
}

const jsxifyConversation = (conversation) => {

  return(
    <View key={conversation.id}  style = {{borderWidth: 1, borderColor: '#000000'}}>
      <Pressable onPress={() => {socket.emit("get me into conversation", conversation.id)}}>
        <Text>{conversation.name}</Text>
        <Text>{conversation.lastMessage}</Text>
      </Pressable>
    </View>
  );
}

const ConversationsJsx = (conversations) => {
  return conversations.map((conversation) => {
    return jsxifyConversation(conversation);
  });
}

const Conversations = ({navigation}) => {

  const [conversations, setConversations] = useState();

  useEffect(() => {

    socket.on("conversations", conversations => {
      setConversations(ConversationsJsx(conversations));
    });

    socket.on('conversation pass', (id) => { //THIS IS FUCKING DISGUSTING AND YOU SHOULD BE ASHAMED OF YOURSELF
      console.log("id: ", id);
      navigation.navigate('Home', {id: id});
    })

    socket.emit("gimme conversations", USERNAME);
  }, []);
  
  return(
    <ScrollView>
      {conversations}
    </ScrollView>
  );
}


const Navigator = createAppContainer(
  createSwitchNavigator({
    Login: Login,
    Home: HomeScreen,
    Conversations: Conversations,
  })
);

export default function App() {
  return <Navigator/>
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
  myText: {
    alignItems: 'right'
  },
  othersText: {
    alignItems: 'left'
  },
  balloon: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    borderRadius: 20,
    margin: 4
  }
}
