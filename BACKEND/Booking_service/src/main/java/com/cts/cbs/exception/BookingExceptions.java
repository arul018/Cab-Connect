package com.cts.cbs.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class BookingExceptions {

    // All Booking Service Exceptions as static nested classes
    public static class BookingNotFoundException extends RuntimeException {
        public BookingNotFoundException(String message) {
            super(message);
        }
        
        public BookingNotFoundException(Long bookingId) {
            super("Booking with ID " + bookingId + " not found");
        }
    }

    public static class InvalidBookingDataException extends RuntimeException {
        public InvalidBookingDataException(String message) {
            super(message);
        }
    }

    public static class InvalidBookingOperationException extends RuntimeException {
        public InvalidBookingOperationException(String message) {
            super(message);
        }
    }

    public static class UnauthorizedAccessException extends RuntimeException {
        public UnauthorizedAccessException(String message) {
            super(message);
        }
        
        public UnauthorizedAccessException() {
            super("Access denied. Valid JWT token required");
        }
    }

    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<String> handleBookingNotFound(BookingNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Booking not found: " + e.getMessage());
    }

    @ExceptionHandler(InvalidBookingDataException.class)
    public ResponseEntity<String> handleInvalidBookingData(InvalidBookingDataException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Invalid booking data: " + e.getMessage());
    }

    @ExceptionHandler(InvalidBookingOperationException.class)
    public ResponseEntity<String> handleInvalidOperation(InvalidBookingOperationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Operation not allowed: " + e.getMessage());
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<String> handleUnauthorized(UnauthorizedAccessException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralError(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error processing request: " + e.getMessage());
    }
}