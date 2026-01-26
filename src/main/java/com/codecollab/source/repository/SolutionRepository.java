package com.codecollab.source.repository;

import com.codecollab.source.entity.Solution;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolutionRepository extends MongoRepository<Solution, String> {
    List<Solution> findByProblemId(String problemId);
    List<Solution> findByUsername(String username);
    List<Solution> findByUserIdAndProblemId(String userId, String problemId);
}
