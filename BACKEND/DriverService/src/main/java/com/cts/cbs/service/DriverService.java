package com.cts.cbs.service;

import com.cts.cbs.entity.BookingEntity;
import com.cts.cbs.dto.DriverDetailsDto;
import com.cts.cbs.feign.BookingServiceClient;
import com.cts.cbs.feign.AuthServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverService {

    @Autowired
    private BookingServiceClient bookingServiceClient;
    
    @Autowired
    private AuthServiceClient authServiceClient;

    // Get cancelled bookings for a driver
    public List<BookingEntity> getCancelledBookingsForDriver(Long driverId) {
        // Call BookingService to get cancelled bookings
        return bookingServiceClient.getCancelledBookingsForDriver(driverId);
    }

    // Get all bookings for a specific driver
    public List<BookingEntity> getAllBookingsForDriver(Long driverId) {
        // Call BookingService to get all bookings
        return bookingServiceClient.getAllBookingsForDriver(driverId);
    }

    // Driver accepts a booking
    public BookingEntity acceptBooking(Long bookingId, Long driverId) {
        // Step 1: Get driver details from Authentication service
        try {
            DriverDetailsDto driverDetails = authServiceClient.getUserProfileById(driverId);
            
            // Step 2: Call BookingService to accept booking with driver details
            return bookingServiceClient.acceptBookingWithDriverDetails(bookingId, driverId, 
                    driverDetails.getFullName(), driverDetails.getPhone());
            
        } catch (Exception e) {
            // If we can't get driver details, use fallback
            return bookingServiceClient.acceptBookingWithDriverDetails(bookingId, driverId, 
                    "Driver " + driverId, "Contact support");
        }
    }

    // Driver denies a booking
    public BookingEntity denyBooking(Long bookingId, Long driverId) {
        // Call BookingService to deny booking
        return bookingServiceClient.denyBooking(bookingId, driverId);
    }

    // Driver completes a ride
    public BookingEntity completeRide(Long bookingId) {
        // Call BookingService to complete ride
        return bookingServiceClient.completeRide(bookingId);
    }
}
