import React, {useEffect, useState, Component} from 'react';
import { Text, TextInput, View, Button, ScrollView, TouchableHighlight, Pressable } from 'react-native';
import socket from "../initializeSocket";

const jsxifyConversation = (conversation) => {

    /* useEffect(() => {
        socket.on("message", (message) => {
            if (message.conversationId === conversation.id){
                conversation.lastMessage = message.text;
            }  
        });
    }, []); */

    return(
        <View key={conversation.id}
            style = {{borderBottomWidth: 4, borderColor: '#ffffff'}}>
            <Pressable onPress={() => {socket.emit("get me into conversation", conversation.id)}}>
                <View style={{padding: 7, paddingLeft: 10}}>
                    <Text style={{fontWeight: "bold", fontSize: 15, color: '#ffffff', paddingBottom: 5}}>
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
    }, []);
    
    return(
    <View style={{flex: 1, backgroundColor: "#bebeff", borderColor: "#ffffff"}}>
      <ScrollView>
          <View style = {{borderTopWidth: 3, borderTopColor: "#ffffff"}}>
        {conversations}
        </View>
      </ScrollView>
    </View>
    );
}

export default Conversations;