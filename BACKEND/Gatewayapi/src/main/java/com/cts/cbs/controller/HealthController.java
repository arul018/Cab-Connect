package com.cts.cbs.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class HealthController {
    
    @Autowired
    private DiscoveryClient discoveryClient;
    
    @GetMapping("/health")
    public String health() {
        return "Gateway is running on port 8305";
    }
    
    @GetMapping("/services")
    public List<String> getRegisteredServices() {
        return discoveryClient.getServices()
                .stream()
                .map(serviceId -> serviceId + ": " + 
                    discoveryClient.getInstances(serviceId)
                            .stream()
                            .map(instance -> instance.getUri().toString())
                            .collect(Collectors.joining(", ")))
                .collect(Collectors.toList());
    }
}
