package com.cts.cbs.feign;

import com.cts.cbs.entity.BookingEntity;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "booking-service")
public interface BookingServiceClient {

    // Get all bookings for a driver
    @GetMapping("/api/bookings/driver/{driverId}")
    List<BookingEntity> getAllBookingsForDriver(@PathVariable Long driverId);

    // Get cancelled bookings for a driver
    @GetMapping("/api/bookings/driver/{driverId}/cancelled")
    List<BookingEntity> getCancelledBookingsForDriver(@PathVariable Long driverId);

    // Accept booking
    @PutMapping("/api/bookings/{bookingId}/accept")
    BookingEntity acceptBooking(@PathVariable Long bookingId, @RequestParam Long driverId);
    
    // Accept booking with driver details
    @PutMapping("/api/bookings/{bookingId}/accept-with-details")
    BookingEntity acceptBookingWithDriverDetails(@PathVariable Long bookingId, 
                                                @RequestParam Long driverId,
                                                @RequestParam String driverName,
                                                @RequestParam String driverPhone);

    // Deny booking
    @PutMapping("/api/bookings/{bookingId}/deny")
    BookingEntity denyBooking(@PathVariable Long bookingId, @RequestParam Long driverId);

    // Complete ride
    @PutMapping("/api/bookings/{bookingId}/complete")
    BookingEntity completeRide(@PathVariable Long bookingId);
}