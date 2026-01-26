package com.codecollab.source.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Problem {
    
    @Id
    private String id;
    
    private String title;
    
    private String description;
    
    @Field("username")
    private String username;
    
    @Field("user_id")
    private String userId;
    
    @Field("photo_path")
    private String photoPath;
    
    @Field("file_path")
    private String filePath;
    
    @Field("file_name")
    private String fileName;
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @Field("solutions")
    private List<String> solutionIds = new ArrayList<>();
    
    public Problem(String title, String description) {
        this.title = title;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.solutionIds = new ArrayList<>();
    }
}
