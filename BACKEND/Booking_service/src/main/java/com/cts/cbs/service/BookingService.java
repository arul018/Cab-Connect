package com.cts.cbs.service;
import com.cts.cbs.dto.BookingRequestDto;          // DTO carrying client booking input (no DB annotations).
import com.cts.cbs.dto.AcceptBookingRequestDto;    // (Unused now) Could wrap accept action payload if expanded later.
import com.cts.cbs.dto.DriverDetailsDto;           // (Unused) Potential refactor target for driver details passing.
import com.cts.cbs.entity.BookingEntity;           // JPA entity mapped to bookings table.
import com.cts.cbs.repository.BookingRepository;   // Spring Data JPA repository (auto implementation by Spring at runtime).
import org.springframework.beans.factory.annotation.Autowired; // Enables constructor injection (explicit here for clarity).
import org.springframework.stereotype.Service;                   // Marks this class as a Spring-managed service bean.
import org.springframework.transaction.annotation.Transactional; // Wraps method in a DB transaction (commit/rollback).

import java.time.LocalDate;  // Type-safe date (no time zone) for trip dates.
import java.util.List;
import java.util.Map;
import com.cts.cbs.exception.BookingExceptions;   // Custom domain exceptions (improve readability over generic RuntimeException).
import com.cts.cbs.client.DriverClient;

@Service 
public class BookingService {

    private final BookingRepository bookingRepository; // Data access dependency (CRUD + custom queries).
    private final DriverClient driverClient;
    @Autowired
    public BookingService(BookingRepository bookingRepository, DriverClient driverClient) {
        this.bookingRepository = bookingRepository; // Assign injected repository.
        this.driverClient = driverClient;
    }

    // ==================================================================
    // (1) createBooking
    // ROLE: USER (initiates a new booking)
    //BookingEntity-->return type of the method
    public BookingEntity createBooking(BookingRequestDto bookingRequest) {
        if (bookingRequest == null) {
            throw new BookingExceptions.InvalidBookingDataException("Booking request cannot be null");
        }
        BookingEntity newBooking = new BookingEntity();

        // Map core fields from request -> entity.
        newBooking.setPickupLocation(bookingRequest.getPickupLocation());
        newBooking.setDropLocation(bookingRequest.getDropLocation());
        newBooking.setVehicleType(bookingRequest.getVehicleType());

        // DATE HANDLING: Accept only ISO-8601 yyyy-MM-dd to keep parsing strict and predictable.
        String dateStr = bookingRequest.getDate();
        if (dateStr == null || dateStr.trim().isEmpty()) {
            throw new BookingExceptions.InvalidBookingDataException(
                "Date field is null or empty. Provide YYYY-MM-DD. Received: '" + dateStr + "'");
        }
        try {
            newBooking.setTripDate(LocalDate.parse(dateStr)); // LocalDate.parse enforces ISO-8601.
        } catch (Exception e) {
            throw new BookingExceptions.InvalidBookingDataException(
                "Invalid date format. Expect YYYY-MM-DD. Received: '" + dateStr + "'. Error: " + e.getMessage());
        }

        // Remaining direct assignments (no complex logic yet).
        newBooking.setBookedBy(bookingRequest.getBookedBy());
        newBooking.setFare(bookingRequest.getFare());
        newBooking.setDistance(bookingRequest.getDistance());
        newBooking.setPassengerPhone(bookingRequest.getPassengerPhone());

        // INITIAL LIFECYCLE STATE:
        newBooking.setStatus("PENDING");            // Booking awaiting driver assignment.
        newBooking.setPaymentStatus("NOT COMPLETED"); // Payment still not processed.

        return bookingRepository.save(newBooking); // Persist & return managed entity.
    }

    // ==================================================================
    // (2) getAllBookings
    // ROLE: ADMIN (system-wide overview) / INTERNAL
    public List<BookingEntity> getAllBookings() {
        return bookingRepository.findAll();
    }

    // ==================================================================
    // (3) getBookingById
    // ROLE: USER (own) / ADMIN (any)
    public BookingEntity getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new BookingExceptions.BookingNotFoundException(id));
    }

    // ==================================================================
    // (4) getBookingsByUsername
    // ROLE: USER (list own bookings)
    public List<BookingEntity> getBookingsByUsername(String username) {
        return bookingRepository.findAllByBookedBy(username);
    }
    
    // ==================================================================
    // (5) cancelBooking
    // ROLE: USER (cancel own booking)
    @Transactional
    public BookingEntity cancelBooking(Long id) {
        BookingEntity booking = getBookingById(id); // Re-use method (DRY principle).
        if ("COMPLETED".equals(booking.getStatus()) || "CANCELLED".equals(booking.getStatus())) {
            throw new BookingExceptions.InvalidBookingOperationException(
                "Cannot cancel booking with status: " + booking.getStatus());
        }
        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }
    
    // ==================================================================
    // (6) getPendingBookings
    // ROLE: DRIVER / ADMIN (find unassigned)
    public List<BookingEntity> getPendingBookings() {
        return bookingRepository.findByStatus("PENDING");
    }

    // ==================================================================
    // (7) updatePaymentStatus
    // ROLE: USER (after payment) / SYSTEM (payment callback)
    @Transactional
    public BookingEntity updatePaymentStatus(Long id, String paymentStatus) {
        BookingEntity booking = getBookingById(id);
        booking.setPaymentStatus(paymentStatus);
        return bookingRepository.save(booking);
    }

    // ==================================================================
    // (8) getActiveBookingsForUser
    // ROLE: USER (track ongoing rides)
    public List<BookingEntity> getActiveBookingsForUser(String username) {
        return bookingRepository.findActiveBookingsByUser(username);
    }

    // ==================================================================
    // (9) updatePassengerDetails
    // ROLE: USER (update contact info bulk)
    @Transactional
    public int updatePassengerDetails(String username, Map<String, String> updates) {
        List<BookingEntity> userBookings = bookingRepository.findAllByBookedBy(username);
        int updatedCount = 0;
        for (BookingEntity booking : userBookings) {
            boolean updated = false;
            if (updates.containsKey("phone")) { // Only supporting phone update currently.
                booking.setPassengerPhone(updates.get("phone"));
                updated = true;
            }
            if (updated) {
                bookingRepository.save(booking);
                updatedCount++;
            }
        }
        return updatedCount;
    }

    // ==================================================================
    // (10) getAllBookingsForDriver
    // ROLE: DRIVER (dashboard) / ADMIN (audit)
    public List<BookingEntity> getAllBookingsForDriver(Long driverId) {
        return bookingRepository.findAllByDriverId(driverId);
    }

    // ==================================================================
    // (11) getCancelledBookingsForDriver
    // ROLE: DRIVER (history) / ADMIN (audit)
    public List<BookingEntity> getCancelledBookingsForDriver(Long driverId) {
        return bookingRepository.findCancelledBookingsForDriver(driverId);
    }

    // ==================================================================
    // (12) acceptBooking
    // ROLE: DRIVER (claim booking)
    @Transactional
    public BookingEntity acceptBooking(Long bookingId, Long driverId) {
        BookingEntity booking = getBookingById(bookingId);
        booking.setDriverId(driverId);
        booking.setStatus("ACCEPTED");
        return bookingRepository.save(booking);
    }
    
    // ==================================================================
    // (13) acceptBookingWithDriverDetails
    // ROLE: DRIVER (claim + enrich)
    @Transactional
    public BookingEntity acceptBookingWithDriverDetails(Long bookingId, Long driverId, String driverName, String driverPhone) {
        BookingEntity booking = getBookingById(bookingId);
        
        // Fetch driver details from Authentication service
        try {
            var driverDetails = driverClient.getDriverById(driverId);
            booking.setVehicleNumber(driverDetails.getVehicleNumber());
            booking.setVehicleModel(driverDetails.getVehicleModel());
        } catch (Exception e) {
            // If fetch fails, continue without vehicle details
            System.out.println("Could not fetch driver details: " + e.getMessage());
        }
        
        booking.setDriverId(driverId);
        booking.setStatus("ACCEPTED");
        booking.setDriverName(driverName);
        booking.setDriverPhone(driverPhone);
        return bookingRepository.save(booking);
    }

    // ==================================================================
    // (14) denyBooking
    // ROLE: DRIVER (decline)
    @Transactional
    public BookingEntity denyBooking(Long bookingId, Long driverId) {
        BookingEntity booking = getBookingById(bookingId);
        booking.setStatus("DENIED");
        booking.setDriverId(driverId);
        return bookingRepository.save(booking);
    }

    // ==================================================================
    // (15) completeRide
    // ROLE: DRIVER (finish ride)
    @Transactional
    public BookingEntity completeRide(Long bookingId) {
        BookingEntity booking = getBookingById(bookingId);
        booking.setStatus("COMPLETED");
        return bookingRepository.save(booking);
    }
}