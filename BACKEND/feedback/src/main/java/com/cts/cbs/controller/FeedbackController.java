package com.cts.cbs.controller;
import com.cts.cbs.entity.Feedback;
import com.cts.cbs.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/feedback")
// @CrossOrigin(origins = "http://localhost:5173") - Disabled to prevent duplicate CORS headers with Gateway
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    // ========================================
    // JPA BUILT-IN ENDPOINTS
    // ========================================

    /**
     * Save new feedback from frontend form
     * POST /api/feedback
     * Body: { "userId": 26, "ratings": 5, "comments": "Clean Car", "driverName": "John Doe" }
     */
    @PostMapping
    public ResponseEntity<Feedback> createFeedback(@RequestBody Feedback feedback) {
        try {
            Feedback savedFeedback = feedbackService.saveFeedback(feedback);
            return new ResponseEntity<>(savedFeedback, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get all feedback for admin dashboard
     * GET /api/feedback
     */
    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        try {
            List<Feedback> feedbackList = feedbackService.getAllFeedback();
            if (feedbackList.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(feedbackList, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get specific feedback by ID
     * GET /api/feedback/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable("id") Long id) {
        Optional<Feedback> feedbackData = feedbackService.getFeedbackById(id);
        
        if (feedbackData.isPresent()) {
            return new ResponseEntity<>(feedbackData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Delete feedback by ID for admin
     * DELETE /api/feedback/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteFeedback(@PathVariable("id") Long id) {
        try {
            boolean deleted = feedbackService.deleteFeedback(id);
            if (deleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ========================================
    // CUSTOM QUERY ENDPOINTS
    // ========================================

    /**
     * Get all feedback for a specific driver (driver dashboard)
     * GET /api/feedback/driver/{driverName}
     * Example: GET /api/feedback/driver/John Doe
     */
    @GetMapping("/driver/{driverName}")
    public ResponseEntity<List<Feedback>> getFeedbackByDriver(@PathVariable("driverName") String driverName) {
        try {
            List<Feedback> driverFeedback = feedbackService.getFeedbackByDriverName(driverName);
            if (driverFeedback.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(driverFeedback, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get all feedback given by a specific user (user profile)
     * GET /api/feedback/user/{userId}  
     * Example: GET /api/feedback/user/26
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Feedback>> getFeedbackByUser(@PathVariable("userId") Integer userId) {
        try {
            List<Feedback> userFeedback = feedbackService.getFeedbackByUserId(userId);
            if (userFeedback.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(userFeedback, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}