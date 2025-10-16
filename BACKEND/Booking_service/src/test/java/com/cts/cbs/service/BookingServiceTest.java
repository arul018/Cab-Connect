package com.cts.cbs.service;

import com.cts.cbs.dto.BookingRequestDto;
import com.cts.cbs.entity.BookingEntity;
import com.cts.cbs.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private BookingService bookingService;

    private BookingRequestDto validBookingRequest;
    private BookingEntity sampleBooking;

    @BeforeEach
    void setUp() {
        // Create valid booking request for testing
        validBookingRequest = new BookingRequestDto(
                "Airport", "Hotel", "Economy", "2025-12-25",
                "john_doe", 150.0, 10.5, "9876543210"
        );

        // Create sample booking entity
        sampleBooking = new BookingEntity();
        sampleBooking.setId(1L);
        sampleBooking.setPickupLocation("Airport");
        sampleBooking.setDropLocation("Hotel");
        sampleBooking.setVehicleType("Economy");
        sampleBooking.setTripDate(LocalDate.of(2025, 12, 25));
        sampleBooking.setBookedBy("john_doe");
        sampleBooking.setFare(150.0);
        sampleBooking.setDistance(10.5);
        sampleBooking.setPassengerPhone("9876543210");
        sampleBooking.setStatus("PENDING");
        sampleBooking.setPaymentStatus("NOT COMPLETED");
    }

    @Test
    void testCreateBooking_Success() {
        // Given
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(sampleBooking);

        // When
        BookingEntity result = bookingService.createBooking(validBookingRequest);

        // Then
        assertNotNull(result);
        assertEquals("Airport", result.getPickupLocation());
        assertEquals("Hotel", result.getDropLocation());
        assertEquals("PENDING", result.getStatus());
        assertEquals("NOT COMPLETED", result.getPaymentStatus());
        verify(bookingRepository, times(1)).save(any(BookingEntity.class));
    }

    @Test
    void testCreateBooking_NullRequest() {
        // When & Then
        assertThrows(Exception.class, () -> bookingService.createBooking(null));
        verify(bookingRepository, never()).save(any(BookingEntity.class));
    }

    @Test
    void testCreateBooking_NullDate() {
        // Given
        validBookingRequest.setDate(null);

        // When & Then
        assertThrows(Exception.class, () -> bookingService.createBooking(validBookingRequest));
        verify(bookingRepository, never()).save(any(BookingEntity.class));
    }

    @Test
    void testCreateBooking_EmptyDate() {
        // Given
        validBookingRequest.setDate("");

        // When & Then
        assertThrows(Exception.class, () -> bookingService.createBooking(validBookingRequest));
        verify(bookingRepository, never()).save(any(BookingEntity.class));
    }

    @Test
    void testCreateBooking_InvalidDateFormat() {
        // Given
        validBookingRequest.setDate("25-12-2025"); // Wrong format

        // When & Then
        assertThrows(Exception.class, () -> bookingService.createBooking(validBookingRequest));
        verify(bookingRepository, never()).save(any(BookingEntity.class));
    }

    @Test
    void testGetAllBookings() {
        // Given
        List<BookingEntity> bookings = Arrays.asList(sampleBooking);
        when(bookingRepository.findAll()).thenReturn(bookings);

        // When
        List<BookingEntity> result = bookingService.getAllBookings();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(sampleBooking, result.get(0));
        verify(bookingRepository, times(1)).findAll();
    }

    @Test
    void testGetBookingById_Success() {
        // Given
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));

        // When
        BookingEntity result = bookingService.getBookingById(1L);

        // Then
        assertNotNull(result);
        assertEquals(sampleBooking, result);
        verify(bookingRepository, times(1)).findById(1L);
    }

    @Test
    void testGetBookingById_NotFound() {
        // Given
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(Exception.class, () -> bookingService.getBookingById(999L));
        verify(bookingRepository, times(1)).findById(999L);
    }

    @Test
    void testGetBookingsByUsername() {
        // Given
        List<BookingEntity> userBookings = Arrays.asList(sampleBooking);
        when(bookingRepository.findAllByBookedBy("john_doe")).thenReturn(userBookings);

        // When
        List<BookingEntity> result = bookingService.getBookingsByUsername("john_doe");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(sampleBooking, result.get(0));
        verify(bookingRepository, times(1)).findAllByBookedBy("john_doe");
    }

    @Test
    void testCancelBooking_Success() {
        // Given
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(sampleBooking);

        // When
        BookingEntity result = bookingService.cancelBooking(1L);

        // Then
        assertNotNull(result);
        verify(bookingRepository, times(1)).findById(1L);
        verify(bookingRepository, times(1)).save(any(BookingEntity.class));
    }

    @Test
    void testCancelBooking_AlreadyCompleted() {
        // Given
        sampleBooking.setStatus("COMPLETED");
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));

        // When & Then
        assertThrows(Exception.class, () -> bookingService.cancelBooking(1L));
        verify(bookingRepository, times(1)).findById(1L);
        verify(bookingRepository, never()).save(any(BookingEntity.class));
    }

    @Test
    void testCancelBooking_AlreadyCancelled() {
        // Given
        sampleBooking.setStatus("CANCELLED");
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));

        // When & Then
        assertThrows(Exception.class, () -> bookingService.cancelBooking(1L));
        verify(bookingRepository, times(1)).findById(1L);
        verify(bookingRepository, never()).save(any(BookingEntity.class));
    }

    @Test
    void testGetPendingBookings() {
        // Given
        List<BookingEntity> pendingBookings = Arrays.asList(sampleBooking);
        when(bookingRepository.findByStatus("PENDING")).thenReturn(pendingBookings);

        // When
        List<BookingEntity> result = bookingService.getPendingBookings();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(sampleBooking, result.get(0));
        verify(bookingRepository, times(1)).findByStatus("PENDING");
    }

    @Test
    void testUpdatePaymentStatus() {
        // Given
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(sampleBooking);

        // When
        BookingEntity result = bookingService.updatePaymentStatus(1L, "COMPLETED");

        // Then
        assertNotNull(result);
        verify(bookingRepository, times(1)).findById(1L);
        verify(bookingRepository, times(1)).save(any(BookingEntity.class));
    }

    @Test
    void testGetActiveBookingsForUser() {
        // Given
        List<BookingEntity> activeBookings = Arrays.asList(sampleBooking);
        when(bookingRepository.findActiveBookingsByUser("john_doe")).thenReturn(activeBookings);

        // When
        List<BookingEntity> result = bookingService.getActiveBookingsForUser("john_doe");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(bookingRepository, times(1)).findActiveBookingsByUser("john_doe");
    }

    @Test
    void testUpdatePassengerDetails() {
        // Given
        List<BookingEntity> userBookings = Arrays.asList(sampleBooking);
        when(bookingRepository.findAllByBookedBy("john_doe")).thenReturn(userBookings);
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(sampleBooking);

        Map<String, String> updates = new HashMap<>();
        updates.put("phone", "9999999999");

        // When
        int result = bookingService.updatePassengerDetails("john_doe", updates);

        // Then
        assertEquals(1, result);
        verify(bookingRepository, times(1)).findAllByBookedBy("john_doe");
        verify(bookingRepository, times(1)).save(any(BookingEntity.class));
    }

    @Test
    void testGetAllBookingsForDriver() {
        // Given
        List<BookingEntity> driverBookings = Arrays.asList(sampleBooking);
        when(bookingRepository.findAllByDriverId(1L)).thenReturn(driverBookings);

        // When
        List<BookingEntity> result = bookingService.getAllBookingsForDriver(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(bookingRepository, times(1)).findAllByDriverId(1L);
    }

    @Test
    void testGetCancelledBookingsForDriver() {
        // Given
        List<BookingEntity> cancelledBookings = Arrays.asList(sampleBooking);
        when(bookingRepository.findCancelledBookingsForDriver(1L)).thenReturn(cancelledBookings);

        // When
        List<BookingEntity> result = bookingService.getCancelledBookingsForDriver(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(bookingRepository, times(1)).findCancelledBookingsForDriver(1L);
    }

    @Test
    void testAcceptBooking() {
        // Given
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(sampleBooking);

        // When
        BookingEntity result = bookingService.acceptBooking(1L, 100L);

        // Then
        assertNotNull(result);
        verify(bookingRepository, times(1)).findById(1L);
        verify(bookingRepository, times(1)).save(any(BookingEntity.class));
    }

    @Test
    void testAcceptBookingWithDriverDetails() {
        // Given
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(sampleBooking);

        // When
        BookingEntity result = bookingService.acceptBookingWithDriverDetails(1L, 100L, "Driver Name", "9876543210");

        // Then
        assertNotNull(result);
        verify(bookingRepository, times(1)).findById(1L);
        verify(bookingRepository, times(1)).save(any(BookingEntity.class));
    }

    @Test
    void testDenyBooking() {
        // Given
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(sampleBooking);

        // When
        BookingEntity result = bookingService.denyBooking(1L, 100L);

        // Then
        assertNotNull(result);
        verify(bookingRepository, times(1)).findById(1L);
        verify(bookingRepository, times(1)).save(any(BookingEntity.class));
    }

    @Test
    void testCompleteRide() {
        // Given
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(sampleBooking);

        // When
        BookingEntity result = bookingService.completeRide(1L);

        // Then
        assertNotNull(result);
        verify(bookingRepository, times(1)).findById(1L);
        verify(bookingRepository, times(1)).save(any(BookingEntity.class));
    }
}