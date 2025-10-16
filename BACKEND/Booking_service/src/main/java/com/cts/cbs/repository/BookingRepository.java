package com.cts.cbs.repository;

import com.cts.cbs.entity.*; // Imports BookingEntity (your JPA mapped class)

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository; // Core Spring Data JPA interface
import org.springframework.data.jpa.repository.Query;          // Allows custom JPQL queries
import org.springframework.data.repository.query.Param;       // Binds method params into @Query expressions
import org.springframework.stereotype.Repository;              // Marks this interface as a Spring bean (optional with JpaRepository, but explicit is fine)

@Repository // Indicates repository layer (component scan picks it up)
public interface BookingRepository extends JpaRepository<BookingEntity, Long> {

    // (4) SUPPORTS service.getBookingsByUsername(): returns all bookings created by a given user.
    List<BookingEntity> findAllByBookedBy(String bookedBy);

    // (6) SUPPORTS service.getPendingBookings(): filter by exact status value.
    List<BookingEntity> findByStatus(String status);
    
    // (8) SUPPORTS service.getActiveBookingsForUser(): custom logic excluding closed states.
    @Query("SELECT b FROM BookingEntity b WHERE b.bookedBy = :bookedBy AND b.status NOT IN ('CANCELLED', 'COMPLETED', 'DENIED')")
    List<BookingEntity> findActiveBookingsByUser(@Param("bookedBy") String bookedBy);
    
    List<BookingEntity> findByBookedByAndStatus(String bookedBy, String status);

    // (10) SUPPORTS service.getAllBookingsForDriver(): all bookings assigned to a driver.
    List<BookingEntity> findAllByDriverId(Long driverId);

    // (11) SUPPORTS service.getCancelledBookingsForDriver(): only cancelled bookings for driver analytics.
    @Query("SELECT b FROM BookingEntity b WHERE b.driverId = :driverId AND b.status = 'CANCELLED'")
    List<BookingEntity> findCancelledBookingsForDriver(@Param("driverId") Long driverId);

  
}