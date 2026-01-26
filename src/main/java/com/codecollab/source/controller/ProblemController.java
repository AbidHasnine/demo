package com.codecollab.source.controller;

import com.codecollab.source.entity.Problem;
import com.codecollab.source.service.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST Controller for Problem/Q&A Management
 * Handles CRUD operations for user-posted questions with file uploads
 */
//O's Part
@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {
    
    private final ProblemService problemService;
    
    /**
     * Get all problems (sorted by most recent first)
     * No authentication required for viewing
     */
    @GetMapping
    public ResponseEntity<List<Problem>> getAllProblems() {
        return ResponseEntity.ok(problemService.getAllProblems());
    }
    
    /**
     * Get a specific problem by ID
     * No authentication required for viewing
     */
    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblemById(@PathVariable String id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }
    
    /**
     * Create a new problem with optional photo and file attachments
     * Requires: username and userId (user must be logged in)
     * Handles MultipartFile uploads for photos and documents
     */
    @PostMapping
    public ResponseEntity<?> createProblem(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("username") String username,
            @RequestParam("userId") String userId,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        // Check if user is authenticated
        if (username == null || username.isEmpty() || userId == null || userId.isEmpty()) {
            return ResponseEntity.status(401).body("User must be logged in to post problems");
        }
        
        Problem problem = problemService.createProblem(title, description, username, userId, photo, file);
        return ResponseEntity.ok(problem);
    }
}

