package com.codecollab.source.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeSyncMessage {
    private String sender;
    private String code;
    private String language;
    private String roomId;  // Room ID for room-based code sync
}
