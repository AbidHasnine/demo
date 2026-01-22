package com.codecollab.source.service;

import com.codecollab.source.dto.CreateRoomRequest;
import com.codecollab.source.dto.JoinRoomRequest;
import com.codecollab.source.dto.RoomResponse;
import com.codecollab.source.entity.Room;
import com.codecollab.source.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomService {
    
    private final RoomRepository roomRepository;
    private static final String ROOM_ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int ROOM_ID_LENGTH = 6;
    private final SecureRandom random = new SecureRandom();
    
    public RoomResponse createRoom(CreateRoomRequest request) {
        // Validate input
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return new RoomResponse(false, "Room name is required", null, null, null, null, null, null, null);
        }
        
        if (request.getPassword() == null || request.getPassword().length() < 4) {
            return new RoomResponse(false, "Password must be at least 4 characters", null, null, null, null, null, null, null);
        }
        
        if (request.getCreatorUsername() == null || request.getCreatorUsername().trim().isEmpty()) {
            return new RoomResponse(false, "Creator username is required", null, null, null, null, null, null, null);
        }
        
        // Generate unique room ID
        String roomId = generateUniqueRoomId();
        
        // Create room
        Room room = new Room(
            roomId,
            request.getPassword(),
            request.getName().trim(),
            null, // creatorId can be set if user is logged in
            request.getCreatorUsername().trim()
        );
        
        // Add creator as first user
        room.addUser(request.getCreatorUsername().trim());
        
        Room savedRoom = roomRepository.save(room);
        
        return new RoomResponse(
            true,
            "Room created successfully",
            savedRoom.getRoomId(),
            savedRoom.getPassword(),
            savedRoom.getName(),
            savedRoom.getCreatorUsername(),
            savedRoom.getActiveUsers(),
            savedRoom.getCurrentCode(),
            savedRoom.getCurrentLanguage()
        );
    }
    
    public RoomResponse joinRoom(JoinRoomRequest request) {
        // Validate input
        if (request.getRoomId() == null || request.getRoomId().trim().isEmpty()) {
            return new RoomResponse(false, "Room ID is required", null, null, null, null, null, null, null);
        }
        
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            return new RoomResponse(false, "Password is required", null, null, null, null, null, null, null);
        }
        
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            return new RoomResponse(false, "Username is required", null, null, null, null, null, null, null);
        }
        
        // Find room
        Optional<Room> roomOpt = roomRepository.findByRoomId(request.getRoomId().toUpperCase().trim());
        
        if (roomOpt.isEmpty()) {
            return new RoomResponse(false, "Room not found", null, null, null, null, null, null, null);
        }
        
        Room room = roomOpt.get();
        
        // Check if room is active
        if (!room.isActive()) {
            return new RoomResponse(false, "This room is no longer active", null, null, null, null, null, null, null);
        }
        
        // Check password
        if (!room.getPassword().equals(request.getPassword())) {
            return new RoomResponse(false, "Invalid password", null, null, null, null, null, null, null);
        }
        
        // Add user to room
        room.addUser(request.getUsername().trim());
        roomRepository.save(room);
        
        return new RoomResponse(
            true,
            "Joined room successfully",
            room.getRoomId(),
            null, // Don't send password back when joining
            room.getName(),
            room.getCreatorUsername(),
            room.getActiveUsers(),
            room.getCurrentCode(),
            room.getCurrentLanguage()
        );
    }
    
    public RoomResponse leaveRoom(String roomId, String username) {
        Optional<Room> roomOpt = roomRepository.findByRoomId(roomId.toUpperCase().trim());
        
        if (roomOpt.isEmpty()) {
            return new RoomResponse(false, "Room not found", null, null, null, null, null, null, null);
        }
        
        Room room = roomOpt.get();
        room.removeUser(username);
        roomRepository.save(room);
        
        return new RoomResponse(true, "Left room successfully", roomId, null, null, null, null, null, null);
    }
    
    public void updateRoomCode(String roomId, String code, String language) {
        Optional<Room> roomOpt = roomRepository.findByRoomId(roomId.toUpperCase().trim());
        
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            room.setCurrentCode(code);
            room.setCurrentLanguage(language);
            roomRepository.save(room);
        }
    }
    
    public Optional<Room> getRoomById(String roomId) {
        return roomRepository.findByRoomId(roomId.toUpperCase().trim());
    }
    
    private String generateUniqueRoomId() {
        String roomId;
        do {
            roomId = generateRoomId();
        } while (roomRepository.existsByRoomId(roomId));
        return roomId;
    }
    
    private String generateRoomId() {
        StringBuilder sb = new StringBuilder(ROOM_ID_LENGTH);
        for (int i = 0; i < ROOM_ID_LENGTH; i++) {
            sb.append(ROOM_ID_CHARS.charAt(random.nextInt(ROOM_ID_CHARS.length())));
        }
        return sb.toString();
    }
}
