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
    private CursorPosition cursor; // {line: int, ch: int}
    private TextSelection selection; // {anchor: CursorPosition, head: CursorPosition}

    public enum MessageType {
        UPDATE,
        TYPING,
        STOPPED_TYPING,
        CURSOR_ACTIVITY // New type for just cursor/selection updates
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