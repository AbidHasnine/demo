package com.codecollab.source.controller;

import com.codecollab.source.dto.CodeSyncMessage;
import com.codecollab.source.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * WebSocket Controller for Real-Time Code Synchronization
 * 
 * This controller enables multiple users to see code changes in real-time
 * as they type in the shared compiler/editor.
 */
@Controller
@RequiredArgsConstructor
public class CodeSyncController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomService roomService;
    
    /**
     * Synchronize code across all users in a specific room
     * Client sends to: /app/code.sync/{roomId}
     * Server broadcasts to: /topic/room/{roomId}/code
     * 
     * When User A types code, it gets sent to this endpoint
     * and broadcasted to all users subscribed to /topic/room/{roomId}/code
     */
    @MessageMapping("/code.sync/{roomId}")
    public void syncCode(@DestinationVariable String roomId, @Payload CodeSyncMessage codeSyncMessage) {
        codeSyncMessage.setRoomId(roomId);

        // Only persist the code to the room if it's a full update
        if (CodeSyncMessage.MessageType.UPDATE.equals(codeSyncMessage.getType())) {
            roomService.updateRoomCode(roomId, codeSyncMessage.getCode(), codeSyncMessage.getLanguage());
        }

        // Broadcast the message (typing status or full update) to all users in the room
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/code", codeSyncMessage);
    }
}
