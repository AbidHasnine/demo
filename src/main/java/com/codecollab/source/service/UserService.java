package com.codecollab.source.service;

import com.codecollab.source.dto.AuthResponse;
import com.codecollab.source.dto.LoginRequest;
import com.codecollab.source.dto.RegisterRequest;
import com.codecollab.source.entity.User;
import com.codecollab.source.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    
    public AuthResponse register(RegisterRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse(false, "Username already exists", null, null, null);
        }
        
        // Validate input
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            return new AuthResponse(false, "Username is required", null, null, null);
        }
        
        if (request.getPassword() == null || request.getPassword().length() < 4) {
            return new AuthResponse(false, "Password must be at least 4 characters", null, null, null);
        }
        
        // Create new user (simple password storage for now - can be enhanced with encryption later)
        String displayName = request.getDisplayName();
        if (displayName == null || displayName.trim().isEmpty()) {
            displayName = request.getUsername();
        }
        
        User user = new User(
            request.getUsername().trim().toLowerCase(),
            request.getPassword(),
            displayName.trim()
        );
        
        User savedUser = userRepository.save(user);
        
        return new AuthResponse(
            true, 
            "Registration successful", 
            savedUser.getId(), 
            savedUser.getUsername(), 
            savedUser.getDisplayName()
        );
    }
    
    public AuthResponse login(LoginRequest request) {
        // Validate input
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            return new AuthResponse(false, "Username is required", null, null, null);
        }
        
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            return new AuthResponse(false, "Password is required", null, null, null);
        }
        
        // Find user by username
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername().trim().toLowerCase());
        
        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "User not found", null, null, null);
        }
        
        User user = userOpt.get();
        
        // Check password (simple comparison for now)
        if (!user.getPassword().equals(request.getPassword())) {
            return new AuthResponse(false, "Invalid password", null, null, null);
        }
        
        // Update last login time
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        return new AuthResponse(
            true, 
            "Login successful", 
            user.getId(), 
            user.getUsername(), 
            user.getDisplayName()
        );
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username.trim().toLowerCase());
    }
    
    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }
}
