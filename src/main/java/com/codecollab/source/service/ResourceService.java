package com.codecollab.source.service;

import com.codecollab.source.entity.Resource;
import com.codecollab.source.repository.ResourceRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {
    
    private final ResourceRepository resourceRepository;
    
    @PostConstruct
    public void initializeResources() {
        // Initialize with sample data if database is empty
        if (resourceRepository.count() == 0) {
            // OOP Resources
            resourceRepository.save(new Resource(null, "OOP", "Java OOP Basics", 
                "https://docs.oracle.com/javase/tutorial/java/concepts/", 
                "Official Java tutorial covering OOP concepts"));
            resourceRepository.save(new Resource(null, "OOP", "Inheritance & Polymorphism", 
                "https://www.javatpoint.com/inheritance-in-java", 
                "Deep dive into inheritance and polymorphism"));
            
            // DSA Resources
            resourceRepository.save(new Resource(null, "DSA", "Arrays and Strings", 
                "https://www.geeksforgeeks.org/array-data-structure/", 
                "Complete guide to arrays and strings"));
            resourceRepository.save(new Resource(null, "DSA", "Data Structures Tutorial", 
                "https://www.programiz.com/dsa", 
                "Comprehensive DSA tutorials"));
            
            // Web Dev Resources
            resourceRepository.save(new Resource(null, "Web Dev", "HTML & CSS Basics", 
                "https://www.w3schools.com/html/", 
                "Learn HTML and CSS from scratch"));
            resourceRepository.save(new Resource(null, "Web Dev", "JavaScript ES6+", 
                "https://javascript.info/", 
                "Modern JavaScript tutorial"));
        }
    }
    
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }
    
    public List<Resource> getResourcesByCategory(String category) {
        return resourceRepository.findByCategory(category);
    }
    
    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }
}
