package com.cts.cbs.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

// This class represents the data coming from the frontend form for creating new bookings
public class BookingRequestDto {
    private String pickupLocation;
    private String dropLocation;
    private String vehicleType;
    private String date;        // The date string in "YYYY-MM-DD" format
    private String bookedBy;    // The username of the person booking
    private Double fare;
    private Double distance;
    private String passengerPhone;
    
    public BookingRequestDto() {
        super();
    }
    
    public BookingRequestDto(String pickupLocation, String dropLocation, String vehicleType, String date,
            String bookedBy, Double fare, Double distance, String passengerPhone) {
        super();
        this.pickupLocation = pickupLocation;
        this.dropLocation = dropLocation;
        this.vehicleType = vehicleType;
        this.date = date;
        this.bookedBy = bookedBy;
        this.fare = fare;
        this.distance = distance;
        this.passengerPhone = passengerPhone;
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
    
    public String getDate() {
        return date;
    }
    
    public void setDate(String date) {
        this.date = date;
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
    
    public String getPassengerPhone() {
        return passengerPhone;
    }
    
    public void setPassengerPhone(String passengerPhone) {
        this.passengerPhone = passengerPhone;
    }
    
    @Override
    public String toString() {
        return "BookingRequestDto [pickupLocation=" + pickupLocation + ", dropLocation=" + dropLocation
                + ", vehicleType=" + vehicleType + ", date=" + date + ", bookedBy=" + bookedBy + ", fare=" + fare
                + ", distance=" + distance + ", passengerPhone=" + passengerPhone + "]";
    }
}