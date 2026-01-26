package com.codecollab.source.service;

import com.codecollab.source.entity.Problem;
import com.codecollab.source.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProblemService {
    
    private final ProblemRepository problemRepository;
    private final FileStorageService fileStorageService;
    
    public List<Problem> getAllProblems() {
        return problemRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public Problem createProblem(String title, String description, String username, String userId, 
                                 MultipartFile photo, MultipartFile file) {
        Problem problem = new Problem();
        problem.setTitle(title);
        problem.setDescription(description);
        problem.setUsername(username);
        problem.setUserId(userId);
        
        // Store photo if provided
        if (photo != null && !photo.isEmpty()) {
            String photoFileName = fileStorageService.storeFile(photo);
            problem.setPhotoPath(photoFileName);
        }
        
        // Store file if provided
        if (file != null && !file.isEmpty()) {
            String fileName = fileStorageService.storeFile(file);
            problem.setFilePath(fileName);
            problem.setFileName(file.getOriginalFilename());
        }
        
        return problemRepository.save(problem);
    }
    
    public Problem getProblemById(String id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found with id: " + id));
    }
}

