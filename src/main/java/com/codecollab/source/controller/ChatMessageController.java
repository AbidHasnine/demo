package com.codecollab.source.controller;

import com.codecollab.source.dto.ChatMessage;
import com.codecollab.source.dto.CodeSyncMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * WebSocket Chat Message Controller
 * Handles chat messages in collaboration rooms
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatMessageController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {

        //This is for terminal debugging
        log.info("Chat message from {}: {}", chatMessage.getSender(), chatMessage.getContent());

        //Toggles type in Chat message object
        chatMessage.setType(ChatMessage.MessageType.CHAT);

        //returns the message to the specific page where all the users are
        return chatMessage;
    }

    @MessageMapping("/chat.sendRoomMessage")
    public void sendRoomMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        log.info("Room chat message from {} in room {}: {}", 
            chatMessage.getSender(), chatMessage.getRoomId(), chatMessage.getContent());
        chatMessage.setType(ChatMessage.MessageType.CHAT);
        
        // Send message to room-specific topic for all users in that room
        String destination = "/topic/room/" + chatMessage.getRoomId();

        log.info("Broadcasting to destination: {}", destination);
        messagingTemplate.convertAndSend(destination, chatMessage);
        log.info("Message broadcast complete");
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String username = chatMessage.getSender();
        headerAccessor.getSessionAttributes().put("username", username);


        log.info("User joined: {}", username);
        chatMessage.setType(ChatMessage.MessageType.JOIN);
        return chatMessage;
    }

    @MessageMapping("/chat.addRoomUser")
    public void addRoomUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String username = chatMessage.getSender();
        String roomId = chatMessage.getRoomId();
        
        headerAccessor.getSessionAttributes().put("username", username);
        headerAccessor.getSessionAttributes().put("roomId", roomId);
        
        log.info("User {} joined room {}", username, roomId);
        chatMessage.setType(ChatMessage.MessageType.JOIN);
        
        // Notify all users in the room about the new user
        String destination = "/topic/room/" + roomId;
        messagingTemplate.convertAndSend(destination, chatMessage);
    }

    //FE to codeSyncMessage
    @MessageMapping("/code.sync")
    public void syncCode(@Payload CodeSyncMessage codeSyncMessage, SimpMessageHeaderAccessor headerAccessor) {
        String sender = codeSyncMessage.getSender();
        String roomId = codeSyncMessage.getRoomId();
        
        log.info("Code sync from {} in room {}, type: {}", sender, roomId, codeSyncMessage.getType());
        
        // Broadcast the code update to all users in the room (including sender for consistency)
        String destination = "/topic/code/" + roomId;
        messagingTemplate.convertAndSend(destination, codeSyncMessage);
    }
}
