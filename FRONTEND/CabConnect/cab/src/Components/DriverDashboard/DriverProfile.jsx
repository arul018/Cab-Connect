import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Fingerprint, CreditCard, Car, IdCard, Calendar } from 'lucide-react';
import axios from 'axios';

const DriverProfile = () => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        // Get driverId from sessionStorage (set during login)
        const userId = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('jwtToken');
        if (!userId || !token) {
          setDriver(null);
          setLoading(false);
          return;
        }

        // Fetch driver profile from authentication_service using API
        // This API returns full driver details by userId
        // First get basic user data
        const userResponse = await axios.get(`http://localhost:8305/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        

        
        // Use the user data directly since it contains all driver info
        setDriver(userResponse.data);
      } catch (error) {
        console.error('Error loading driver profile:', error);
        setDriver(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg font-medium text-gray-600">Loading Profile...</div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex justify-center items-center h-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <User className="mx-auto h-16 w-16 text-red-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-700">No Driver Data Found</h3>
          <p className="mt-2 text-gray-500">
            No driver information available. Please log in as a driver.
          </p>
        </div>
      </div>
    );
  }

  const InfoCard = ({ icon, label, value }) => (
    <div className="flex items-center p-4 bg-gray-50/50 rounded-lg">
      <div className="flex-shrink-0 mr-4 text-indigo-500">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-gray-800 break-all">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Driver Profile</h2>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200/80">
        {/* Profile Header */}
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mr-6 border-4 border-white shadow-md">
                <User className="w-12 h-12 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{driver.fullName || driver.name || 'Driver'}</h3>
                <p className="text-md text-gray-600 flex items-center gap-2">
                  <Mail size={16} />{driver.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Driver
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Profile Details */}
        <div className="p-8">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Driver Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon={<Phone size={20} />} label="Phone Number" value={driver.phone || 'Not provided'} />
            <InfoCard icon={<Fingerprint size={20} />} label="Driver ID" value={driver.id || driver.userId || sessionStorage.getItem('userId') || 'Not available'} />
            <InfoCard icon={<CreditCard size={20} />} label="License Number" value={driver.licenseNumber || 'Not provided'} />
            <InfoCard icon={<IdCard size={20} />} label="Aadhar Number" value={driver.aadharNumber || 'Not provided'} />
            <InfoCard icon={<Car size={20} />} label="Vehicle Model" value={driver.vehicleModel || 'Not provided'} />
            <InfoCard icon={<CreditCard size={20} />} label="Vehicle Number" value={driver.vehicleNumber || 'Not provided'} />
            <InfoCard icon={<Calendar size={20} />} label="Registration Date" value={driver.registrationDate ? new Date(driver.registrationDate).toLocaleDateString() : 'Not available'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;