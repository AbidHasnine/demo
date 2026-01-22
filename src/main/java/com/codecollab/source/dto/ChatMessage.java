package com.codecollab.source.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String sender;
    private String content;
    private MessageType type;
    private String roomId;  // Room ID for room-based messaging
    
    public enum MessageType {
        CHAT, JOIN, LEAVE
    }
}
