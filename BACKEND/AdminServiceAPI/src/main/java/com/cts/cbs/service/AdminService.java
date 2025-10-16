package com.cts.cbs.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.core.ParameterizedTypeReference;
import java.util.*;

@Service
public class AdminService {
    private final RestTemplate restTemplate;
    @Value("${auth.service.url}")
    private String authServiceUrl;

    public AdminService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<Map<String, Object>> getPendingDrivers() {
        String url = authServiceUrl + "/api/users/pending-drivers";
        ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
        return response.getBody();
    }

    public Map<String, Object> getDriverDetails(Long id) {
        String url = authServiceUrl + "/api/users/" + id;
        Map<String, Object> user = restTemplate.getForObject(url, Map.class);
        
        // Only return if user is a driver
        String role = (String) user.get("role");
        if ("DRIVER".equalsIgnoreCase(role)) {
            return user;
        }
        return null; // Return null if not a driver
    }

    public void approveDriver(Long id) {
        String url = authServiceUrl + "/api/users/" + id + "/approval";
        Map<String, String> body = new HashMap<>();
        body.put("adminApproval", "approved");
        restTemplate.put(url, body);
    }

    public void rejectDriver(Long id, String comment) {
        String url = authServiceUrl + "/api/users/" + id + "/approval";
        Map<String, String> body = new HashMap<>();
        body.put("adminApproval", "rejected");
        body.put("adminComment", comment);
        restTemplate.put(url, body);
    }

    public List<Map<String, Object>> getApprovedDrivers() {
        String url = authServiceUrl + "/api/users/approved-drivers";
        ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
        return response.getBody();
    }

    public List<Map<String, Object>> getRejectedDrivers() {
        String url = authServiceUrl + "/api/users/rejected-drivers";
        ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
        return response.getBody();
    }

    public void deleteUser(Long id) {
        try {
            String url = authServiceUrl + "/api/users/" + id;
            System.out.println("Attempting to delete user at URL: " + url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
            System.out.println("User deletion successful for ID: " + id + ", Response: " + response.getBody());
        } catch (Exception e) {
            System.err.println("Error deleting user with ID " + id + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete user: " + e.getMessage());
        }
    }
}