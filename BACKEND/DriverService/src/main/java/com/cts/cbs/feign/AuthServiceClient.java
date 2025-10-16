package com.cts.cbs.feign;

import com.cts.cbs.dto.DriverDetailsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// Feign client to call Authentication service for driver details
@FeignClient(name = "authentication-service", url = "http://localhost:9091")
public interface AuthServiceClient {
    
    // Get driver profile information by user ID
    @GetMapping("/api/users/{id}")
    DriverDetailsDto getUserProfileById(@PathVariable("id") Long id);
}