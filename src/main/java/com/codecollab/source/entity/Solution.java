package com.codecollab.source.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "solutions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Solution {
    
    @Id
    private String id;
    
    @Field("problem_id")
    private String problemId;
    
    @Field("username")
    private String username;
    
    @Field("user_id")
    private String userId;
    
    @Field("title")
    private String title;
    
    @Field("content")
    private String content;
    
    @Field("is_accepted")
    private boolean isAccepted;
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
    
    public Solution(String problemId, String username, String userId, String title, String content) {
        this.problemId = problemId;
        this.username = username;
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.isAccepted = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
