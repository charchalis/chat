import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import HomeScreen from './screens/HomeScreen';

const AppStack = createStackNavigator({Home: /*FriendListScreen*/ HomeScreen})

export default createAppContainer(
    createSwitchNavigator({
        App: AppStack,
        Join: JoinScreen
    },
    {
        initialRouteName: "Join"
    })
)