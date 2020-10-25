import React, {useEffect, useState, Component} from 'react';
import { Text, TextInput, View, Button, ScrollView } from 'react-native';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { GiftedChat } from 'react-native-gifted-chat';
import io from "socket.io-client";

export const socket = io("http://192.168.1.129:3000");

var messages = []
var USERNAME = '';

socket.on('gimme messages', msgs => {
  messages = msgs;
  console.log("thank you");
});

function jsxifyMessage(userMessage, id){
  var backgroundColor = '#1084ff'
  if(userMessage.username === USERNAME){
    backgroundColor = '#cdcdcd'
  }

  return (
    <View key={id} style={[styles.balloon, {backgroundColor: backgroundColor}]} >
      <Text style={{color: '#ffffff'}}>{userMessage.username}: {userMessage.message} </Text>
    </View>
  );
}

const MessagesJsx = () => {
  var id = 0;

  return messages.map((message, id) => {
    id++;
    return jsxifyMessage(message, id);
  });
}

const Login = ({navigation}) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <View style = {styles.container}>
      <TextInput style={styles.textInput} onChangeText={setUsername}/>
      <TextInput style={styles.textInput} secureTextEntry={true} onChangeText={setPassword}/>
      <Button
        title="Login"
        onPress={async () => {
          socket.emit('user data', {username: username, password: password});

          await new Promise(r => setTimeout(r, 200));

          USERNAME = username;

          navigation.navigate('Home', {username: username});
        }}
      />
    </View>
  );
}

function HomescreenMessages(){

  const [msgsJsx, setMsgsJsx] = useState(MessagesJsx()); 

  useEffect(() => {

    socket.on("message", (userMessage) => {
      console.log("Got message from socket: ");
      console.log("username: ", userMessage.username, "message: ", userMessage.message);
      messages.push(userMessage);
      setMsgsJsx(msgsJsx => [...msgsJsx, jsxifyMessage(userMessage, msgsJsx.length + 1)]);
    });

    console.log("messages.length: ", messages.length);
    //console.log("msgsJsx.length: ", msgsJsx.length);
  }, []);

  return (
    <ScrollView>
      { msgsJsx }
    </ScrollView>
  );
}

function HomeScreenInput(username){

  const [message, setMessage] = useState('');
  

  return(
    <View style = {
      {
       flex: 1,
       flexDirection: 'row',
       justifyContent: 'flex-start',
       alignItems: 'flex-end',
      }
      }>
      <TextInput style={[styles.textInput, {flex:3}]} onChangeText={setMessage} value={message} type="reset"/>
      <Button
        title="send"
        styles={{flex:1}}
        onPress={ () => {

          socket.emit("message", {username: username, message: message}); //sended message to server. all devices will now receive the message
          setMessage('');

        }}
      />
    </View>
  )
}

function HomeScreen({ navigation} ) {

  const username =  navigation.state.params.username;

  return (
    <View style = {styles.container}>
        {HomescreenMessages()}
        {HomeScreenInput(username)}
    </View>
  )
}


const Navigator = createAppContainer(
  createSwitchNavigator({
    Login: Login,
    Home: HomeScreen,
  })
);

export default function App() {
  return <Navigator/>
}

//--------------------------------------------------styles---------------------------------------------//

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    minWidth: '50%'
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
    paddingBottom: 15,
    borderRadius: 20,
    margin: 4
 }
}