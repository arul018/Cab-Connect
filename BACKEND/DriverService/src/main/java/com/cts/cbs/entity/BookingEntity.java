package com.cts.cbs.entity;

import java.time.LocalDate; // Represents a date without time-of-day (good for travel date)

// BookingEntity (DriverService side):
// NOTE: This class is acting as a simple Data Transfer Object (DTO) here.
// It is NOT annotated with @Entity, so JPA/Hibernate will NOT map it to a database table in this service.
// PURPOSE IN MICROSERVICE CONTEXT:
//  - Mirror of the Booking structure from Booking Service for inter-service communication (e.g., Feign, RestTemplate).
//  - Keeps only the fields DriverService needs to display or process driver-related booking actions.
// If you later persist bookings in DriverService, you would add @Entity, @Table, @Id, etc.
public class BookingEntity {

    // ===================== IDENTIFIERS & CORE INFO =====================
    private Long id;                // Unique booking identifier (primary key in booking service DB)
    private String pickupLocation;  // Where the passenger starts
    private String dropLocation;    // Destination
    private String vehicleType;     // e.g., MINI, SEDAN, SUV
    private LocalDate tripDate;     // Date of the trip (no time portion)

    // ===================== USER & FARE DETAILS =====================
    private String bookedBy;        // Username / identifier of the passenger who created the booking
    private Double fare;            // Calculated fare (could be null until priced)
    private Double distance;        // Trip distance (units depend on calculation logic, e.g. km)

    // ===================== STATUS & DRIVER ASSIGNMENT =====================
    private String status;          // Lifecycle: PENDING, ACCEPTED, DENIED, CANCELLED, COMPLETED
    private Long driverId;          // Assigned driver ID (nullable until accepted)
    private String driverName;      // Cached driver name (denormalized for quick display)
    private String driverPhone;     // Driver contact (for passenger display)

    // ===================== PASSENGER & PAYMENT =====================
    private String passengerPhone;  // Passenger phone (for driver use / verification)
    private String paymentStatus;   // e.g., NOT COMPLETED, PENDING, COMPLETED, FAILED

    // ===================== CONSTRUCTOR =====================
    public BookingEntity() {
        super(); // Explicit call (not required) but shows intentional default construction
    }

    // ===================== GETTERS & SETTERS =====================
    // Each getter/setter provides controlled access to fields.
    // In a pure DTO this is fine; for immutability consider records or Lombok (@Data) in future.
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }
    
    public String getDropLocation() { return dropLocation; }
    public void setDropLocation(String dropLocation) { this.dropLocation = dropLocation; }
    
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    
    public LocalDate getTripDate() { return tripDate; }
    public void setTripDate(LocalDate tripDate) { this.tripDate = tripDate; }
    
    public String getBookedBy() { return bookedBy; }
    public void setBookedBy(String bookedBy) { this.bookedBy = bookedBy; }
    
    public Double getFare() { return fare; }
    public void setFare(Double fare) { this.fare = fare; }
    
    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
    
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    
    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }
    
    public String getPassengerPhone() { return passengerPhone; }
    public void setPassengerPhone(String passengerPhone) { this.passengerPhone = passengerPhone; }
    
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}
