import React, { useState, useEffect, useMemo } from "react";
import { Calendar, DollarSign, MapPin, User, Phone, ChevronDown, ChevronUp } from "lucide-react";
import Swal from 'sweetalert2';
import axios from "axios";

const DriverRideHistory = () => {
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRideId, setExpandedRideId] = useState(null);

    useEffect(() => {
        const fetchDriverRideHistory = async () => {
            try {
                const token = sessionStorage.getItem('jwtToken');
                const driverId = sessionStorage.getItem('userId');
                if (!token || !driverId) {
                    setLoading(false);
                    return;
                }
                // Call DriverService to get driver's bookings directly
                const url = `http://localhost:8305/api/drivers/${driverId}/bookings`;
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 200) {
                    // DriverService returns only this driver's bookings
                    setAllBookings(response.data);
                } else {
                    setAllBookings([]);
                }
            } catch (error) {
                setAllBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchDriverRideHistory();
        const interval = setInterval(fetchDriverRideHistory, 5000);
        return () => clearInterval(interval);
    }, []);

    // Derived lists
    const completedRides = useMemo(
        () => allBookings.filter(b => b.status === 'COMPLETED')
            .sort((a, b) => new Date(b.tripDate) - new Date(a.tripDate)),
        [allBookings]
    );
    const deniedRides = useMemo(
        () => allBookings.filter(b => b.status === 'DENIED')
            .sort((a, b) => new Date(b.tripDate) - new Date(a.tripDate)),
        [allBookings]
    );
    const totalEarnings = useMemo(
        () => completedRides.reduce((acc, ride) => acc + (ride.fare || 0), 0),
        [completedRides]
    );
    const handleToggleDetails = (rideId) => {
        setExpandedRideId(prevId => (prevId === rideId ? null : rideId));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-3xl font-bold text-gray-800">Ride History</h3>
            </div>
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                    <p className="ml-4 text-gray-600">Loading ride history...</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                            <div className="bg-green-100 p-4 rounded-full">
                                <Calendar className="text-green-500" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Completed Rides</p>
                                <p className="text-2xl font-bold text-gray-800">{completedRides.length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                            <div className="bg-red-100 p-4 rounded-full">
                                <Calendar className="text-red-500" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Denied Rides</p>
                                <p className="text-2xl font-bold text-gray-800">{deniedRides.length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                            <div className="bg-blue-100 p-4 rounded-full">
                                <DollarSign className="text-blue-500" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Earnings</p>
                                <p className="text-2xl font-bold text-gray-800">₹{totalEarnings.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    {/* Completed Rides Section */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">
                            Completed Rides ({completedRides.length})
                        </h4>
                        <div className="space-y-4">
                            {completedRides.length > 0 ? (
                                completedRides.map((ride) => {
                                    const isExpanded = expandedRideId === ride.id;
                                    return (
                                        <div key={ride.id} className="border border-gray-200 rounded-lg hover:shadow-md">
                                            <div className="p-4 cursor-pointer" onClick={() => handleToggleDetails(ride.id)}>
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500 flex items-center">
                                                            <Calendar className="mr-2 text-gray-400" size={14} />
                                                            {ride.tripDate ? new Date(ride.tripDate + 'T00:00:00').toLocaleDateString('en-GB') : 'N/A'}
                                                        </p>
                                                        <p className="font-semibold text-gray-800 mt-2">
                                                            {ride.pickupLocation} → {ride.dropLocation}
                                                        </p>
                                                        <p className="text-sm text-blue-600 mt-1">
                                                            Vehicle: {ride.vehicleType} • Distance: {ride.distance}km
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex items-center">
                                                        <div className="mr-4">
                                                            <p className="text-xl font-bold text-green-600">₹{ride.fare}</p>
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                {ride.status}
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-400 hover:text-black p-2">
                                                            {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {isExpanded && (
                                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                        <div className="flex items-center">
                                                            <User className="w-4 h-4 text-gray-400 mr-3" />
                                                            <div>
                                                                <span className="text-gray-600">Passenger: </span>
                                                                <span className="font-medium">{ride.bookedBy}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Phone className="w-4 h-4 text-gray-400 mr-3" />
                                                            <div>
                                                                <span className="text-gray-600">Phone: </span>
                                                                <span className="font-medium">{ride.passengerPhone || 'Not provided'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                                                            <div>
                                                                <span className="text-gray-600">Distance: </span>
                                                                <span className="font-medium">{ride.distance} km</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <DollarSign className="w-4 h-4 text-gray-400 mr-3" />
                                                            <div>
                                                                <span className="text-gray-600">Earnings: </span>
                                                                <span className="font-medium text-green-600">₹{ride.fare}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                    <p>No completed rides yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Denied Rides Section */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h4 className="text-xl font-semibold text-gray-800 mb-4">
                            Denied Rides ({deniedRides.length})
                        </h4>
                        <div className="space-y-3">
                            {deniedRides.length > 0 ? (
                                deniedRides.map((ride) => (
                                    <div key={ride.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    {ride.tripDate ? new Date(ride.tripDate + 'T00:00:00').toLocaleDateString('en-GB') : 'N/A'}
                                                </p>
                                                <p className="font-semibold text-gray-800">
                                                    {ride.pickupLocation} → {ride.dropLocation}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Passenger: {ride.bookedBy}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                                    DENIED
                                                </span>
                                                <p className="text-sm text-gray-500 mt-1">₹{ride.fare}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                    <p>No denied rides yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DriverRideHistory;