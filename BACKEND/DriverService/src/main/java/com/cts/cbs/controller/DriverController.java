package com.cts.cbs.controller;

import com.cts.cbs.service.DriverService;
import com.cts.cbs.entity.BookingEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    // Test endpoint - must be before parameterized paths
    @GetMapping("/test")
    @ResponseBody
    public String test() {
        return "DriverService is working!";
    }

    @GetMapping("/{driverId}/cancelled")
    @ResponseBody
    public List<BookingEntity> getCancelledBookingsForDriver(@PathVariable Long driverId) {
        return driverService.getCancelledBookingsForDriver(driverId);
    }

    @GetMapping("/{driverId}/bookings")
    @ResponseBody
    public List<BookingEntity> getAllBookingsForDriver(@PathVariable Long driverId) {
        return driverService.getAllBookingsForDriver(driverId);
    }

    // Driver accepts a booking
    @PutMapping("/accept/{bookingId}")
    public BookingEntity acceptBooking(@PathVariable Long bookingId, @RequestParam Long driverId) {
        return driverService.acceptBooking(bookingId, driverId);
    }

    // Driver denies a booking
    @PutMapping("/deny/{bookingId}")
    public BookingEntity denyBooking(@PathVariable Long bookingId, @RequestParam Long driverId) {
        return driverService.denyBooking(bookingId, driverId);
    }

    // Driver completes a ride
    @PutMapping("/complete/{bookingId}")
    public BookingEntity completeRide(@PathVariable Long bookingId) {
        return driverService.completeRide(bookingId);
    }
}
