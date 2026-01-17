package com.codecollab.source.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {
    
    @Id
    private String id;
    
    private String category; // OOP, DSA, Web Dev, etc.
    
    private String title;
    
    private String url;
    
    private String description;
}
