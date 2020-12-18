import React, {useEffect, useState, Component} from 'react';
import { Text, View, ScrollView, Pressable } from 'react-native';
import colorPallet from '../aesthetic/colorPallet';
import socket from "../initializeSocket";

const jsxifyConversation = (conversation) => {

    /* useEffect(() => {
        socket.on("message", (message) => {
            if (message.conversationId === conversation.id){
                conversation.lastMessage = message.text;
            }  
        });

        return () => {socket.off("message")}
    }, []); */

    return(
        <View key={conversation.id}
            style = {{borderBottomWidth: 2, borderColor: colorPallet.color3}}>
            <Pressable style = {({pressed}) => [{backgroundColor: pressed ? "#7a7a7a": "#9c9c9c"}]}
                        onPress={() => {socket.emit("get me into conversation", conversation.id)}}>
                <View style={{padding: 7, paddingLeft: 10}}>
                    <Text style={{fontWeight: "bold", fontSize: 15, color: colorPallet.color3, paddingBottom: 5}}>
                        {conversation.name}
                    </Text>
                    <Text style={{color: '#ffffff', paddingBottom: 4}}>
                        {conversation.lastMessage}</Text>
                </View>
            </Pressable>
        </View>
    );
}
  
const ConversationsJsx = (conversations) => {
    return conversations.map((conversation) => {
        return jsxifyConversation(conversation);
    });
}
  
const Conversations = ({navigation}) => {

    const [conversations, setConversations] = useState();
  
    useEffect(() => {

        socket.on("conversations", conversations => {
            setConversations(ConversationsJsx(conversations));
        });
    
        socket.emit("gimme conversations");

        socket.on('conversation pass', (conversationId) => { //THIS IS FUCKING DISGUSTING AND YOU SHOULD BE ASHAMED OF YOURSELF
            navigation.navigate('Home', {conversationId: conversationId});
        });

        return () => {
            socket.off("conversations");
            socket.off("conversation pass");
        };
    }, []);
    
    return(
    <View style={{flex: 1 , backgroundColor: "#555555"}}>
      <ScrollView>
          <View style = {{}}>
        {conversations}
        </View>
      </ScrollView>
    </View>
    );
}

export default Conversations;