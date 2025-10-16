package com.cts.cbs.client;

import com.cts.cbs.dto.DriverDetailsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "authentication-service", url = "http://localhost:9091")
public interface DriverClient {
    @GetMapping("/api/drivers/{id}") // Update path to match your authentication service endpoint
    DriverDetailsDto getDriverById(@PathVariable("id") Long id);
    //DriverDetailsDto → ✅ return type — the method will return an object of type DriverDetailsDto
}