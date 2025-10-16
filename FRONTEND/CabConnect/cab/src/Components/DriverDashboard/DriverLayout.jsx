import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import axios from "axios"; // Use axios for all API calls!
import {
  LayoutDashboard, History, UserCircle, LogOut, User, PowerOff, Power, Phone, MapPin, Flag,
} from "lucide-react";
import logo from '../../assets/logo.png';

const NavItem = ({ icon, label, to, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-indigo-50 text-indigo-600 font-semibold'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
  >
    {icon}
    <span className="ml-4">{label}</span>
  </NavLink>
);

const DriverLayout = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeRide, setActiveRide] = useState(null);
  const [driverName, setDriverName] = useState("Driver");
  const [isDriverLoggedIn, setIsDriverLoggedIn] = useState(false);
  const [bookings, setBookings] = useState([]); // Added for context passing to Outlet
  const navigate = useNavigate();

  useEffect(() => {
    // Get driver name from sessionStorage (new approach)
    const storedDriverName = sessionStorage.getItem('driverName');
    const token = sessionStorage.getItem('jwtToken');
    
    if (storedDriverName && token) {
      setDriverName(storedDriverName);
      setIsDriverLoggedIn(true);
    } else {
      // Fallback: try to get from old localStorage approach
      try {
        const loggedInDriverData = localStorage.getItem('loggedInDriver');
        if (loggedInDriverData) {
          const driver = JSON.parse(loggedInDriverData);
          const nameFromEmail = driver.email.split('@')[0];
          const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
          setDriverName(capitalizedName);
          setIsDriverLoggedIn(true);
        } else {
          setIsDriverLoggedIn(false);
        }
      } catch (error) {
        console.error("Failed to parse loggedInDriver data from localStorage", error);
        setDriverName("Driver");
        setIsDriverLoggedIn(false);
      }
    }
  }, []);

  // Use axios for fetching all bookings for this driver (used in handleToggleOnlineStatus and handleLogout)
  const fetchAllBookings = async () => {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) return [];
    try {
      // API: Get all bookings (for this driver, backend should filter by driver if needed)
      const response = await axios.get('http://localhost:8305/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        setBookings(response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      return [];
    }
  };

  // Use axios for fetching pending bookings for this driver
  const fetchPendingBookings = async () => {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) return [];
    try {
      // API: Get all pending bookings for this driver
      const response = await axios.get('http://localhost:8305/api/bookings/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      return [];
    }
  };

  const handleUpdateBooking = (id, newStatus) => {
    if (!isOnline) {
      Swal.fire({
        icon: 'warning',
        title: 'You are Offline',
        text: 'Please go online first to accept or deny rides.',
      });
      return;
    }

    let updatedBooking = null;
    const newBookings = bookings.map(b => {
      if (b.id === id) {
        // In a real app, you might add a rating when completing a ride.
        const rating = newStatus === 'Completed' ? (Math.random() * (5 - 4) + 4).toFixed(1) : b.rating;
        updatedBooking = { ...b, status: newStatus, rating };
        return updatedBooking;
      }
      return b;
    });
    setBookings(newBookings);

    if (newStatus === 'Completed' && updatedBooking) {
      const fareValue = parseFloat(updatedBooking.fare.replace('₹', ''));
      Swal.fire({
          icon: 'success',
          title: 'Ride Completed!',
          html: `Congratulations! You earned <strong>₹${fareValue.toFixed(2)}</strong> for this ride.`,
          confirmButtonText: 'Great!',
          confirmButtonColor: '#28a745',
      });
    }

    if (newStatus === "Accepted" || newStatus === "Ongoing") {
      setActiveRide(updatedBooking);
    } else if (["Completed", "Denied"].includes(newStatus)) {
      if (activeRide && activeRide.id === id) setActiveRide(null);
    }
  };

  const handleToggleOnlineStatus = async () => {
    // If trying to go offline, check for ongoing rides and pending requests first
    if (isOnline) {
      const token = sessionStorage.getItem('jwtToken');
      const driverName = sessionStorage.getItem('driverName');
      
      if (token && driverName) {
        try {
          // API: Get all bookings for this driver to check ongoing rides
          const allBookings = await fetchAllBookings();
          
          // Check if driver has any ongoing rides (ACCEPTED or ONGOING status)
          const driverOngoingRides = allBookings.filter(booking => 
            (booking.driverName === driverName || 
             (booking.driverName && booking.driverName.toLowerCase() === driverName.toLowerCase())) &&
            (booking.status === 'ACCEPTED' || booking.status === 'ONGOING')
          );

          if (driverOngoingRides.length > 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Ongoing Ride Active',
              html: `You cannot go offline while you have an ongoing ride.<br><br>Please complete your current ride first.`,
              confirmButtonText: 'Got it',
              confirmButtonColor: '#f59e0b'
            });
            return;
          }

          // API: Get all pending bookings for this driver
          const pendingBookings = await fetchPendingBookings();

          if (pendingBookings.length > 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Pending Ride Requests',
              html: `You have <strong>${pendingBookings.length}</strong> pending ride request${pendingBookings.length > 1 ? 's' : ''} waiting for your response.<br><br>Please <strong>accept or deny</strong> all pending requests before going offline.<br><br><span class="text-sm text-gray-600">This ensures passengers aren't left waiting for a response.</span>`,
              confirmButtonText: 'Got it',
              confirmButtonColor: '#f59e0b'
            });
            return;
          }
        } catch (error) {
          console.error('Error checking ongoing rides and pending requests:', error);
        }
      }
    }

    // If no ongoing rides or going online, proceed with normal toggle
    const nextStatus = isOnline ? 'Offline' : 'Online';
    const confirmButtonColor = isOnline ? '#d33' : '#28a745';

    Swal.fire({
      title: `Go ${nextStatus}?`,
      text: `You will ${nextStatus === 'Online' ? 'start receiving' : 'stop receiving'} ride requests.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: confirmButtonColor,
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, go ${nextStatus}!`
    }).then((result) => {
      if (result.isConfirmed) {
        setIsOnline(!isOnline);
        Swal.fire({
          title: `You are now ${nextStatus}!`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
        });
      }
    });
  };

  const handleLogout = async () => {
    // Check for ongoing rides and pending requests before allowing logout
    const token = sessionStorage.getItem('jwtToken');
    const driverName = sessionStorage.getItem('driverName');
    
    if (token && driverName) {
      try {
        // API: Get all bookings for this driver to check ongoing rides
        const allBookings = await fetchAllBookings();
        
        // Check if driver has any ongoing rides (ACCEPTED or ONGOING status)
        const driverOngoingRides = allBookings.filter(booking => 
          (booking.driverName === driverName || 
           (booking.driverName && booking.driverName.toLowerCase() === driverName.toLowerCase())) &&
          (booking.status === 'ACCEPTED' || booking.status === 'ONGOING')
        );

        if (driverOngoingRides.length > 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Ongoing Ride Active',
            html: `You cannot logout while you have an ongoing ride.<br><br>Please complete your current ride first.`,
            confirmButtonText: 'Got it',
            confirmButtonColor: '#f59e0b'
          });
          return;
        }

        // API: Get all pending bookings for this driver
        const pendingBookings = await fetchPendingBookings();

        if (pendingBookings.length > 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Pending Ride Requests',
            html: `You have <strong>${pendingBookings.length}</strong> pending ride request${pendingBookings.length > 1 ? 's' : ''} waiting for your response.<br><br>Please <strong>accept or deny</strong> all pending requests before logging out.<br><br><span class="text-sm text-gray-600">This ensures passengers aren't left waiting for a response.</span>`,
            confirmButtonText: 'Got it',
            confirmButtonColor: '#f59e0b'
          });
          return;
        }
      } catch (error) {
        console.error('Error checking ongoing rides and pending requests:', error);
      }
    }

    // If no ongoing rides, check online status first (original logic)
    if (isOnline) {
      Swal.fire({
        icon: 'warning',
        title: 'Please Go Offline First',
        text: 'You need to go offline before you can log out.',
        confirmButtonColor: '#f59e0b', // amber-500
      });
    } else {
      Swal.fire({
        title: 'Confirm Logout',
        text: "Are you sure you want to log out?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444', // red-500
        cancelButtonColor: '#6b7280', // gray-500
        confirmButtonText: 'Yes, Logout'
      }).then((result) => {
        if (result.isConfirmed) {
          // Clear driver data from sessionStorage on logout
          sessionStorage.clear(); // Clear all session data
          localStorage.removeItem('loggedInDriver'); // Clear old localStorage as well
          navigate('/login');
        }
      });
    }
  };

  const handleEndRide = (ride) => {
    Swal.fire({
        title: 'End Ride?',
        text: "Are you sure you want to complete this ride?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444', // red-500
        cancelButtonColor: '#6b7280', // gray-500
        confirmButtonText: 'Yes, End Ride'
    }).then((result) => {
        if (result.isConfirmed) {
            handleUpdateBooking(ride.id, 'Completed');
        }
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-gray-800 flex flex-col border-r border-gray-200">
        <div className="flex items-center justify-center h-20 border-b border-gray-200">
          <img src={logo} alt="CabConnect Logo" className="h-15 w-35" />
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" to="/driverdashboard" end={true} />
          <NavItem icon={<History size={20} />} label="Ride History" to="ridehistory" />
          <NavItem icon={<UserCircle size={20} />} label="Profile" to="profile" />
        </nav>
        <div className="px-4 py-6 border-t border-gray-200">
          {isDriverLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 w-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut size={20} />
              <span className="ml-4">Logout</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 w-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut size={20} />
              <span className="ml-4">Login</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm flex items-center justify-between px-6 py-4 z-10">
          <h2 className="text-2xl font-semibold text-gray-800">Driver Dashboard</h2>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <button onClick={handleToggleOnlineStatus} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <User className="text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <span className="text-gray-800 font-medium">{driverName}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {activeRide && isOnline && (
            <div className="mb-6 bg-white p-5 rounded-lg shadow-lg border-l-4 border-indigo-500 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Active Ride</h3>
                <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">{activeRide.status}</span>
              </div>

              <div className="mt-4 border-t border-b border-gray-200 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Passenger</p>
                    <p className="font-semibold text-gray-800 flex items-center gap-2"><User size={16} /> {activeRide.passenger}</p>
                  </div>
                  <a href={`tel:${activeRide.phone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold">
                    <Phone size={16} />
                    <span>{activeRide.phone}</span>
                  </a>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="text-green-500 mr-3 flex-shrink-0" size={18}/>
                    <span className="text-gray-800">{activeRide.pickup}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Flag className="text-red-500 mr-3 flex-shrink-0" size={18}/>
                    <span className="text-gray-800">{activeRide.drop}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 mt-2">
                <p className="font-bold text-xl text-green-600">{activeRide.fare}</p>
                <button onClick={() => handleEndRide(activeRide)} className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 font-semibold transition-colors">
                  End Ride
                </button>
              </div>
            </div>
          )}
          {isOnline ? (
            <Outlet
              context={{
                bookings: bookings.filter(b => b.id !== activeRide?.id),
                handleUpdateBooking
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center bg-white rounded-lg shadow-md p-8">
              <PowerOff className="w-16 h-16 text-red-400 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700">You Are Currently Offline</h3>
              <p className="mt-2 text-gray-500 max-w-sm">
                To start accepting new ride requests and manage your active rides, please switch your status to "Online".
              </p>
              <button
                onClick={handleToggleOnlineStatus}
                className="mt-6 flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <Power size={18} />
                Go Online
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;