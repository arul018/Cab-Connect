package com.cts.cbs.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "feedback")
public class Feedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "ratings", nullable = false)
    private Integer ratings;
    
    @Column(name = "comments", nullable = false, length = 100)
    private String comments;
    
    @Column(name = "driver_name", nullable = false, length = 100)
    private String driverName;
    
    // Default constructor
    public Feedback() {}
    
    // Constructor with parameters
    public Feedback(Integer userId, Integer ratings, String comments, String driverName) {
        this.userId = userId;
        this.ratings = ratings;
        this.comments = comments;
        this.driverName = driverName;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public Integer getRatings() {
        return ratings;
    }
    
    public void setRatings(Integer ratings) {
        this.ratings = ratings;
    }
    
    public String getComments() {
        return comments;
    }
    
    public void setComments(String comments) {
        this.comments = comments;
    }
    
    public String getDriverName() {
        return driverName;
    }
    
    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }
    
    @Override
    public String toString() {
        return "Feedback{" +
                "id=" + id +
                ", userId=" + userId +
                ", ratings=" + ratings +
                ", comments='" + comments + '\'' +
                ", driverName='" + driverName + '\'' +
                '}';
    }
}