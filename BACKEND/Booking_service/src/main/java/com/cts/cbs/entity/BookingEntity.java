package com.cts.cbs.entity;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "cab_bookings")
public class BookingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String pickupLocation;
    private String dropLocation;
    private String vehicleType;
    private LocalDate tripDate;
    private String bookedBy; // username
    private Double fare;
    private Double distance;
    private String status; // PENDING, ACCEPTED, DENIED, COMPLETED, CANCELLED// PENDING, ACCEPTED, DENIED, COMPLETED, CANCELLED
    
    //initially empty fields in table 
    private Long driverId;
    private String driverName;
    private String driverPhone;
    private String vehicleNumber;
    private String vehicleModel;
    
    private String passengerPhone;
    private String paymentStatus = "NOT COMPLETED";

    public BookingEntity() {
        super();
    }
    
    public BookingEntity(Long id, String pickupLocation, String dropLocation, String vehicleType, LocalDate tripDate,
            String bookedBy, Double fare, Double distance, String status, Long driverId, String driverName,
            String driverPhone, String vehicleNumber, String vehicleModel, String passengerPhone, String paymentStatus) {
        super();
        this.id = id;
        this.pickupLocation = pickupLocation;
        this.dropLocation = dropLocation;
        this.vehicleType = vehicleType;
        this.tripDate = tripDate;
        this.bookedBy = bookedBy;
        this.fare = fare;
        this.distance = distance;
        this.status = status;
        this.driverId = driverId;
        this.driverName = driverName;
        this.driverPhone = driverPhone;
        this.vehicleNumber = vehicleNumber;
        this.vehicleModel = vehicleModel;
        this.passengerPhone = passengerPhone;
        this.paymentStatus = paymentStatus;
    }
    
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getPickupLocation() {
        return pickupLocation;
    }
    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }
    public String getDropLocation() {
        return dropLocation;
    }
    public void setDropLocation(String dropLocation) {
        this.dropLocation = dropLocation;
    }
    public String getVehicleType() {
        return vehicleType;
    }
    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }
    public LocalDate getTripDate() {
        return tripDate;
    }
    public void setTripDate(LocalDate tripDate) {
        this.tripDate = tripDate;
    }
    public String getBookedBy() {
        return bookedBy;
    }
    public void setBookedBy(String bookedBy) {
        this.bookedBy = bookedBy;
    }
    public Double getFare() {
        return fare;
    }
    public void setFare(Double fare) {
        this.fare = fare;
    }
    public Double getDistance() {
        return distance;
    }
    public void setDistance(Double distance) {
        this.distance = distance;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public Long getDriverId() {
        return driverId;
    }
    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }
    public String getDriverName() {
        return driverName;
    }
    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }
    public String getDriverPhone() {
        return driverPhone;
    }
    public void setDriverPhone(String driverPhone) {
        this.driverPhone = driverPhone;
    }
    public String getVehicleNumber() {
        return vehicleNumber;
    }
    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }
    public String getVehicleModel() {
        return vehicleModel;
    }
    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }
    public String getPassengerPhone() {
        return passengerPhone;
    }
    public void setPassengerPhone(String passengerPhone) {
        this.passengerPhone = passengerPhone;
    }
    public String getPaymentStatus() {
        return paymentStatus;
    }
    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
    
    @Override
    public String toString() {
        return "BookingEntity [id=" + id + ", pickupLocation=" + pickupLocation + ", dropLocation=" + dropLocation
                + ", vehicleType=" + vehicleType + ", tripDate=" + tripDate + ", bookedBy=" + bookedBy + ", fare="
                + fare + ", distance=" + distance + ", status=" + status + ", driverId=" + driverId + ", driverName="
                + driverName + ", driverPhone=" + driverPhone + ", vehicleNumber=" + vehicleNumber + ", vehicleModel=" + vehicleModel + ", passengerPhone=" + passengerPhone
                + ", paymentStatus=" + paymentStatus + "]";
    }
}