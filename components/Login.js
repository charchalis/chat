import React, {useEffect, useState, Component} from 'react';
import { Text, TextInput, View, Button, ScrollView, TouchableHighlight, Pressable, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import socket from "../initializeSocket";
import colorPallet from '../aesthetic/colorPallet';

const Login = ({navigation}) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [impostor, setImpostor] = useState();

  const [waiting, setWaiting] = useState(true);

  useEffect(() => {

    //cookies

    //AsyncStorage.clear();

    AsyncStorage.getItem('userCookies', (err, userJson) => {
      console.log("cookies: ", userJson);
      const user = JSON.parse(userJson);
      if(userJson){
        //navigation.navigate('Conversations', user.id);
        socket.emit("cookiePass", user);
      }else{
        setWaiting(false)
      }
    });

    socket.on('authenticated', (user) => {

      console.log("fjdlksajfldçsajf: ", user);

      //saving cookies
      AsyncStorage.setItem(
        'userCookies',
        JSON.stringify(user)
      );

      navigation.navigate('Conversations', user.id);
    });

    socket.on('impostor', () =>{
      setImpostor(<Text>Wrong username-password combo</Text>)
    });

  }, []);
  
  return waiting ? (
    <View style = {styles.container, {flexDirection: "row", flex: 1, justifyContent: "space-around", backgroundColor: colorPallet.color3}}>
      <ActivityIndicator size="large" color={colorPallet.color1}/>
    </View>
    ):(
    <View style = {[styles.container, {backgroundColor: colorPallet.color3}]}>
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
    //alignItems: 'stretch',
    justifyContent: 'center'
  },
  textInput: {
    height: 37,
    margin: 2,
    padding: 10,
    backgroundColor: colorPallet.color1,
    borderColor: colorPallet.color2,
    borderWidth: 1,
    borderRadius: 20,
  }
}

export default Login;