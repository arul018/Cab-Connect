import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCarSide, FaRupeeSign, FaRoad, FaClock, FaUserTie, FaPhone, FaArrowLeft, FaHashtag, FaIdCard, FaHome, FaCalendarAlt, FaRegClock, FaTimes, FaSpinner, FaUser } from 'react-icons/fa';
import Header from './Header';
import Swal from 'sweetalert2';

// Helper component for detail items to reduce repetition and improve readability
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="text-gray-400 mr-4 text-lg mt-1">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

function Confirmbook() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // State for booking data from backend
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract booking ID from state (this is the only thing we need from frontend)
  const bookingId = state?.bookingId || state?.id;

  // Fetch booking details from backend
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        const token = sessionStorage.getItem('jwtToken');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8305/api/bookings/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const booking = await response.json();
          setBookingData(booking);
        } else if (response.status === 404) {
          setError('Booking not found');
        } else {
          setError('Failed to fetch booking details');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError('Could not connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  // Vehicle images mapping (since this is frontend display data)
  const vehicleImages = {
    economy: '/src/assets/ECONOMY.png',
    standard: '/src/assets/STANDARD.png', 
    luxury: '/src/assets/BUSINESS.png',
    suv: '/src/assets/BUSINESS.png' // fallback
  };

  // Vehicle display names mapping
  const vehicleDisplayNames = {
    economy: 'Economy',
    standard: 'Standard',
    luxury: 'Luxury',
    suv: 'SUV'
  };

  // Function to check if user has ongoing ride
  const checkOngoingRide = async () => {
    const token = sessionStorage.getItem('jwtToken');
    const username = sessionStorage.getItem('username') || sessionStorage.getItem('driverName');
    
    if (!token || !username) return false;

    try {
      const response = await fetch('http://localhost:8305/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const allBookings = await response.json();
        
        // Check if user has any ongoing rides (ACCEPTED or ONGOING status)
        const userOngoingRides = allBookings.filter(booking => 
          booking.bookedBy === username && 
          (booking.status === 'ACCEPTED' || booking.status === 'ONGOING')
        );

        return userOngoingRides.length > 0;
      }
    } catch (error) {
      console.error('Error checking ongoing rides:', error);
    }
    
    return false;
  };

  // Handle navigation to home with ongoing ride check
  const handleBackToHome = async () => {
    const hasOngoingRide = await checkOngoingRide();
    
    if (hasOngoingRide) {
      Swal.fire({
        icon: 'warning',
        title: 'Ongoing Ride Active',
        html: 'You have an ongoing ride. You cannot go back to home until you:<br><br>• Complete your current ride, or<br>• Cancel your booking',
        confirmButtonText: 'Got it',
        confirmButtonColor: '#f59e0b',
        showCancelButton: true,
        cancelButtonText: 'Cancel Booking',
        cancelButtonColor: '#ef4444'
      }).then(async (result) => {
        if (!result.isConfirmed && result.dismiss === Swal.DismissReason.cancel) {
          // User clicked "Cancel Booking"
          const confirmCancel = await Swal.fire({
            title: 'Cancel Booking?',
            text: 'Are you sure you want to cancel your ongoing ride?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it'
          });

          if (confirmCancel.isConfirmed) {
            // Call API to cancel booking
            await cancelBooking();
          }
        }
      });
    } else {
      navigate('/');
    }
  };

  // Function to cancel booking - works for any status including ongoing rides
  const cancelBooking = async () => {
    const token = sessionStorage.getItem('jwtToken');
    
    try {
      // Use PUT endpoint which internally sets status to CANCELLED
      const response = await fetch(`http://localhost:8305/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Booking Cancelled',
          html: 'Your booking has been cancelled successfully.<br><br><span class="text-sm text-gray-600">The driver has been notified about the cancellation.</span>',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10B981'
        }).then(() => {
          navigate('/');
        });
      } else if (response.status === 400) {
        // Handle cases where booking cannot be cancelled
        Swal.fire({
          icon: 'warning',
          title: 'Cannot Cancel',
          text: 'This booking cannot be cancelled (it may already be completed or cancelled).',
          confirmButtonText: 'OK'
        });
      } else {
        throw new Error('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Swal.fire({
        icon: 'error',
        title: 'Cancellation Failed',
        text: 'Could not cancel the booking. Please try again or contact support.',
        confirmButtonText: 'OK'
      });
    }
  };

  // Handle direct cancel booking button click - works for any booking status
  const handleCancelBooking = () => {
    if (!bookingData) return;
    
    Swal.fire({
      title: 'Cancel Booking?',
      html: `Are you sure you want to cancel your ride from <strong>${bookingData.pickupLocation}</strong> to <strong>${bookingData.dropLocation}</strong>?<br><br><span class="text-sm text-red-600">⚠️ If your ride is ongoing, the driver will be notified immediately.</span><br><br>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await cancelBooking();
      }
    });
  };

  // Loading state
  if (loading) {
    return (
      <Header>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
          <FaSpinner className="animate-spin text-4xl text-yellow-400 mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </Header>
    );
  }

  // Error state
  if (error || !bookingData) {
    return (
      <Header>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              {error === 'No booking ID provided' ? 'Booking Details Missing' : 'Error Loading Booking'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'We couldn\'t find your booking information. Please return to the homepage to start a new booking.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-500 transition-all transform hover:scale-105 shadow-lg"
            >
              <FaArrowLeft className="mr-2" /> Back to Home
            </button>
          </div>
        </div>
      </Header>
    );
  }

  // Extract data from backend response
  const {
    pickupLocation,
    dropLocation,
    vehicleType,
    tripDate,
    fare,
    distance,
    driverName,
    driverPhone,
    bookedBy,
    status
  } = bookingData;

  // Format data for display
  const vehicleImage = vehicleImages[vehicleType] || vehicleImages.economy;
  const vehicleDisplayName = vehicleDisplayNames[vehicleType] || vehicleType;
  const formattedDate = tripDate 
    ? new Date(tripDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A';
  const formattedDistance = distance ? `${distance} km` : 'N/A';
  const formattedFare = fare ? `₹${fare}` : 'N/A';
  
  // Get current time as booking time (since we don't store booking time)
  const currentTime = new Date().toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  const handleProceedToPay = () => {
    if (!bookingData) return;
    
    Swal.fire({
      title: 'Is your ride completed?',
      text: "You can only proceed to payment after your ride has ended.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#34D399', // A green color for confirmation
      cancelButtonColor: '#EF4444', // A red color for cancellation
      confirmButtonText: 'Yes, it\'s completed!',
      cancelButtonText: 'Not yet'
    }).then((rideResult) => {
      if (rideResult.isConfirmed) {
        Swal.fire({
          title: 'Proceed to Payment',
          text: `You are about to pay ${formattedFare}. Are you sure?`,
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#4F46E5',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, proceed!'
        }).then((paymentResult) => {
          if (paymentResult.isConfirmed) {
            navigate('/payment', { state: { fare: formattedFare, bookingId } });
          }
        });
      }
    })
  };

  return (
    <Header>
      <main className="py-8 bg-gray-100">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            {/* Image Section */}
            <div className="relative">
              <img src={vehicleImage} alt={vehicleDisplayName} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <h1 className="text-2xl font-bold text-white tracking-tight">{vehicleDisplayName} Cab</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                  <p className="text-yellow-300 font-medium whitespace-nowrap">{bookingData.vehicleModel || vehicleDisplayName}</p>
                  <div className="inline-flex items-center bg-white/90 border-2 border-black shadow-lg px-2 py-1 rounded-md backdrop-blur-sm">
                    <span className="font-bold text-xs text-blue-700 mr-2">IND</span>
                    <p className="font-mono tracking-wider text-black text-sm font-bold whitespace-nowrap">
                      {bookingData.vehicleNumber || 'Will be assigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">Booking Confirmed</h2>
                <p className="flex items-center justify-center text-gray-500 text-xs mt-2">
                  <FaHashtag className="mr-2" />
                  Booking ID: <span className="font-bold text-gray-700 ml-1">{bookingId}</span>
                </p>
              </div>

              {/* Vehicle Details Section */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                <div className="text-center">
                  <p className="text-sm text-blue-700 uppercase font-semibold tracking-wider mb-2">Your Vehicle</p>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-lg font-bold text-blue-900">{bookingData.vehicleModel || vehicleDisplayName}</p>
                    <div className="inline-flex items-center bg-white border-2 border-blue-300 shadow-sm px-3 py-1 rounded-md">
                      <span className="font-bold text-xs text-blue-700 mr-2">IND</span>
                      <p className="font-mono tracking-wider text-blue-900 text-sm font-bold">
                        {bookingData.vehicleNumber || 'Will be assigned'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Route */}
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center self-stretch">
                    <FaMapMarkerAlt className="text-green-500 text-lg" />
                    <div className="h-full w-px bg-gray-300 my-2 border-l border-dashed"></div>
                    <FaMapMarkerAlt className="text-red-500 text-lg" />
                  </div>
                  <div className="w-full space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Pickup</p>
                      <p className="font-medium text-md text-gray-800">{pickupLocation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Drop</p>
                      <p className="font-medium text-md text-gray-800">{dropLocation}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlighted ETA */}
              <div className="text-center bg-blue-50 p-4 rounded-lg my-6 border border-blue-200">
                <p className="text-sm text-blue-700 uppercase font-semibold tracking-wider">Booking Status</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <FaRegClock className="text-blue-800 text-xl" />
                  <p className="text-2xl font-bold text-blue-900">{status || 'PENDING'}</p>
                </div>
              </div>

              {/* Driver Arrival Status */}
              {status === 'ACCEPTED' && (
                <div className="my-6 bg-green-50 border border-green-200 p-4 rounded-lg flex items-center justify-center gap-3 shadow-sm">
                  <FaCarSide className="text-green-600 text-xl" />
                  <p className="text-sm font-medium text-green-800">
                    Your cab has been assigned and the driver is on the way for pickup.
                    </p>
                </div>
              )}

              {/* Ride & Driver Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 bg-gray-50 p-6 rounded-lg border">
                <DetailItem
                  icon={<FaCalendarAlt />}
                  label="Booking Date"
                  value={formattedDate}
                />
                <DetailItem icon={<FaClock />} label="Booking Time" value={currentTime} />
                <DetailItem icon={<FaUser />} label="Booked By" value={bookedBy || 'N/A'} />
                <DetailItem icon={<FaRupeeSign />} label="Estimated Fare" value={formattedFare} />
                <DetailItem icon={<FaRoad />} label="Distance" value={formattedDistance} />
                <DetailItem icon={<FaUserTie />} label="Driver" value={driverName || 'Assigning...'} />
                <DetailItem icon={<FaPhone />} label="Driver Contact" value={driverPhone || 'Will be provided'} />
                <DetailItem icon={<FaCarSide />} label="Cab Category" value={vehicleDisplayName} />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                <button
                  onClick={handleBackToHome}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-gray-200 text-gray-800 font-semibold px-8 py-2 rounded-lg hover:bg-gray-300 transition-all text-sm"
                >
                  <FaHome className="mr-2" />
                  Back to Home
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-red-500 text-white font-semibold px-8 py-2 rounded-lg hover:bg-red-600 transition-all text-sm"
                >
                  <FaTimes className="mr-2" />
                  Cancel Booking
                </button>
                <button
                  className="w-full sm:w-auto bg-green-500 text-white font-bold px-8 py-2 rounded-lg hover:bg-green-600 transition-all shadow-md hover:shadow-lg text-sm"
                  onClick={handleProceedToPay}
                >
                  Proceed to Pay {formattedFare}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Header>
  );
}

export default Confirmbook;
