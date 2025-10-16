import React, { useState, useEffect, useRef } from "react";
import Swal from 'sweetalert2';
import { Check, X } from "lucide-react";
import axios from "axios";

const DriverHome = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [ongoingRides, setOngoingRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const previousOngoingRidesRef = useRef([]);

  // Check if user is actually a driver
  useEffect(() => {
    const userRole = sessionStorage.getItem('role');
    if (userRole !== 'DRIVER') {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Only drivers can access this page.',
      }).then(() => {
        window.location.href = '/';
      });
      return;
    }
  }, []);

  // Fetch pending bookings and ongoing rides from backend
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = sessionStorage.getItem('jwtToken');
        const driverName = sessionStorage.getItem('driverName');
        if (!token || !driverName) return;

        // Get all PENDING bookings
        const pendingResponse = await axios.get('http://localhost:8305/api/bookings/pending', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (pendingResponse.status === 200) setPendingBookings(pendingResponse.data);

        // Get all bookings for this driver, for ongoing/cancelled logic
        const allBookingsResponse = await axios.get('http://localhost:8305/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (allBookingsResponse.status === 200) {
          const allBookings = allBookingsResponse.data;
          // Filter for current driver's ongoing rides
          const currentDriverOngoingRides = allBookings.filter(booking =>
            (booking.driverName === driverName ||
              (booking.driverName && booking.driverName.toLowerCase() === driverName.toLowerCase())) &&
            (booking.status === 'ACCEPTED' || booking.status === 'ONGOING')
          );
          // Filter for bookings that have been cancelled but were assigned to this driver
          const driverCancelledRides = allBookings.filter(booking =>
            (booking.driverName === driverName ||
              (booking.driverName && booking.driverName.toLowerCase() === driverName.toLowerCase())) &&
            booking.status === 'CANCELLED'
          );
          // Track which rides were ongoing but now are cancelled
          const currentOngoingIds = currentDriverOngoingRides.map(ride => ride.id);
          const newlyCancelledRides = previousOngoingRidesRef.current.filter(prevRide =>
            !currentOngoingIds.includes(prevRide.id) &&
            driverCancelledRides.some(cancelled => cancelled.id === prevRide.id)
          );
          // Show cancellation notifications for newly cancelled ongoing rides
          newlyCancelledRides.forEach(cancelledRide => {
            Swal.fire({
              icon: 'error',
              title: '🚫 Ride Cancelled by User',
              html: `
                <div class="text-left">
                  <p class="mb-3"><strong>Sorry for the inconvenience!</strong></p>
                  <p class="mb-2">User <strong>${cancelledRide.bookedBy}</strong> has cancelled their ongoing ride.</p>
                  <div class="bg-gray-100 p-3 rounded mt-3 text-sm">
                    <p><strong>📍 From:</strong> ${cancelledRide.pickupLocation}</p>
                    <p><strong>📍 To:</strong> ${cancelledRide.dropLocation}</p>
                    <p><strong>💰 Fare:</strong> ₹${cancelledRide.fare}</p>
                  </div>
                  <p class="mt-3 text-xs text-gray-600">You can now accept new bookings.</p>
                </div>
              `,
              confirmButtonText: 'Understood',
              confirmButtonColor: '#3085d6',
              timer: 10000,
              timerProgressBar: true,
              allowOutsideClick: false,
              customClass: {
                popup: 'animate-pulse'
              }
            });
          });

          previousOngoingRidesRef.current = currentDriverOngoingRides;
          setOngoingRides(currentDriverOngoingRides);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
    const interval = setInterval(fetchBookings, 3000);
    return () => clearInterval(interval);
  }, []);

  // Accept or Deny a booking
  const handleAction = async (bookingId, action) => {
    const booking = pendingBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const driverId = sessionStorage.getItem('userId');
    if (!driverId) {
      Swal.fire('Error', 'Driver information not found. Please login again.', 'error');
      return;
    }

    switch (action) {
      case "ACCEPTED":
        if (ongoingRides.length > 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Ongoing Ride Found',
            text: 'You already have an ongoing ride. Please complete it before accepting a new request.',
            confirmButtonText: 'Got it',
            confirmButtonColor: '#3085d6'
          });
          return;
        }

        Swal.fire({
          title: 'Accept Ride?',
          html: `Do you want to accept the ride from <strong>${booking.pickupLocation}</strong> to <strong>${booking.dropLocation}</strong>?<br><br>Passenger: <strong>${booking.bookedBy}</strong><br>Fare: <strong>₹${booking.fare}</strong>`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#28a745',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, accept it!'
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const token = sessionStorage.getItem('jwtToken');
              // Call DriverService accept endpoint
              const response = await axios.put(
                `http://localhost:8305/api/drivers/accept/${bookingId}?driverId=${driverId}`,
                {}, // No body needed
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );

              if (response.status === 200) {
                setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
                const acceptedBooking = {
                  ...booking,
                  status: 'ACCEPTED',
                  driverId: parseInt(driverId)
                };
                setOngoingRides(prev => [...prev, acceptedBooking]);
                Swal.fire({
                  title: 'Ride Accepted!',
                  text: `You have accepted the ride. Please head to ${booking.pickupLocation} to pick up ${booking.bookedBy}.`,
                  icon: 'success',
                  timer: 4000,
                  showConfirmButton: false,
                });
              } else {
                throw new Error(`Failed to update booking status: ${response.status} ${response.statusText}`);
              }
            } catch (error) {
              Swal.fire('Error', 'Failed to accept the ride. Please try again.', 'error');
            }
          }
        });
        break;

      case "DENIED":
        Swal.fire({
          title: 'Deny Ride?',
          text: "Are you sure you want to deny this ride request?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, deny it!'
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const token = sessionStorage.getItem('jwtToken');
              // Call DriverService deny endpoint
              const response = await axios.put(
                `http://localhost:8305/api/drivers/deny/${bookingId}?driverId=${driverId}`,
                {}, // No body needed
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );

              if (response.status === 200) {
                setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
                Swal.fire({
                  title: 'Ride Denied',
                  icon: 'info',
                  timer: 2500,
                  showConfirmButton: false,
                });
              } else {
                throw new Error('Failed to update booking status');
              }
            } catch (error) {
              Swal.fire('Error', 'Failed to deny the ride. Please try again.', 'error');
            }
          }
        });
        break;

      default:
        break;
    }
  };

  // End Ride logic (unchanged)
  const handleEndRide = async (rideId) => {
  const ride = ongoingRides.find(r => r.id === rideId);
  if (!ride) return;

  try {
    const token = sessionStorage.getItem('jwtToken');
    const response = await axios.get(`http://localhost:8305/api/bookings/${rideId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const rideDetails = response.data;
      const isPaymentCompleted =
        rideDetails.paymentStatus === "COMPLETED" ||
        rideDetails.paymentStatus === true ||
        rideDetails.paymentStatus === "true";

      if (!isPaymentCompleted) {
        Swal.fire({
          icon: 'warning',
          title: 'Payment Not Completed',
          html: `The passenger has not completed the payment yet.<br><br>Current status: <strong>${rideDetails.paymentStatus || 'Not set'}</strong><br><br>Ride can only be completed after successful payment.`,
          confirmButtonText: 'Got it',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }
    }
  } catch (error) {
    const result = await Swal.fire({
      icon: 'error',
      title: 'Unable to Verify Payment',
      text: 'Could not verify the payment status due to a connection issue. Do you want to proceed anyway?',
      showCancelButton: true,
      confirmButtonText: 'Proceed Anyway',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280'
    });
    if (!result.isConfirmed) {
      return;
    }
  }

  Swal.fire({
    title: 'Complete Ride?',
    text: `Are you sure you want to complete the ride to ${ride.dropLocation}? Payment has been confirmed.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, Complete Ride!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const token = sessionStorage.getItem('jwtToken');
        // Call DriverService complete endpoint
        const response = await axios.put(
          `http://localhost:8305/api/drivers/complete/${rideId}`,
          {}, // No body needed
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          setOngoingRides(prev => prev.filter(r => r.id !== rideId));
          Swal.fire({
            title: 'Ride Completed!',
            text: `Ride completed successfully. You earned ₹${ride.fare}!`,
            icon: 'success',
            timer: 3000,
            showConfirmButton: false,
          });
        } else {
          throw new Error('Failed to complete ride');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to complete the ride. Please try again.', 'error');
      }
    }
  });
};

  return (
    <>
      {/* Ongoing Rides Section */}
      {ongoingRides.length > 0 && (
        <section className="bg-blue-50 border border-blue-200 rounded-lg shadow-md mb-6">
          <div className="p-6 border-b border-blue-200">
            <h3 className="text-xl font-semibold text-blue-800">
              Current Ongoing Ride{ongoingRides.length > 1 ? 's' : ''} ({ongoingRides.length})
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {ongoingRides.map((ride) => (
              <div key={ride.id} className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">
                      {ride.pickupLocation} → {ride.dropLocation}
                    </p>
                    <p className="text-gray-600">
                      Passenger: <strong>{ride.bookedBy}</strong> | Phone: <strong>{ride.passengerPhone || 'N/A'}</strong>
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Vehicle: {ride.vehicleType} • Distance: {ride.distance}km
                    </p>
                    <p className="text-sm text-gray-500">
                      Trip Date: {ride.tripDate ? new Date(ride.tripDate + 'T00:00:00').toLocaleDateString('en-GB') : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {ride.status}
                    </span>
                    <p className="text-xl font-bold text-green-600 mt-2">₹{ride.fare}</p>
                    <button
                      onClick={() => handleEndRide(ride.id)}
                      className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Complete Ride
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Ride Requests */}
      <section className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            Ride Requests {pendingBookings.length > 0 && `(${pendingBookings.length} pending)`}
          </h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading ride requests...</p>
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 text-lg">No pending ride requests at the moment.</p>
              <p className="text-gray-500 text-sm mt-2">New requests will appear here automatically.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-sm text-gray-600 uppercase tracking-wider">
                  <th className="p-4 font-medium">Passenger</th>
                  <th className="p-4 font-medium">Trip Details</th>
                  <th className="p-4 font-medium">Fare & Distance</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{booking.bookedBy}</div>
                      <div className="text-sm text-gray-500">{booking.passengerPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{booking.pickupLocation}</div>
                      <div className="text-sm text-gray-500">to {booking.dropLocation}</div>
                      <div className="text-sm text-blue-600">Vehicle: {booking.vehicleType}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-green-600">₹{booking.fare}</div>
                      <div className="text-sm text-gray-500">{booking.distance} km</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-800">
                        {booking.tripDate ? new Date(booking.tripDate + 'T00:00:00').toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleAction(booking.id, "ACCEPTED")}
                          className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 flex items-center space-x-1 transition-colors"
                        >
                          <Check size={16} />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleAction(booking.id, "DENIED")}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 flex items-center space-x-1 transition-colors"
                        >
                          <X size={16} />
                          <span>Deny</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
};

export default DriverHome;