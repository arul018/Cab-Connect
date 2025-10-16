package com.cts.cbs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cts.cbs.entity.Feedback;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    // Find all feedback for a specific driver
    List<Feedback> findByDriverName(String driverName);
    
    // Find all feedback by a specific user
    List<Feedback> findByUserId(Integer userId);
}
