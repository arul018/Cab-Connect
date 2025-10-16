package com.cts.cbs;

import com.cts.cbs.dto.BookingRequestDto;
import com.cts.cbs.entity.BookingEntity;
import com.cts.cbs.repository.BookingRepository;
import com.cts.cbs.service.BookingService;
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
        validBookingRequest = new BookingRequestDto(
                "Airport", "Hotel", "Economy", "2025-12-25",
                "john_doe", 150.0, 10.5, "9876543210"
        );

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

    // USER-RELATED TESTS (8 tests)
    
    @Test
    void testCreateBooking_Success() {
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(sampleBooking);
        BookingEntity result = bookingService.createBooking(validBookingRequest);
        assertNotNull(result);
        assertEquals("PENDING", result.getStatus());
        verify(bookingRepository, times(1)).save(any(BookingEntity.class));
    }

    @Test
    void testCreateBooking_InvalidDate() {
        validBookingRequest.setDate("25-12-2025");
        assertThrows(Exception.class, () -> bookingService.createBooking(validBookingRequest));
    }

    @Test
    void testGetBookingsByUsername() {
        List<BookingEntity> userBookings = Arrays.asList(sampleBooking);
        when(bookingRepository.findAllByBookedBy("john_doe")).thenReturn(userBookings);
        List<BookingEntity> result = bookingService.getBookingsByUsername("john_doe");
        assertEquals(1, result.size());
    }

    @Test
    void testGetActiveBookingsForUser() {
        List<BookingEntity> activeBookings = Arrays.asList(sampleBooking);
        when(bookingRepository.findActiveBookingsByUser("john_doe")).thenReturn(activeBookings);
        List<BookingEntity> result = bookingService.getActiveBookingsForUser("john_doe");
        assertEquals(1, result.size());
    }

    @Test
    void testCancelBooking_Success() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(sampleBooking);
        BookingEntity result = bookingService.cancelBooking(1L);
        assertNotNull(result);
    }

    @Test
    void testCancelBooking_AlreadyCompleted() {
        sampleBooking.setStatus("COMPLETED");
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        assertThrows(Exception.class, () -> bookingService.cancelBooking(1L));
    }

    @Test
    void testUpdatePaymentStatus() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(sampleBooking);
        BookingEntity result = bookingService.updatePaymentStatus(1L, "COMPLETED");
        assertNotNull(result);
    }

    @Test
    void testUpdatePassengerDetails() {
        List<BookingEntity> userBookings = Arrays.asList(sampleBooking);
        when(bookingRepository.findAllByBookedBy("john_doe")).thenReturn(userBookings);
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(sampleBooking);
        Map<String, String> updates = new HashMap<>();
        updates.put("phone", "9999999999");
        int result = bookingService.updatePassengerDetails("john_doe", updates);
        assertEquals(1, result);
    }
}