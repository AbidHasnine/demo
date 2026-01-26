package com.codecollab.source.service;

import com.codecollab.source.dto.CreateSolutionRequest;
import com.codecollab.source.entity.Problem;
import com.codecollab.source.entity.Solution;
import com.codecollab.source.repository.ProblemRepository;
import com.codecollab.source.repository.SolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SolutionService {
    
    private final SolutionRepository solutionRepository;
    private final ProblemRepository problemRepository;
    
    /**
     * Create a new solution for a problem
     */
    public Solution createSolution(CreateSolutionRequest request) {
        Solution solution = new Solution(
            request.getProblemId(),
            request.getUsername(),
            request.getUserId(),
            request.getTitle(),
            request.getContent()
        );
        
        Solution savedSolution = solutionRepository.save(solution);
        
        // Add solution ID to problem's solution list
        Optional<Problem> problemOpt = problemRepository.findById(request.getProblemId());
        if (problemOpt.isPresent()) {
            Problem problem = problemOpt.get();
            problem.getSolutionIds().add(savedSolution.getId());
            problemRepository.save(problem);
        }
        
        return savedSolution;
    }
    
    /**
     * Get all solutions for a problem
     */
    public List<Solution> getSolutionsByProblemId(String problemId) {
        return solutionRepository.findByProblemId(problemId);
    }
    
    /**
     * Get a specific solution by ID
     */
    public Optional<Solution> getSolutionById(String solutionId) {
        return solutionRepository.findById(solutionId);
    }
    
    /**
     * Get all solutions by a user
     */
    public List<Solution> getSolutionsByUsername(String username) {
        return solutionRepository.findByUsername(username);
    }
    
    /**
     * Update solution
     */
    public Solution updateSolution(String solutionId, CreateSolutionRequest request) {
        Optional<Solution> solutionOpt = solutionRepository.findById(solutionId);
        if (solutionOpt.isPresent()) {
            Solution solution = solutionOpt.get();
            solution.setTitle(request.getTitle());
            solution.setContent(request.getContent());
            solution.setUpdatedAt(LocalDateTime.now());
            return solutionRepository.save(solution);
        }
        return null;
    }
    
    /**
     * Mark solution as accepted
     */
    public Solution markAsAccepted(String solutionId) {
        Optional<Solution> solutionOpt = solutionRepository.findById(solutionId);
        if (solutionOpt.isPresent()) {
            Solution solution = solutionOpt.get();
            solution.setAccepted(true);
            solution.setUpdatedAt(LocalDateTime.now());
            return solutionRepository.save(solution);
        }
        return null;
    }
    
    /**
     * Delete a solution
     */
    public boolean deleteSolution(String solutionId) {
        Optional<Solution> solutionOpt = solutionRepository.findById(solutionId);
        if (solutionOpt.isPresent()) {
            Solution solution = solutionOpt.get();
            
            // Remove solution ID from problem's solution list
            Optional<Problem> problemOpt = problemRepository.findById(solution.getProblemId());
            if (problemOpt.isPresent()) {
                Problem problem = problemOpt.get();
                problem.getSolutionIds().remove(solution.getId());
                problemRepository.save(problem);
            }
            
            solutionRepository.deleteById(solutionId);
            return true;
        }
        return false;
    }
}
