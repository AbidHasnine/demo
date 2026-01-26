package com.codecollab.source.dto;

import com.codecollab.source.entity.Solution;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolutionResponse {
    private String id;
    private String problemId;
    private String username;
    private String userId;
    private String title;
    private String content;
    private boolean isAccepted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public SolutionResponse(Solution solution) {
        this.id = solution.getId();
        this.problemId = solution.getProblemId();
        this.username = solution.getUsername();
        this.userId = solution.getUserId();
        this.title = solution.getTitle();
        this.content = solution.getContent();
        this.isAccepted = solution.isAccepted();
        this.createdAt = solution.getCreatedAt();
        this.updatedAt = solution.getUpdatedAt();
    }
}
