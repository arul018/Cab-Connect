import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight, FaCar, FaArrowLeft } from "react-icons/fa";

const RideHistory = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's ride history from backend
  useEffect(() => {
    const fetchUserRideHistory = async () => {
      try {
        const token = sessionStorage.getItem('jwtToken') || 
                    sessionStorage.getItem('token') || 
                    sessionStorage.getItem('authToken');
        
        const currentUserName = sessionStorage.getItem('name') || 
                              sessionStorage.getItem('username') || 
                              sessionStorage.getItem('driverName') ||
                              sessionStorage.getItem('email') ||
                              sessionStorage.getItem('userEmail');

        const response = await fetch(`http://localhost:8305/api/bookings`, {
          headers: token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } : {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const allBookings = await response.json();
          
          const userBookings = allBookings.filter(booking => {
            const userName = currentUserName?.toLowerCase() || '';
            const bookedBy = booking.bookedBy?.toLowerCase() || '';
            
            // Only show completed rides for users (no denied/cancelled rides)
            const isUserBooking = bookedBy.includes(userName) || userName.includes(bookedBy);
            const isCompletedRide = booking.status === 'COMPLETED' || booking.status === 'ACCEPTED';
            
            return isUserBooking && isCompletedRide;
          });

          setRides(userBookings.map(booking => ({
            id: booking.id,
            date: booking.tripDate,
            pickup: booking.pickupLocation,
            drop: booking.dropLocation,
            driver: booking.driverName || 'Not assigned',
            vehicle: booking.vehicleType,
            fare: parseFloat(booking.fare) || 0,
            status: booking.status,
            distance: booking.distance || 'N/A',
            passengerPhone: booking.passengerPhone
          })));
        } else {
          setRides([]);
        }
      } catch (error) {
        console.error('Error fetching ride history:', error);
        setRides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRideHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your ride history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">My Ride History</h2>
          <p className="text-gray-600">Your completed rides and trip details</p>
          
          {/* Back to Home Button */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </button>
          </div>
        </div>

        {rides.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaCar className="mx-auto h-16 w-16 text-gray-300 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">No Completed Rides Yet</h3>
            <p className="text-gray-600 mb-8">Book your first ride to see your trip history here!</p>
            <button
              onClick={() => navigate('/booking')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Book a Ride
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div key={ride.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <FaCalendarAlt className="mr-2" />
                      {ride.date ? new Date(ride.date + 'T00:00:00').toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </div>
                    
                    <div className="flex items-center text-gray-800 mb-2">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-green-500 mr-2 flex-shrink-0" />
                        <span className="font-medium">{ride.pickup}</span>
                      </div>
                      <FaArrowRight className="mx-4 text-gray-400" />
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-red-500 mr-2 flex-shrink-0" />
                        <span className="font-medium">{ride.drop}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span>Driver: <strong>{ride.driver}</strong></span>
                      <span>Vehicle: <strong>{ride.vehicle}</strong></span>
                      <span>Distance: <strong>{ride.distance} km</strong></span>
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-green-600 flex items-center justify-end mb-2">
                      <span>₹{ride.fare}</span>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      ride.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ride.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RideHistory;