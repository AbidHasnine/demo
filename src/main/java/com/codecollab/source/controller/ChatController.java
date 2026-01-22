package com.codecollab.source.controller;

import com.codecollab.source.dto.ChatMessage;
import com.codecollab.source.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * WebSocket Controller for Real-Time Chat
 * 
 * @MessageMapping: Defines the endpoint that clients send messages to (prefixed with /app)
 * @SendTo: Broadcasts the message to all subscribers of the specified topic
 */
@Controller
@RequiredArgsConstructor
public class ChatController {
    
    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Handle incoming chat messages for a specific room
     * Client sends to: /app/chat.sendMessage/{roomId}
     * Server broadcasts to: /topic/room/{roomId}/chat
     */
    @MessageMapping("/chat.sendMessage/{roomId}")
    public void sendMessage(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {
        chatMessage.setRoomId(roomId);
        // Persist the message to database
        if (chatMessage.getType() == ChatMessage.MessageType.CHAT) {
            messageService.saveMessage(chatMessage.getSender(), chatMessage.getContent());
        }
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/chat", chatMessage);
    }
    
    /**
     * Handle user joining a room
     * Client sends to: /app/chat.addUser/{roomId}
     * Server broadcasts to: /topic/room/{roomId}/chat
     */
    @MessageMapping("/chat.addUser/{roomId}")
    public void addUser(@DestinationVariable String roomId, 
                        @Payload ChatMessage chatMessage, 
                        SimpMessageHeaderAccessor headerAccessor) {
        // Add username and roomId in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        headerAccessor.getSessionAttributes().put("roomId", roomId);
        chatMessage.setType(ChatMessage.MessageType.JOIN);
        chatMessage.setRoomId(roomId);
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/chat", chatMessage);
    }
    
    /**
     * Handle user leaving a room
     * Client sends to: /app/chat.leaveRoom/{roomId}
     * Server broadcasts to: /topic/room/{roomId}/chat
     */
    @MessageMapping("/chat.leaveRoom/{roomId}")
    public void leaveRoom(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {
        chatMessage.setType(ChatMessage.MessageType.LEAVE);
        chatMessage.setRoomId(roomId);
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/chat", chatMessage);
    }
    
    /**
     * REST endpoint to get chat history
     */
    @GetMapping("/api/messages")
    @ResponseBody
    public Object getChatHistory() {
        return messageService.getAllMessages();
    }
}
