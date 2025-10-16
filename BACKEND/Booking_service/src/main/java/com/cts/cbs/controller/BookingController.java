
package com.cts.cbs.controller;
import com.cts.cbs.dto.AcceptBookingRequestDto; 
import com.cts.cbs.dto.BookingRequestDto;      // Carries data needed to create a booking (pickup, drop, etc.)
import com.cts.cbs.dto.PaymentUpdateDto;       // Carries payment status update (e.g., PAID)
import com.cts.cbs.entity.BookingEntity;       // JPA Entity representing a booking row in DB
import com.cts.cbs.service.BookingService;     // Service layer: business rules live there (NOT in controller)
import com.cts.cbs.util.JwtUtil;               // Utility to validate Authorization tokens
import org.springframework.http.HttpStatus;    // Enum of HTTP status codes
import org.springframework.http.ResponseEntity; // Wrapper to return body + HTTP status together
import org.springframework.web.bind.annotation.*; // Spring MVC annotations (@RestController, @GetMapping, ...)

import java.util.List;
import java.util.Map;
import com.cts.cbs.exception.BookingExceptions; // Custom exceptions (mapped elsewhere to HTTP responses)

@RestController 
@RequestMapping("/api/bookings") // Base URL prefix: every method path below is appended to this.
public class BookingController {
    
	
    private final BookingService bookingService;  
    private final JwtUtil jwtUtil;                   // Injected dependency: provides token (JWT) validation logic.

    public BookingController(BookingService bookingService, JwtUtil jwtUtil) {
        this.bookingService = bookingService;   // Assign injected service to field
        this.jwtUtil = jwtUtil;                 // Assign injected util to field
    }

    // ==================================================================
    // (1) CREATE BOOKING
    
    @PostMapping
    // ROLE: USER (passenger creates a new booking)
    public ResponseEntity<Object> createBooking(
            @RequestBody BookingRequestDto bookingRequest,
            
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        // VALIDATION: If token missing/invalid -> abort early.
        if (!jwtUtil.isValidToken(authHeader)) {
            // Throwing custom exception lets a global handler map it to 401 response cleanly.
            throw new BookingExceptions.UnauthorizedAccessException();
        }
        
        BookingEntity savedBooking = bookingService.createBooking(bookingRequest);
        
        return new ResponseEntity<>(savedBooking, HttpStatus.CREATED);
    }
    
    // ==================================================================
    @GetMapping
    // ROLE: ADMIN (view all bookings) / INTERNAL (monitoring)
    public ResponseEntity<List<BookingEntity>> getAllBookings() {
        List<BookingEntity> bookings = bookingService.getAllBookings(); // Service handles repository interaction.
        return ResponseEntity.ok(bookings); // 200 OK with JSON array.
    }

    // ==================================================================
    // (3) GET BOOKING BY ID
    @GetMapping("/{id}")
    // ROLE: USER (own booking lookup) / ADMIN (any booking lookup)
    public ResponseEntity<BookingEntity> getBookingById(@PathVariable Long id) {
        BookingEntity booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    // ==================================================================
    // (4) LIST BOOKINGS FOR A USER
   
    @GetMapping("/user/{username}")
    // ROLE: USER (list own bookings)
    public ResponseEntity<List<BookingEntity>> getBookingsByUsername(@PathVariable String username) {
        List<BookingEntity> bookings = bookingService.getBookingsByUsername(username);
        return ResponseEntity.ok(bookings);
    }

    // ==================================================================
    // (5) CANCEL BOOKING
    @PutMapping("/{id}/cancel")
    // ROLE: USER (cancel own booking)
    public ResponseEntity<BookingEntity> cancelBooking(@PathVariable Long id) {
        BookingEntity cancelledBooking = bookingService.cancelBooking(id);
        return ResponseEntity.ok(cancelledBooking);
    }

    // ==================================================================
    // (6) LIST PENDING BOOKINGS
    @GetMapping("/pending")
    // ROLE: DRIVER / ADMIN (see pending bookings to accept)
    public ResponseEntity<List<BookingEntity>> getPendingBookings() {
        List<BookingEntity> bookings = bookingService.getPendingBookings();
        return ResponseEntity.ok(bookings);
    }

    // ==================================================================
    // (7) UPDATE PAYMENT STATUS
    @PutMapping("/{id}/payment")
    // ROLE: USER (update payment status) / SYSTEM (gateway callback)
    public ResponseEntity<BookingEntity> updatePaymentStatus(@PathVariable Long id, @RequestBody PaymentUpdateDto request) {
        BookingEntity updatedBooking = bookingService.updatePaymentStatus(id, request.getPaymentStatus());
        return ResponseEntity.ok(updatedBooking);
    }

    // ==================================================================
    // (8) LIST ACTIVE BOOKINGS FOR USER
   
    @GetMapping("/user/{username}/active")
    // ROLE: USER (check ongoing rides)
    public ResponseEntity<List<BookingEntity>> getActiveBookingsForUser(@PathVariable String username) {
        List<BookingEntity> activeBookings = bookingService.getActiveBookingsForUser(username);
        return ResponseEntity.ok(activeBookings);
    }

    // ==================================================================
    // (9)  UPDATE PASSENGER DETAILS
    
    @PutMapping("/user/{username}/update-details")
    // ROLE: USER (bulk update contact info across bookings)
    public ResponseEntity<Object> updatePassengerDetails(
            @PathVariable String username, 
            @RequestBody Map<String, String> updates) {
        int updatedCount = bookingService.updatePassengerDetails(username, updates);
        return ResponseEntity.ok(Map.of(
            "message", "Updated passenger details in " + updatedCount + " bookings",
            "updatedBookings", updatedCount
        ));
    }
    
    // ==================================================================
    // (10) LIST BOOKINGS FOR DRIVER
    @GetMapping("/driver/{driverId}")
    // ROLE: DRIVER (all bookings assigned) / ADMIN (driver audit)
    public ResponseEntity<List<BookingEntity>> getAllBookingsForDriver(@PathVariable Long driverId) {
        List<BookingEntity> bookings = bookingService.getAllBookingsForDriver(driverId);
        return ResponseEntity.ok(bookings);
    }

    // ==================================================================
    // (11) LIST CANCELLED BOOKINGS FOR DRIVER
    @GetMapping("/driver/{driverId}/cancelled")
    // ROLE: DRIVER (own cancelled) / ADMIN (audit)
    public ResponseEntity<List<BookingEntity>> getCancelledBookingsForDriver(@PathVariable Long driverId) {
        List<BookingEntity> bookings = bookingService.getCancelledBookingsForDriver(driverId);
        return ResponseEntity.ok(bookings);
    }

    // ==================================================================
    // (12) ACCEPT BOOKING (Driver)
    @PutMapping("/{bookingId}/accept")
    // ROLE: DRIVER (accept booking)
    public ResponseEntity<BookingEntity> acceptBooking(@PathVariable Long bookingId, @RequestParam Long driverId) {
        BookingEntity booking = bookingService.acceptBooking(bookingId, driverId);
        return ResponseEntity.ok(booking);
    }
    
    // ==================================================================
    // (13) ACCEPT WITH DRIVER DETAILS
    @PutMapping("/{bookingId}/accept-with-details")
    // ROLE: DRIVER (accept booking + provide driver profile)
    public ResponseEntity<BookingEntity> acceptBookingWithDriverDetails(
            @PathVariable Long bookingId, 
            @RequestParam Long driverId,
            @RequestParam String driverName,
            @RequestParam String driverPhone) {
        BookingEntity booking = bookingService.acceptBookingWithDriverDetails(bookingId, driverId, driverName, driverPhone);
        return ResponseEntity.ok(booking);
    }

    // ==================================================================
    // (14) DENY BOOKING (Driver rejects)
    @PutMapping("/{bookingId}/deny")
    // ROLE: DRIVER (deny booking)
    public ResponseEntity<BookingEntity> denyBooking(@PathVariable Long bookingId, @RequestParam Long driverId) {
        BookingEntity booking = bookingService.denyBooking(bookingId, driverId);
        return ResponseEntity.ok(booking);
    }

    // ==================================================================
    // (15) COMPLETE RIDE
    @PutMapping("/{bookingId}/complete")
    // ROLE: DRIVER (mark ride complete)
    public ResponseEntity<BookingEntity> completeRide(@PathVariable Long bookingId) {
        BookingEntity booking = bookingService.completeRide(bookingId);
        return ResponseEntity.ok(booking);
    }
}




