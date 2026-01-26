package com.codecollab.source.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
//Abid's part
@Document(collection = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String roomId;  // User-friendly room ID (e.g., "ABC123")
    
    private String password;
    
    private String name;
    
    private String creatorId;
    
    private String creatorUsername;
    
    private List<String> activeUsers = new ArrayList<>();
    
    private String currentCode = "";
    
    private String currentLanguage = "javascript";
    
    private LocalDateTime createdAt;
    
    private LocalDateTime lastActivity;
    
    private boolean isActive = true;
    
    public Room(String roomId, String password, String name, String creatorId, String creatorUsername) {
        this.roomId = roomId;
        this.password = password;
        this.name = name;
        this.creatorId = creatorId;
        this.creatorUsername = creatorUsername;
        this.createdAt = LocalDateTime.now();
        this.lastActivity = LocalDateTime.now();
        this.activeUsers = new ArrayList<>();
    }
    
    public void addUser(String username) {
        if (!activeUsers.contains(username)) {
            activeUsers.add(username);
        }
        this.lastActivity = LocalDateTime.now();
    }
    
    public void removeUser(String username) {
        activeUsers.remove(username);
        this.lastActivity = LocalDateTime.now();
    }
}
