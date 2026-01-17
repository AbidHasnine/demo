package com.codecollab.source.controller;

import com.codecollab.source.dto.CodeSyncMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

/**
 * WebSocket Controller for Real-Time Code Synchronization
 * 
 * This controller enables multiple users to see code changes in real-time
 * as they type in the shared compiler/editor.
 */
@Controller
public class CodeSyncController {
    
    /**
     * Synchronize code across all connected users
     * Client sends to: /app/code.sync
     * Server broadcasts to: /topic/code
     * 
     * When User A types code, it gets sent to this endpoint
     * and broadcasted to all users subscribed to /topic/code
     */
    @MessageMapping("/code.sync")
    @SendTo("/topic/code")
    public CodeSyncMessage syncCode(@Payload CodeSyncMessage codeSyncMessage) {
        return codeSyncMessage;
    }
}
