package com.cts.cbs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.cts.cbs.entity.UserEntity;
import com.cts.cbs.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public UserEntity registerUser(UserEntity user) {
        // Encrypt password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Set default values
        if (user.getBlockStatus() == null) user.setBlockStatus("no");
        if (user.getComments() == null) user.setComments("no comments");
        
        // Set adminApproval and adminComment based on role
        if (user.getRole() != null && user.getRole().equalsIgnoreCase("driver")) {
            // Drivers need admin approval
            user.setAdminApproval("pending");
            user.setAdminComment(null);
        } else {
            // Regular users don't need approval - set to NULL
            user.setAdminApproval(null);
            user.setAdminComment(null);
        }
        
        return userRepository.save(user);
    }
}