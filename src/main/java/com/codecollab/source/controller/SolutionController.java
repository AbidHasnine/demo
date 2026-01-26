package com.codecollab.source.controller;

import com.codecollab.source.dto.CreateSolutionRequest;
import com.codecollab.source.dto.SolutionResponse;
import com.codecollab.source.entity.Solution;
import com.codecollab.source.service.SolutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller for Problem Solutions/Comments
 * Handles CRUD operations for solutions posted to problems
 */
@RestController
@RequestMapping("/api/solutions")
@RequiredArgsConstructor
public class SolutionController {
    
    private final SolutionService solutionService;
    
    /**
     * Create a new solution for a problem
     * Requires: username and userId (from logged-in user)
     */
    @PostMapping
    public ResponseEntity<SolutionResponse> createSolution(@RequestBody CreateSolutionRequest request) {
        // Validate that user is authenticated (username and userId are provided)
        if (request.getUsername() == null || request.getUsername().isEmpty() ||
            request.getUserId() == null || request.getUserId().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Solution solution = solutionService.createSolution(request);
        return ResponseEntity.ok(new SolutionResponse(solution));
    }
    
    /**
     * Get all solutions for a problem
     */
    @GetMapping("/problem/{problemId}")
    public ResponseEntity<List<SolutionResponse>> getSolutionsByProblem(@PathVariable String problemId) {
        List<Solution> solutions = solutionService.getSolutionsByProblemId(problemId);
        List<SolutionResponse> responses = solutions.stream()
            .map(SolutionResponse::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Get a specific solution by ID
     */
    @GetMapping("/{solutionId}")
    public ResponseEntity<SolutionResponse> getSolution(@PathVariable String solutionId) {
        Optional<Solution> solutionOpt = solutionService.getSolutionById(solutionId);
        return solutionOpt.map(solution -> ResponseEntity.ok(new SolutionResponse(solution)))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    /**
     * Get all solutions by a user
     */
    @GetMapping("/user/{username}")
    public ResponseEntity<List<SolutionResponse>> getSolutionsByUser(@PathVariable String username) {
        List<Solution> solutions = solutionService.getSolutionsByUsername(username);
        List<SolutionResponse> responses = solutions.stream()
            .map(SolutionResponse::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    /**
     * Update a solution
     * Requires: user must be the solution author
     */
    @PutMapping("/{solutionId}")
    public ResponseEntity<SolutionResponse> updateSolution(
            @PathVariable String solutionId,
            @RequestBody CreateSolutionRequest request) {
        Optional<Solution> solutionOpt = solutionService.getSolutionById(solutionId);
        
        if (solutionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Verify user is the solution author
        Solution solution = solutionOpt.get();
        if (!solution.getUserId().equals(request.getUserId())) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        
        Solution updatedSolution = solutionService.updateSolution(solutionId, request);
        return ResponseEntity.ok(new SolutionResponse(updatedSolution));
    }
    
    /**
     * Mark a solution as accepted
     * Requires: user must be the problem author
     */
    @PostMapping("/{solutionId}/accept")
    public ResponseEntity<SolutionResponse> markAsAccepted(
            @PathVariable String solutionId,
            @RequestParam String userId) {
        Optional<Solution> solutionOpt = solutionService.getSolutionById(solutionId);
        
        if (solutionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Solution acceptedSolution = solutionService.markAsAccepted(solutionId);
        return ResponseEntity.ok(new SolutionResponse(acceptedSolution));
    }
    
    /**
     * Delete a solution
     * Requires: user must be the solution author
     */
    @DeleteMapping("/{solutionId}")
    public ResponseEntity<?> deleteSolution(
            @PathVariable String solutionId,
            @RequestParam String userId) {
        Optional<Solution> solutionOpt = solutionService.getSolutionById(solutionId);
        
        if (solutionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Verify user is the solution author
        Solution solution = solutionOpt.get();
        if (!solution.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
        
        if (solutionService.deleteSolution(solutionId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
}
