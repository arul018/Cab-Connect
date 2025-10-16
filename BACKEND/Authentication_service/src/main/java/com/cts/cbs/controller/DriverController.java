package com.cts.cbs.controller;

import com.cts.cbs.dto.DriverDetailsDto;
import com.cts.cbs.entity.UserEntity;
import com.cts.cbs.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    @Autowired
    private UserRepository userRepository;

    // Get all drivers
    @GetMapping
    public ResponseEntity<List<DriverDetailsDto>> getAllDrivers() {
        List<UserEntity> drivers = userRepository.findByRoleIgnoreCase("DRIVER");
        List<DriverDetailsDto> driverDtos = drivers.stream()
                .map(user -> {
                    DriverDetailsDto dto = new DriverDetailsDto();
                    dto.setId(user.getId());
                    dto.setFullName(user.getFullName());
                    dto.setEmail(user.getEmail());
                    dto.setPhone(user.getPhone());
                    dto.setAadharNumber(user.getAadharNumber());
                    dto.setLicenseNumber(user.getLicenseNumber());
                    dto.setVehicleModel(user.getVehicleModel());
                    dto.setVehicleNumber(user.getVehicleNumber());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(driverDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverDetailsDto> getDriverById(@PathVariable Long id) {
        return userRepository.findById(id)
                .filter(user -> "DRIVER".equalsIgnoreCase(user.getRole()))
                .map(user -> {
                    DriverDetailsDto dto = new DriverDetailsDto();
                    dto.setId(user.getId());
                    dto.setFullName(user.getFullName());
                    dto.setEmail(user.getEmail());
                    dto.setPhone(user.getPhone());
                    dto.setAadharNumber(user.getAadharNumber());
                    dto.setLicenseNumber(user.getLicenseNumber());
                    dto.setVehicleModel(user.getVehicleModel());
                    dto.setVehicleNumber(user.getVehicleNumber());
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}