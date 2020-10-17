import React, {useState} from 'react';
import { Text, TextInput, View, Button } from 'react-native';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import io from "socket.io-client";

const socket = io("http://192.168.1.129:3000");

var messages = []

socket.on('gimme messages', msgs => {
  messages = msgs;
});

socket.emit('gimme messages');

socket.on("user message", userMessage => {
  console.log("Got message from socket: ");
  console.log(userMessage);
  messages.push(userMessage);
});

function jsxifyMessage(userMessage){
  console.log("made it here");
  return (
    <Text key={userMessage.message}> username: {userMessage.username}, message: {userMessage.message} </Text>
  );
}

const MessagesJsx = () => {
  return messages.map((message) => {
    return jsxifyMessage(message)
  })
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
        onPress={() => {
          socket.emit('user data', {username: username, password: password});

          navigation.navigate('Home', {username: username});
        }}
      />
    </View>
  );
}


function HomeScreen({ navigation} ) {

  const [message, setMessage] = useState('');

  const username =  navigation.state.params.username;

  return (
    <View style = {styles.container}>
      {MessagesJsx()}
      <TextInput style={styles.textInput} onChangeText={setMessage} type="reset"/>
      <Button
        title="send"
        onPress={() => {

          const userMessage = {username: username, message: message}

          socket.emit('user message', {username: username, message: message});

          messages.push(userMessage);

          setMessage('');
        }}
      />
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
  }
}