package com.cts.cbs.controller;

import com.cts.cbs.entity.UserEntity;
import com.cts.cbs.repository.UserRepository;
import com.cts.cbs.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserEntity user) {
        try {
            // Check if email already exists
            if (userRepository.findByEmail(user.getEmail().toLowerCase().trim()).isPresent()) {
                return ResponseEntity.status(409).body("Email already exists");
            }
            
            // Normalize email
            user.setEmail(user.getEmail().toLowerCase().trim());
            
            // Set registration date
            user.setRegistrationDate(java.time.LocalDateTime.now().toString());
            
            UserEntity savedUser = userService.registerUser(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<UserEntity> users = userRepository.findAll();
        List<Map<String, Object>> userProfiles = users.stream()
            .map(user -> {
                Map<String, Object> profile = new HashMap<>();
                profile.put("userId", user.getId());
                profile.put("email", user.getEmail());
                profile.put("fullName", user.getFullName());
                profile.put("role", user.getRole());
                profile.put("phone", user.getPhone());
                profile.put("blockStatus", user.getBlockStatus());
                profile.put("comments", user.getComments());
                profile.put("registrationDate", user.getRegistrationDate());
                return profile;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(userProfiles);
    }

    // Get all drivers with adminApproval = "pending"
    @GetMapping("/users/pending-drivers")
    public ResponseEntity<List<Map<String, Object>>> getPendingDrivers() {
        List<UserEntity> pendingDrivers = userRepository.findAll().stream()
            .filter(user -> "driver".equalsIgnoreCase(user.getRole()) && "pending".equalsIgnoreCase(user.getAdminApproval()))
            .collect(Collectors.toList());
        List<Map<String, Object>> driverProfiles = pendingDrivers.stream()
            .map(user -> {
                Map<String, Object> profile = new HashMap<>();
                profile.put("userId", user.getId());
                profile.put("email", user.getEmail());
                profile.put("fullName", user.getFullName());
                profile.put("role", user.getRole());
                profile.put("phone", user.getPhone());
                profile.put("adminApproval", user.getAdminApproval());
                profile.put("adminComment", user.getAdminComment());
                profile.put("vehicleBrand", user.getVehicleBrand());
                profile.put("vehicleModel", user.getVehicleModelOnly());
                profile.put("vehicleNumber", user.getVehicleNumber());
                profile.put("licenseNumber", user.getLicenseNumber());
                profile.put("aadharNumber", user.getAadharNumber());
                profile.put("registered", user.getRegistered());
                profile.put("registrationDate", user.getRegistrationDate());
                return profile;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(driverProfiles);
    }

    // Get all drivers with adminApproval = "approved"
    @GetMapping("/users/approved-drivers")
    public ResponseEntity<List<Map<String, Object>>> getApprovedDrivers() {
        List<UserEntity> approvedDrivers = userRepository.findAll().stream()
            .filter(user -> "driver".equalsIgnoreCase(user.getRole()) && "approved".equalsIgnoreCase(user.getAdminApproval()))
            .collect(Collectors.toList());
        List<Map<String, Object>> driverProfiles = approvedDrivers.stream()
            .map(user -> {
                Map<String, Object> profile = new HashMap<>();
                profile.put("userId", user.getId());
                profile.put("email", user.getEmail());
                profile.put("fullName", user.getFullName());
                profile.put("role", user.getRole());
                profile.put("phone", user.getPhone());
                profile.put("adminApproval", user.getAdminApproval());
                profile.put("adminComment", user.getAdminComment());
                profile.put("vehicleBrand", user.getVehicleBrand());
                profile.put("vehicleModel", user.getVehicleModelOnly());
                profile.put("vehicleNumber", user.getVehicleNumber());
                profile.put("licenseNumber", user.getLicenseNumber());
                profile.put("aadharNumber", user.getAadharNumber());
                profile.put("registered", user.getRegistered());
                profile.put("registrationDate", user.getRegistrationDate());
                return profile;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(driverProfiles);
    }

    // Get all drivers with adminApproval = "rejected"
    @GetMapping("/users/rejected-drivers")
    public ResponseEntity<List<Map<String, Object>>> getRejectedDrivers() {
        List<UserEntity> rejectedDrivers = userRepository.findAll().stream()
            .filter(user -> "driver".equalsIgnoreCase(user.getRole()) && "rejected".equalsIgnoreCase(user.getAdminApproval()))
            .collect(Collectors.toList());
        List<Map<String, Object>> driverProfiles = rejectedDrivers.stream()
            .map(user -> {
                Map<String, Object> profile = new HashMap<>();
                profile.put("userId", user.getId());
                profile.put("email", user.getEmail());
                profile.put("fullName", user.getFullName());
                profile.put("role", user.getRole());
                profile.put("phone", user.getPhone());
                profile.put("adminApproval", user.getAdminApproval());
                profile.put("adminComment", user.getAdminComment());
                profile.put("vehicleBrand", user.getVehicleBrand());
                profile.put("vehicleModel", user.getVehicleModelOnly());
                profile.put("vehicleNumber", user.getVehicleNumber());
                profile.put("licenseNumber", user.getLicenseNumber());
                profile.put("aadharNumber", user.getAadharNumber());
                profile.put("registered", user.getRegistered());
                profile.put("registrationDate", user.getRegistrationDate());
                return profile;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(driverProfiles);
    }

    // User profile endpoint: fetch by userId, map to required fields
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserProfileById(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> {
                Map<String, Object> profile = new HashMap<>();
                profile.put("id", user.getId());
                profile.put("userId", user.getId());
                profile.put("email", user.getEmail());
                profile.put("fullName", user.getFullName());
                profile.put("role", user.getRole());
                profile.put("phone", user.getPhone());
                profile.put("blockStatus", user.getBlockStatus());
                profile.put("comments", user.getComments());
                profile.put("adminApproval", user.getAdminApproval());
                profile.put("adminComment", user.getAdminComment());
                profile.put("registrationDate", user.getRegistrationDate());
                // Add driver-specific fields - mapped to DriverDetailsDto field names
                profile.put("licenseNumber", user.getLicenseNumber());
                profile.put("aadharNumber", user.getAadharNumber());
                profile.put("carModel", user.getVehicleModel());
                profile.put("carNumber", user.getVehicleNumber());
                profile.put("vehicleBrand", user.getVehicleBrand());
                // Keep original field names for backward compatibility
                profile.put("vehicleModel", user.getVehicleModel());
                profile.put("vehicleNumber", user.getVehicleNumber());
                return ResponseEntity.ok(profile);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Update user profile
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        try {
            UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

            String oldEmail = user.getEmail();

            if (updates.containsKey("fullName")) {
                user.setFullName(updates.get("fullName"));
            }
            if (updates.containsKey("email")) {
                String newEmail = updates.get("email").toLowerCase().trim();
                
                if (!newEmail.equals(oldEmail)) {
                    boolean emailExists = userRepository.findByEmail(newEmail).isPresent();
                    if (emailExists) {
                        return ResponseEntity.badRequest().body("Email already exists for another user");
                    }
                }
                
                user.setEmail(newEmail);
            }
            if (updates.containsKey("phone")) {
                user.setPhone(updates.get("phone"));
            }

            UserEntity updatedUser = userRepository.save(user);

            Map<String, Object> profile = new HashMap<>();
            profile.put("userId", updatedUser.getId());
            profile.put("email", updatedUser.getEmail());
            profile.put("fullName", updatedUser.getFullName());
            profile.put("role", updatedUser.getRole());
            profile.put("phone", updatedUser.getPhone());
            profile.put("registrationDate", updatedUser.getRegistrationDate());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update profile: " + e.getMessage());
        }
    }

    // Update adminApproval for a driver
    @PutMapping("/users/{id}/approval")
    public ResponseEntity<?> updateAdminApproval(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        try {
            UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (updates.containsKey("adminApproval")) {
                user.setAdminApproval(updates.get("adminApproval"));
            }
            if (updates.containsKey("adminComment")) {
                user.setAdminComment(updates.get("adminComment"));
            }
            UserEntity updatedUser = userRepository.save(user);

            Map<String, Object> profile = new HashMap<>();
            profile.put("userId", updatedUser.getId());
            profile.put("adminApproval", updatedUser.getAdminApproval());
            profile.put("adminComment", updatedUser.getAdminComment());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update admin approval: " + e.getMessage());
        }
    }

    // Block a user
    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
            user.setBlockStatus("yes");
            user.setComments(body.getOrDefault("comments", "Blocked by admin"));
            userRepository.save(user);
            return ResponseEntity.ok("User blocked successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to block user: " + e.getMessage());
        }
    }

    // Unblock a user
    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long id) {
        try {
            UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
            user.setBlockStatus("no"); 
            user.setComments("no comments");
            userRepository.save(user);
            return ResponseEntity.ok("User unblocked successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to unblock user: " + e.getMessage());
        }
    }

    // Delete a user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
            userRepository.delete(user);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete user: " + e.getMessage());
        }
    }
}