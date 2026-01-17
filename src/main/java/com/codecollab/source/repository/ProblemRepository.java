package com.codecollab.source.repository;

import com.codecollab.source.entity.Problem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends MongoRepository<Problem, String> {
    List<Problem> findAllByOrderByCreatedAtDesc();
}
