import React, {useEffect, useState} from 'react';
import { Text, TextInput, View, Button } from 'react-native';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { GiftedChat } from 'react-native-gifted-chat';
import io from "socket.io-client";

export const socket = io("http://192.168.1.129:3000");

var messages = []

socket.on('gimme messages', msgs => {
  messages = msgs;
  console.log("thank you");
});

function jsxifyMessage(userMessage, id){
  return (
    <Text key={id}> username: {userMessage.username}, message: {userMessage.message} </Text>
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

          navigation.navigate('Home', {username: username});
        }}
      />
    </View>
  );
}

function HomescreenMessages(){

  console.log("JESUS FUCKING CHRIST WHATAFUCK");

  const [msgsJsx, setMsgsJsx] = useState(MessagesJsx());
  
  socket.on("message", (userMessage) => {
    console.log("Got message from socket: ");
    console.log("username: ", userMessage.username, "message: ", userMessage.message);
    messages.push(userMessage);
    setMsgsJsx([...msgsJsx, jsxifyMessage(userMessage, msgsJsx.length + 1)]);
    console.log("ping");
  });

  useEffect(() => {
    console.log("pong");

    console.log("messages.length: ", messages.length);
    //console.log("msgsJsx.length: ", msgsJsx.length);
  });

  return (
    <View>
      {msgsJsx}
    </View>
  )
}


function HomeScreen({ navigation} ) {

  const [message, setMessage] = useState('');

  const username =  navigation.state.params.username;

  return (
    <View style = {styles.container}>
      <View>
        {HomescreenMessages()}
      </View>
      <View>
        <TextInput style={styles.textInput} onChangeText={setMessage} type="reset"/>
        <Button
          title="send"
          onPress={async () => {

            socket.emit("message", {username: username, message: message}); //sended message to server. it will now receive message and push it to message array
            
            await new Promise(r => setTimeout(r, 200));

          }}
        />
      </View>
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