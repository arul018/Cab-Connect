package com.cts.cbs.controller;

import com.cts.cbs.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/pending-drivers")
    public List<Map<String, Object>> getPendingDrivers() {
        return adminService.getPendingDrivers();
    }

    @GetMapping("/approved-drivers")
    public List<Map<String, Object>> getApprovedDrivers() {
        return adminService.getApprovedDrivers();
    }

    @GetMapping("/rejected-drivers")
    public List<Map<String, Object>> getRejectedDrivers() {
        return adminService.getRejectedDrivers();
    }

    @GetMapping("/driver/{id}")
    public Map<String, Object> getDriverDetails(@PathVariable Long id) {
        Map<String, Object> driver = adminService.getDriverDetails(id);
        if (driver == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Not a driver");
            error.put("userId", id);
            return error;
        }
        return driver;
    }

    @PutMapping("/driver/{id}/approve")
    public String approveDriver(@PathVariable Long id) {
        adminService.approveDriver(id);
        return "Driver approved successfully";
    }

    @PutMapping("/driver/{id}/reject")
    public String rejectDriver(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String comment = "Rejected by admin";
        if (body != null) {
            comment = body.getOrDefault("comment", "Rejected by admin");
        }
        adminService.rejectDriver(id, comment);
        return "Driver rejected successfully";
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete user: " + e.getMessage());
        }
    }
}