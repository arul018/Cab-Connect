package com.cts.cbs.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cts.cbs.dto.LoginRequest;
import com.cts.cbs.entity.UserEntity;
import com.cts.cbs.repository.UserRepository;
import com.cts.cbs.util.JwtUtil;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Logging for debugging
        System.out.println("Login attempt: email=" + email + ", role=" + user.getRole() + ", blockStatus=" + user.getBlockStatus());

        // Blocked user check (only for users, not drivers)
        if (user.getRole() != null && user.getRole().equalsIgnoreCase("user") && "yes".equalsIgnoreCase(user.getBlockStatus())) {
            System.out.println("Blocked user login prevented for: " + email);
            return ResponseEntity.status(403).body("You have been blocked, contact admin");
        }
        // Driver approval check
        if (user.getRole() != null && user.getRole().equalsIgnoreCase("driver")) {
            if ("pending".equalsIgnoreCase(user.getAdminApproval())) {
                Map<String, Object> error = new HashMap<>();
                error.put("adminApproval", "pending");
                error.put("adminComment", user.getAdminComment());
                return ResponseEntity.status(403).body(error);
            } else if ("rejected".equalsIgnoreCase(user.getAdminApproval())) {
                Map<String, Object> error = new HashMap<>();
                error.put("adminApproval", "rejected");
                error.put("adminComment", user.getAdminComment());
                return ResponseEntity.status(403).body(error);
            }
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user);
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("email", user.getEmail());
        response.put("username", user.getFullName());
        response.put("userId", user.getId());
        response.put("phone", user.getPhone());

        return ResponseEntity.ok(response);
    }
}

