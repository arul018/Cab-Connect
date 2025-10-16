

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet';
import routeData from "../../data/routeData.json";
import  cabImage2  from '../../assets/cab2.png';
import ECONOMY from '../../assets/ECONOMY.png';
import STANDARD from '../../assets/STANDARD.png';
import BUSINESS from '../../assets/BUSINESS.png';
import { FaMapMarkerAlt, FaChevronDown, FaCalendarAlt, FaClock } from "react-icons/fa";

// Fix for default marker icon issue with webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;
 
const WaitingForDriver = () => (
  <div className="bg-blue-50 p-6 rounded-lg border-2 border-dashed border-blue-200 space-y-4 mt-4 text-center">
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
    <p className="text-lg font-bold text-blue-800">Waiting for a driver...</p>
    <p className="text-sm text-blue-600">We're searching for a nearby driver to accept your ride request.</p>
  </div>
);


const Booking = () => {
const [start, setStart] = useState('');
const [end, setEnd] = useState('');
const [vehicle, setVehicle] = useState(null);
const [fare, setFare] = useState(null);
const [eta, setEta] = useState(null);
const [pickupEtaMinutes, setPickupEtaMinutes] = useState(null);
const [distance, setDistance] = useState(null);
const [loading, setLoading] = useState(false);
const [isWaitingForDriver, setIsWaitingForDriver] = useState(false);

// Check for ongoing rides when component mounts
useEffect(() => {
  const checkOngoingRideOnMount = async () => {
    const token = sessionStorage.getItem('jwtToken');
    const username = sessionStorage.getItem('username') || sessionStorage.getItem('driverName');
    
    if (!token || !username) return;

    try {
      // await is used in programming (especially in JavaScript and Python) to pause the code until a task (like fetching data) is finished, 
      const response =await  fetch('http://localhost:8305/api/bookings', {
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

        if (userOngoingRides.length > 0) {
          Swal.fire({
            icon: 'info',
            title: 'Ongoing Ride Active',
            html: 'You have an ongoing ride. You cannot make a new booking until you complete your current ride.',
            confirmButtonText: 'View My Rides',
            confirmButtonColor: '#f59e0b',
            showCancelButton: true,
            cancelButtonText: 'Go to Home',
            cancelButtonColor: '#6b7280'
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/ridehistory');
            } else {
              navigate('/');
            }
          });
        }
      }
    } catch (error) {
      console.error('Error checking ongoing rides:', error);
    }
  };

  checkOngoingRideOnMount();
}, []);
const [formFilled, setFormFilled] = useState(false);
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [date, setDate] = useState('');
const [displayDate, setDisplayDate] = useState('Loading date...');
const [errorMessage, setErrorMessage] = useState('');
const isWaitingRef = useRef(false); // Ref to track waiting state in closures
const dropdownRef = useRef(null);
const chennaiPosition = [13.0827, 80.2707]; 


const navigate = useNavigate();
 
const vehicles = [
  {
    id: 'economy',
    name: 'Economy',
    model: 'Maruti Ritz',
    numberPlate: 'TN 01 AB 1234',
    image: ECONOMY,
    rate: 12,
  },
  {
    id: 'standard',
    name: 'Standard',
    model: 'Maruti Ciaz',
    numberPlate: 'TN 02 CD 5678',
    image: STANDARD,
    rate: 15,
  },
  {
    id: 'luxury',
    name: 'Luxury',
    model: 'Maruti Zentra',
    numberPlate: 'TN 03 EF 9012',
    image: BUSINESS,
    rate: 20,
  },
];

const avgSpeed = 30; // km/h
 
 

const handleFindCabs = () => {
  
 // Reset previous states
 setFare(null);
 setEta(null);
 setPickupEtaMinutes(null);
 setDistance(null);
 setIsWaitingForDriver(false);
 setFormFilled(false);
 setErrorMessage('');

 // Validate form fields
 if (!start || !end || !vehicle) {
  Swal.fire({
    icon: 'warning',
    title: 'Missing Information',
    text: 'Please select pickup, drop, and vehicle type.',
  });
  return;
 }

 // New validation for same location
 if (start === end) {
  setErrorMessage('Pickup and drop locations cannot be the same.');
  return;
 }

 setLoading(true); // 👉 Start loading

 setTimeout(() => {
  const key1 = `${start.toLowerCase()}-${end.toLowerCase()}`;
  const key2 = `${end.toLowerCase()}-${start.toLowerCase()}`;
  const route = routeData[key1] || routeData[key2];

  if (!route) {
    setErrorMessage('Route not available. Please select a different route.');
    setEta(null);
    setDistance(null);
    setFormFilled(false);
  } else {
    const cost = Math.ceil(route.distance * vehicle.rate);
    const tripDurationInMinutes = Math.ceil((route.distance / avgSpeed) * 60);

    // Simulate time for cab to reach pickup location
    const pickupTime = Math.floor(Math.random() * (10 - 5 + 1)) + 5; // Random time: 5 to 10 mins
    setPickupEtaMinutes(pickupTime);

    // Calculate final arrival time, including pickup time
    const arrivalTimestamp = new Date();
    arrivalTimestamp.setMinutes(arrivalTimestamp.getMinutes() + tripDurationInMinutes + pickupTime);
    const ampm = arrivalTimestamp.getHours() >= 12 ? 'PM' : 'AM';
    const displayHours = (arrivalTimestamp.getHours() % 12) || 12; // Convert 0 to 12 for 12 AM
    const minutes = arrivalTimestamp.getMinutes().toString().padStart(2, '0');
    const arrivalTime = `${displayHours.toString().padStart(2, '0')}:${minutes} ${ampm}`;

    setFare(`₹${cost}`);
    setEta(arrivalTime);
    setDistance(route.distance);
    setFormFilled(true);
    setErrorMessage(''); // Clear any previous error
  }

 setLoading(false); // ✅ Stop loading after 3 seconds
 }, 3000);
};

// Close dropdown on outside click
useEffect(() => {
  function handleClickOutside(event) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

// Set today's date on component mount and keep it updated
useEffect(() => {
  const now = new Date();
  
  // Get today's date in local timezone (avoiding UTC conversion issues)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const localDateString = `${year}-${month}-${day}`;
  
  // Format for logic and submission (YYYY-MM-DD in local timezone)
  setDate(localDateString);
  
  // Format for elegant display
  setDisplayDate(now.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  }));
}, []);
 
const uniquePlaces = [
...new Set([
...Object.keys(routeData).map(key => key.split('-')[0]),
...Object.keys(routeData).map(key => key.split('-')[1]),
]),
];
 
const handleProceed = async () => {
  if (loading) {
    Swal.fire({
      icon: 'info',
      title: 'Please Wait',
      text: 'We are still finding available cabs...',
    });
    return;
  }

  
  if (
    !formFilled || !fare || !vehicle || !distance || !eta || !pickupEtaMinutes || errorMessage
  ) {  
    Swal.fire({
      icon: 'error',
      title: 'Cannot Proceed',
      text: 'Cab details are not ready or the form is incomplete. Please find a cab first.',
    });
    return;  
  }  

  // --- Get the logged-in user's token ---
  const token = sessionStorage.getItem('jwtToken');
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Authentication Required',
      text: 'You must be logged in to book a cab.',
      confirmButtonText: 'Go to Login',
    }).then(() => navigate('/login'));
    return;
  }

  // --- Get the logged-in user's name ---
  const username = sessionStorage.getItem('username') || sessionStorage.getItem('driverName');
  if (!username) {
    Swal.fire({
      icon: 'error',
      title: 'User Not Found',
      text: 'Could not find user information. Please log in again.',
      confirmButtonText: 'Go to Login',
    }).then(() => navigate('/login'));
    return;
  }

  // --- Check if user already has an ongoing ride ---
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

      if (userOngoingRides.length > 0) {
        const ongoingRide = userOngoingRides[0];
        Swal.fire({
          icon: 'warning',
          title: 'Ongoing Ride Found',
          html: `You already have an ongoing ride from <strong>${ongoingRide.pickupLocation}</strong> to <strong>${ongoingRide.dropLocation}</strong>.<br><br>Please complete your current ride before booking a new one.`,
          confirmButtonText: 'Got it',
          confirmButtonColor: '#f59e0b'
        });
        return;
      }
    }
  } catch (error) {
    console.error('Error checking ongoing rides:', error);
    // Continue with booking if check fails (don't block user completely)
  }

  // --- Get the logged-in user's phone ---
  const passengerPhone = sessionStorage.getItem('phone');
  if (!passengerPhone) {
    // Try to get from stored userProfile as fallback
    const userProfile = JSON.parse(sessionStorage.getItem('userProfile') || '{}');
    if (!userProfile.phone) {
      Swal.fire({
        icon: 'warning',
        title: 'Phone Number Missing',
        text: 'Phone number is required for booking. Please update your profile.',
        confirmButtonText: 'Continue Anyway',
        showCancelButton: true,
        cancelButtonText: 'Go to Profile',
      }).then((result) => {
        if (!result.isConfirmed) {
          navigate('/profile');
        }
      });
      // Continue with booking even without phone for now
    }
  }

  const confirmationResult = await Swal.fire({
    title: '<strong>Confirm Your Booking</strong>',
    icon: 'question',
    html: `
      <div class="text-left p-4 border rounded-lg bg-gray-50">
        <div class="flex items-center mb-4">
          <img src="${vehicle.image}" alt="${vehicle.name}" class="w-24 h-16 object-cover mr-4 rounded-md shadow-md" />
          <div>
            <p class="font-bold text-lg">${vehicle.name}</p>
            <p class="text-sm text-gray-600">${vehicle.model}</p>
          </div>
        </div>
        <div class="space-y-2">
          <p><strong>From:</strong> ${start}</p>
          <p><strong>To:</strong> ${end}</p>
          <div class="flex justify-around text-center pt-4 mt-4 border-t">
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-wider">Distance</p>
                <p class="font-bold text-lg">${distance} km</p>
            </div>
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-wider">Estimated Reaching Time</p>
                <p class="font-bold text-lg text-blue-600">${eta}</p>
            </div>
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-wider">Fare</p>
                <p class="font-bold text-lg text-green-600">${fare}</p>
            </div>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonColor: '#FBBF24',
    cancelButtonColor: '#EF4444',
    confirmButtonText: 'Yes, Book Now!',
    cancelButtonText: 'Cancel',
    focusConfirm: false,
  });

  if (confirmationResult.isConfirmed) {
    try {
      const numericFare = fare ? parseFloat(fare.replace('₹', '')) : null;

      const bookingRequest = {
        pickupLocation: start,
        dropLocation: end,
        vehicleType: vehicle.id,
        date: date,
        bookedBy: username, // Add the username here
        passengerPhone: passengerPhone || 'Not provided',
        fare: numericFare,
        distance: distance,
      };

      console.log('Making booking request to:', 'http://localhost:8305/api/bookings');
      console.log('Request payload:', bookingRequest);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('http://localhost:8305/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send the token for authentication
        },
        body: JSON.stringify(bookingRequest),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'An unknown error occurred while booking.' };
        }
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const savedBooking = await response.json();

      // --- Start waiting for driver ---
      setIsWaitingForDriver(true);
      isWaitingRef.current = true;
      setFormFilled(false); // Hide the results container

      // --- Polling for status update ---
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`http://localhost:8305/api/bookings/${savedBooking.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!statusResponse.ok) return; // Silently fail and retry

          const updatedBooking = await statusResponse.json();

          if (updatedBooking.status === 'ACCEPTED') {
            clearInterval(pollInterval);
            setIsWaitingForDriver(false);
            isWaitingRef.current = false;
            Swal.fire('Driver Found!', `Your ride with ${updatedBooking.driverName} is confirmed.`, 'success');
            
            const bookingTimestamp = new Date();
            const ampm = bookingTimestamp.getHours() >= 12 ? 'PM' : 'AM';
            const displayHours = (bookingTimestamp.getHours() % 12) || 12;
            const minutes = bookingTimestamp.getMinutes().toString().padStart(2, '0');
            const bookedTime = `${displayHours.toString().padStart(2, '0')}:${minutes} ${ampm}`;

            navigate("/booking-confirm", {
              state: {
                ...updatedBooking, // Pass all details from the accepted booking
                bookingId: updatedBooking.id,
                pickup: updatedBooking.pickupLocation,
                drop: updatedBooking.dropLocation,
                date: updatedBooking.tripDate,
                time: bookedTime,
                vehicleImage: vehicle.image,
                vehicle: vehicle.name,
                numberPlate: vehicle.numberPlate, // This is mock data, consider adding to UserEntity
                fare: `₹${updatedBooking.fare}`,
                distance: updatedBooking.distance,
                eta, // from original calculation
                cabName: vehicle.model,
              }
            });
          } else if (updatedBooking.status === 'DENIED') {
            clearInterval(pollInterval);
            setIsWaitingForDriver(false);
            isWaitingRef.current = false;
            Swal.fire('Ride Denied', 'No drivers were available for your request. Please try again.', 'error');
          }
        } catch (pollError) {
          // Ignore polling errors, will retry on next interval
          console.error("Polling error:", pollError);
        }
      }, 5000); // Poll every 5 seconds

      // Optional: Timeout for polling
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isWaitingRef.current) {
          setIsWaitingForDriver(false);
          isWaitingRef.current = false;
          Swal.fire('Search Timed Out', 'We could not find a driver in time. Please try again.', 'warning');
          // Here you might want to auto-cancel the request on the backend
        }
      }, 600000); // 10-minute timeout

    } catch (error) {
      console.error('Booking error:', error);
      
      let errorMessage = 'Could not connect to the server. Please try again later.';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error: Cannot reach the gateway server. Please check if the gateway is running on port 8305.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: errorMessage,
        footer: 'Check browser console for more details'
      });
    }
  }
};
 
return (
<section id="booking-section" className="bg-yellow-400 py-12 px-4 sm:px-6 lg:px-8 scroll-mt-16">
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
    {/* Left Column: Info, Image, and Map */}
    <div className="lg:col-span-3 flex flex-col items-center text-center lg:items-start lg:text-left">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Best In City</h2>
      <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-orange-600">TRUSTED CAB SERVICES IN CHENNAI</h2>
      
      <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-6 mt-4 items-center">
        <div className="md:col-span-2 flex justify-center items-center">
          <img  
            src={cabImage2}  
            alt="cab"  
            className="w-56 md:w-full max-w-xs h-auto object-contain"
          />
        </div>
        <div className="md:col-span-3 w-full h-64 rounded-lg shadow-2xl overflow-hidden border-4 border-white relative z-10">
          <div className="absolute inset-0 z-10">
            <MapContainer 
              center={chennaiPosition} 
              zoom={12} 
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%', zIndex: 10 }}
            >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
              <Marker position={chennaiPosition}>
                <Popup>CabConnect services available here!</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
    
{/* //form section start */}  
  <div className="lg:col-span-2 bg-white rounded-xl shadow-2xl p-8 space-y-6 w-full">  
    <div>
      <label htmlFor="pickup" className="block text-gray-700 font-medium mb-2">Pickup Location</label>
      <div className="relative">
        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />
        <select
          id="pickup"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
        >
          <option value="">Select Pickup</option>
          {uniquePlaces.map((place, index) => (
            <option key={index} value={place}>{place}</option>
          ))}
        </select>
        <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>

    <div>
      <label htmlFor="drop" className="block text-gray-700 font-medium mb-2">Drop Location</label>
      <div className="relative">
        <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" />
        <select
          id="drop"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
        >
          <option value="">Select Drop</option>
          {uniquePlaces.map((place, index) => (
            <option key={index} value={place}>{place}</option>
          ))}
        </select>
        <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
 
    <div>
      <label className="block text-gray-700 font-medium mb-2">Trip Date</label>
      <div className="relative">
        <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
        <div className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 text-gray-800 rounded-md cursor-default">
          <p className="font-medium">Today ({displayDate})</p>
        </div>
      </div>
    </div>

    <div className="relative" ref={dropdownRef}>
      <label htmlFor="vehicle" className="block text-gray-700 font-medium mb-2">Vehicle Type</label>
      <button
        type="button"
        id="vehicle"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full p-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between text-left"
      >
        {vehicle ? (
          <div className="flex items-center">
            <img src={vehicle.image} alt={vehicle.name} className="w-12 h-8 object-cover mr-4 rounded" />
            <div>
              <p className="font-semibold text-gray-800">{vehicle.name}</p>
              <p className="text-xs text-gray-500">{vehicle.model}</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-500 pl-2">Select Vehicle Type</span>
        )}
        <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className={`absolute z-10 w-full mt-1 transition-all duration-200 ease-in-out ${isDropdownOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`} style={{ transformOrigin: 'top' }}>
        <ul className="bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {vehicles.map((v) => (
            <li
              key={v.id}
              onClick={() => {
                setVehicle(v);
                setIsDropdownOpen(false);
              }}
              className="px-4 py-3 hover:bg-yellow-100 cursor-pointer flex items-center justify-between transition-colors duration-200"
            >
              <div className="flex items-center">
                <img src={v.image} alt={v.name} className="w-12 h-8 object-cover mr-4 rounded" />
                <div>
                  <p className="font-semibold text-gray-800">{v.name}</p>
                  <p className="text-xs text-gray-500">{v.model}</p>
                </div>
              </div>
              <p className="font-semibold text-sm text-gray-700">₹{v.rate}/km</p>
            </li>
          ))}
        </ul>
      </div>
    </div>  
 
    <div className="flex justify-center">  
      <button  
        type="button"
        onClick={handleFindCabs}
        className="bg-yellow-400 text-black font-bold px-8 py-3 rounded-md hover:bg-yellow-500 transition-transform transform hover:scale-105 shadow-md"  
      >  
        FIND CABS  
      </button>  
    </div>

    {errorMessage && (
      <div className="bg-red-100 p-3 mt-4 rounded-md text-center text-red-700 font-medium">
        {errorMessage}
      </div>
    )}

    {loading && (  
      <div className="bg-yellow-100 p-4 rounded-md text-center text-yellow-800 font-medium">  
        🔍 Finding available cabs...  
      </div>  
    )}  

    {isWaitingForDriver && <WaitingForDriver />}
 
    {!loading && !errorMessage && fare && !isWaitingForDriver && (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4 mt-4">
        {/* Fare and Time */}
        <div className="flex justify-around text-center border-b pb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Fare</p>
            <p className="text-lg font-bold text-green-600">{fare}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Distance</p>
            <p className="text-lg font-bold text-gray-800">{distance} km</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Estimated Reaching Time</p>
            <p className="text-lg font-bold text-blue-600">{eta}</p>
          </div>
        </div>

        {/* Vehicle Type Info */}
        {vehicle && (
          <div className="pt-4">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-gray-800">{vehicle.name} Cab Selected</p>
              <p className="text-sm text-gray-600 mt-2">Driver and vehicle details will be provided after booking confirmation</p>
            </div>
          </div>
        )}
      </div>
    )}  
 
    <div className="flex justify-center mt-4">  
      <button  
        onClick={handleProceed}  
        disabled={isWaitingForDriver}
        className="bg-black text-yellow-400 font-bold px-8 py-3 rounded-md hover:bg-gray-800 transition-transform transform hover:scale-105 shadow-md"  
      >  
        Proceed to Book  
      </button>  
    </div>  
  </div>  
  </div>
</section>
 
);
};
 
export default Booking;