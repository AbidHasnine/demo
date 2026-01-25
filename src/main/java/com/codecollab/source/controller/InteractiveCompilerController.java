package com.codecollab.source.controller;

import com.codecollab.source.dto.ExecuteCodeRequest;
import com.codecollab.source.service.CompilerService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class InteractiveCompilerController {

    private final CompilerService compilerService;
    private final SimpMessagingTemplate messagingTemplate;

    public InteractiveCompilerController(CompilerService compilerService, SimpMessagingTemplate messagingTemplate) {
        this.compilerService = compilerService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/compiler/execute")
    public void execute(@Payload ExecuteCodeRequest request, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        compilerService.executeInteractive(request.getCode(), request.getLanguage(), sessionId, (output) -> {
            messagingTemplate.convertAndSendToUser(sessionId, "/topic/compiler/output", output);
        });
    }

    @MessageMapping("/compiler/input")
    public void input(@Payload String input, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        compilerService.sendInput(sessionId, input);
    }
}
