package com.codecollab.source.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Document(collection = "problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Problem {
    
    @Id
    private String id;
    
    private String title;
    
    private String description;
    
    @Field("photo_path")
    private String photoPath;
    
    @Field("file_path")
    private String filePath;
    
    @Field("file_name")
    private String fileName;
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    public Problem(String title, String description) {
        this.title = title;
        this.description = description;
        this.createdAt = LocalDateTime.now();
    }
}
