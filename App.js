import React, {useEffect, useState, Component} from 'react';
import { Text, TextInput, View, Button, ScrollView, TouchableHighlight } from 'react-native';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import io from "socket.io-client";

export const socket = io("http://94.60.179.181:3000");


var USERNAME = '';

function jsxifyMessage(userMessage){
  var backgroundColor = '#1084ff'
  if(userMessage.username === USERNAME){
    backgroundColor = '#bebebe'
  }

  return (
    <View key={userMessage._id} style={[styles.balloon, {backgroundColor: backgroundColor}]} >
      <View>  
        <Text style={{color: '#ffffff'}}>{userMessage.username}: {userMessage.message} </Text>
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
      navigation.navigate('Home', {username: USERNAME});
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

function HomescreenMessages(){

  const [msgsJsx, setMsgsJsx] = useState(); 

  useEffect(() => {

    socket.on('pre messages', msgs => {
      setMsgsJsx(MessagesJsx(msgs));
    });

    console.log("yo, server, gimme pre messages")
    socket.emit("gimme pre messages");
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

function HomeScreenInput(username){

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

            if(message === '') setMessage('FSAC');

            console.log("coño maricon: ", message);

            socket.emit("message", {username: username, message: message, date : date}); //sended message to server. all devices will now receive the message
            setMessage('');

          }}
        />
      </View>
    </View>
  )
}

function HomeScreen({ navigation} ) {

  const username =  navigation.state.params.username;

  return (
    <View style = {[styles.container, {flexDirection: "column", justifyContent: "flex-end"}]}>
      <View style = {{flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch'}}>
        {HomescreenMessages()}
      </View>
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
