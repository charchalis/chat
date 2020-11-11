import React, {useEffect, useState, Component} from 'react';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import Login from "./components/Login";
import myStack from "./components/StackNavigation";

const Navigator = createAppContainer(
  createSwitchNavigator({
    Login: Login,
    Stack: myStack,
  })
);

export default function App() {
  return <Navigator/>
}

