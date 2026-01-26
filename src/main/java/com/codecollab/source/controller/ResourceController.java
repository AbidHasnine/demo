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
     */
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }
    
    /**
     * Get resources by category (e.g., "OOP", "DSA", "Web Dev")
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Resource>> getResourcesByCategory(@PathVariable String category) {
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
