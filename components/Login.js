import React, {useEffect, useState, Component} from 'react';
import { Text, TextInput, View, Button, ScrollView, TouchableHighlight, Pressable } from 'react-native';
import socket from "../initializeSocket";

const Login = ({navigation}) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [impostor, setImpostor] = useState();

  useEffect(() => {

    socket.on('authenticated', (userId) => {
      navigation.navigate('Conversations', userId);
    });

    socket.on('impostor', () =>{
      setImpostor(<Text>Wrong username-password combo</Text>)
    });

  }, []);
  
  return (
    <View style = {styles.container}>
      <TextInput style={styles.textInput} onChangeText={setUsername}/>
      <TextInput style={styles.textInput} secureTextEntry={true} onChangeText={setPassword}/>
      <Button
        title="Login"
        onPress={() => {
          socket.emit('user data', {username: username, password: password});
        }}
      />
      {impostor}
    </View>
  );
}

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
  }
}

export default Login;