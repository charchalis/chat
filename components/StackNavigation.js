import Conversations from "./Conversations";
import HomeScreen from "./HomeScreen";
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';


const MyStack = createAppContainer(
  createStackNavigator({
    Conversations: Conversations,
    Home: HomeScreen,
  })
);

export default MyStack;