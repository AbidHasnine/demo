package com.codecollab.source.controller;

import com.codecollab.source.dto.ChatMessage;
import com.codecollab.source.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
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
    
    /**
     * Handle incoming chat messages
     * Client sends to: /app/chat.sendMessage
     * Server broadcasts to: /topic/public
     */
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        // Persist the message to database
        if (chatMessage.getType() == ChatMessage.MessageType.CHAT) {
            messageService.saveMessage(chatMessage.getSender(), chatMessage.getContent());
        }
        return chatMessage;
    }
    
    /**
     * Handle user joining the chat
     * Client sends to: /app/chat.addUser
     * Server broadcasts to: /topic/public
     */
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, 
                                SimpMessageHeaderAccessor headerAccessor) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        chatMessage.setType(ChatMessage.MessageType.JOIN);
        return chatMessage;
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
