package com.codecollab.source.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private boolean success;
    private String message;
    private String roomId;
    private String password;
    private String name;
    private String creatorUsername;
    private List<String> activeUsers;
    private String currentCode;
    private String currentLanguage;
}
