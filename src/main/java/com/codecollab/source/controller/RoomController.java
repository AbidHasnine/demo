package com.codecollab.source.controller;

import com.codecollab.source.dto.CreateRoomRequest;
import com.codecollab.source.dto.JoinRoomRequest;
import com.codecollab.source.dto.RoomResponse;
import com.codecollab.source.entity.Room;
import com.codecollab.source.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

//S's part
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    
    private final RoomService roomService;
    
    /**
     * Create a new room
     * Requires: user must be logged in (username and userId in request body)
     */
    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody CreateRoomRequest request) {
        // Check if user is authenticated
        if (request.getCreatorUsername() == null || request.getCreatorUsername().isEmpty()) {
            return ResponseEntity.status(401).body("User must be logged in to create rooms");
        }
        
        RoomResponse response = roomService.createRoom(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
    
    /**
     * Join a room
     * Requires: user must be logged in (username and userId in request body)
     */
    @PostMapping("/join")
    public ResponseEntity<?> joinRoom(@RequestBody JoinRoomRequest request) {
        // Check if user is authenticated
        if (request.getUsername() == null || request.getUsername().isEmpty()) {
            return ResponseEntity.status(401).body("User must be logged in to join rooms");
        }
        
        RoomResponse response = roomService.joinRoom(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
    
    /**
     * Leave a room
     */
    @PostMapping("/leave")
    public ResponseEntity<RoomResponse> leaveRoom(@RequestParam String roomId, @RequestParam String username) {
        RoomResponse response = roomService.leaveRoom(roomId, username);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get room details
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable String roomId) {
        Optional<Room> roomOpt = roomService.getRoomById(roomId);
        
        if (roomOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Room room = roomOpt.get();
        RoomResponse response = new RoomResponse(
            true,
            "Room found",
            room.getRoomId(),
            null, // Don't expose password
            room.getName(),
            room.getCreatorUsername(),
            room.getActiveUsers(),
            room.getCurrentCode(),
            room.getCurrentLanguage()
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get room users count
     */
    @GetMapping("/{roomId}/users-count")
    public ResponseEntity<?> getRoomUsersCount(@PathVariable String roomId) {
        Optional<Room> roomOpt = roomService.getRoomById(roomId);
        
        if (roomOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Room room = roomOpt.get();
        return ResponseEntity.ok(java.util.Map.of(
            "roomId", room.getRoomId(),
            "usersCount", room.getActiveUsers().size(),
            "users", room.getActiveUsers()
        ));
    }
}
