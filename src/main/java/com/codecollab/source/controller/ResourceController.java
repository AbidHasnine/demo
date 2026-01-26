package com.codecollab.source.controller;

import com.codecollab.source.entity.Resource;
import com.codecollab.source.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Learning Resources
 * Manages educational resources categorized by topics (OOP, DSA, Web Dev, etc.)
 */

//O's part
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {
    
    private final ResourceService resourceService;
    
    /**
     * Get all resources
     * Requires: user must be logged in
     */
    @GetMapping
    public ResponseEntity<?> getAllResources(@RequestParam(required = false) String userId) {
        // Check if user is authenticated
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(401).body("User must be logged in to access resources");
        }
        
        return ResponseEntity.ok(resourceService.getAllResources());
    }
    
    /**
     * Get resources by category (e.g., "OOP", "DSA", "Web Dev")
     * Requires: user must be logged in
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getResourcesByCategory(
            @PathVariable String category,
            @RequestParam(required = false) String userId) {
        // Check if user is authenticated
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(401).body("User must be logged in to access resources");
        }
        
        return ResponseEntity.ok(resourceService.getResourcesByCategory(category));
    }
    
    /**
     * Create a new resource
     */
    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody Resource resource) {
        return ResponseEntity.ok(resourceService.createResource(resource));
    }
}
