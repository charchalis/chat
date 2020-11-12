import React from 'react';
import {View, Button, TextInput, Pressable, Text, Image} from 'react-native';
import Conversations from "./Conversations";
import HomeScreen from "./HomeScreen";
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import styles from "../aesthetic/styles";
import colorPallet from "../aesthetic/colorPallet";


const MyStack = createAppContainer(
  createStackNavigator({
    Conversations: {
      screen: Conversations,
      navigationOptions: {
        title: 'Chat List',
        headerStyle: {
          backgroundColor: colorPallet.color1,
        },
        headerTintColor: colorPallet.color3,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <View style = {{flexDirection: "row", alignItems: "stretch", margin: 10}}>
            <TextInput style={[styles.textInput, {width: "100%", backgroundColor: "#ffffff"}]}>this not working</TextInput>
            <Pressable>
              <View style={[styles.messageButton, {width: "100%", marginRight: 20, alignItems:"center", flex: 1,justifyContent: "center"}]}>
                <Text>       </Text>
              </View>
            </Pressable>
          </View>
        ),
      },
    },
    Home: {
      screen: HomeScreen,
      navigationOptions: {
        title: "chat",
        headerStyle: {
          backgroundColor: colorPallet.color1,
        },
        headerTintColor: colorPallet.color3,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      },
    }
  })
);

export default MyStack;