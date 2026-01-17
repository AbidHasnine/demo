package com.codecollab.source.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Document(collection = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    
    @Id
    private String id;
    
    private String sender;
    
    private String content;
    
    @Field("sent_at")
    private LocalDateTime sentAt;
    
    public Message(String sender, String content) {
        this.sender = sender;
        this.content = content;
        this.sentAt = LocalDateTime.now();
    }
}
