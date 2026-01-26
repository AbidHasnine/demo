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
    private MessageType type;

    // Fields for collaborative editing (cursor and selection)
    private CursorPosition cursor;
    private TextSelection selection;


    //Experimental RealTime Update
    public enum MessageType {
        UPDATE,
        TYPING,
        STOPPED_TYPING,
        CURSOR_ACTIVITY
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CursorPosition {
        private int line;
        private int ch;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TextSelection {
        private CursorPosition anchor;
        private CursorPosition head;
    }
}