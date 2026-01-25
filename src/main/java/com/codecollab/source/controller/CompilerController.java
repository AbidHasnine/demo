package com.codecollab.source.controller;

import com.codecollab.source.dto.ExecuteCodeRequest;
import com.codecollab.source.dto.ExecuteCodeResponse;
import com.codecollab.source.service.CompilerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compiler")
@RequiredArgsConstructor
public class CompilerController {

    private final CompilerService compilerService;

    @PostMapping("/execute")
    public ResponseEntity<ExecuteCodeResponse> executeCode(@RequestBody ExecuteCodeRequest request) {
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ExecuteCodeResponse("Code cannot be empty", true));
        }
        
        // Default to cpp if no language specified
        String language = request.getLanguage() != null ? request.getLanguage() : "cpp";
        String input = request.getInput() != null ? request.getInput() : "";
        
        ExecuteCodeResponse response = compilerService.executeCode(request.getCode(), language, input);
        return ResponseEntity.ok(response);
    }
}
