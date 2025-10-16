package com.cts.cbs.service;

import com.cts.cbs.entity.Feedback;
import com.cts.cbs.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    // ========================================
    // JPA BUILT-IN METHODS (Free from JpaRepository)
    // ========================================

    /**
     * Save new feedback from frontend form
     * Uses: JPA built-in save() method
     * Generates SQL: INSERT INTO feedback (...) VALUES (...)
     */
    public Feedback saveFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);  // JPA built-in
    }

    /**
     * Get all feedback records for admin dashboard
     * Uses: JPA built-in findAll() method
     * Generates SQL: SELECT * FROM feedback
     */
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();  // JPA built-in
    }

    /**
     * Get specific feedback by ID for details/updates
     * Uses: JPA built-in findById() method  
     * Generates SQL: SELECT * FROM feedback WHERE id = ?
     */
    public Optional<Feedback> getFeedbackById(Long id) {
        return feedbackRepository.findById(id);  // JPA built-in
    }

    /**
     * Delete feedback by ID for admin moderation
     * Uses: JPA built-in existsById() and deleteById() methods
     * Generates SQL: SELECT COUNT(*) FROM feedback WHERE id = ?
     *                DELETE FROM feedback WHERE id = ?
     */
    public boolean deleteFeedback(Long id) {
        if (feedbackRepository.existsById(id)) {  // JPA built-in
            feedbackRepository.deleteById(id);   // JPA built-in
            return true;
        }
        return false;
    }

    // ========================================
    // CUSTOM QUERY METHODS (Defined by YOU in Repository)
    // ========================================

    /**
     * Get all feedback for a specific driver (driver dashboard)
     * Uses: CUSTOM findByDriverName() method you defined
     * Generates SQL: SELECT * FROM feedback WHERE driver_name = ?
     */
    public List<Feedback> getFeedbackByDriverName(String driverName) {
        return feedbackRepository.findByDriverName(driverName);  // YOUR custom method
    }

    /**
     * Get all feedback given by a specific user (user profile)
     * Uses: CUSTOM findByUserId() method you defined  
     * Generates SQL: SELECT * FROM feedback WHERE user_id = ?
     */
    public List<Feedback> getFeedbackByUserId(Integer userId) {
        return feedbackRepository.findByUserId(userId);  // YOUR custom method
    }

    // ========================================
    // METHOD SUMMARY
    // ========================================
    /*
     * JPA BUILT-IN METHODS (4):
     * - saveFeedback()       → save()
     * - getAllFeedback()     → findAll()  
     * - getFeedbackById()    → findById()
     * - deleteFeedback()     → existsById() + deleteById()
     * 
     * CUSTOM QUERY METHODS (2):
     * - getFeedbackByDriverName() → findByDriverName()
     * - getFeedbackByUserId()     → findByUserId()
     */
}