import React, { useEffect, useState } from 'react';
import { Users2, Car, BookOpenCheck, IndianRupee } from 'lucide-react';
import Swal from 'sweetalert2';

const getInitials = (name) => {
  if (!name) return '?';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const avatarColors = ['bg-blue-200 text-blue-800', 'bg-green-200 text-green-800', 'bg-purple-200 text-purple-800', 'bg-red-200 text-red-800', 'bg-yellow-200 text-yellow-800'];

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center space-x-4">
      <div className={`bg-${color}-100 p-3 rounded-full`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [recentApprovedDrivers, setRecentApprovedDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const apiUrl = 'http://localhost:8305/api/users';
      console.log('[AdminDashboard] Fetching users from:', apiUrl);
      try {
        const response = await fetch(apiUrl);
        console.log('[AdminDashboard] Response status:', response.status);
        if (!response.ok) {
          const text = await response.text();
          console.error('[AdminDashboard] Response not OK:', response.status, text);
          throw new Error('Failed to fetch users: ' + response.status);
        }
        const data = await response.json();
        console.log('[AdminDashboard] Users data:', data);
        setUsers(data);
      } catch (err) {
        console.error('[AdminDashboard] Fetch error:', err);
        setError(err.message);
        Swal.fire('Error', err.message, 'error');
      }
    };
    
    const fetchApprovedDrivers = async () => {
      try {
        // Fetch approved drivers from the admin service endpoint
        const response = await fetch('http://localhost:8305/admin/approved-drivers');
        if (response.ok) {
          const approvedData = await response.json();
          console.log('[AdminDashboard] Approved drivers data:', approvedData);
          
          if (Array.isArray(approvedData)) {
            // Sort by registration date and take top 5
            const recentApproved = approvedData
              .sort((a, b) => {
                const dateA = new Date(b.registrationDate || 0);
                const dateB = new Date(a.registrationDate || 0);
                return dateA - dateB;
              })
              .slice(0, 5);
            
            setRecentApprovedDrivers(recentApproved);
            console.log('[AdminDashboard] Recent approved drivers set:', recentApproved);
          }
        } else {
          console.log('[AdminDashboard] Failed to fetch approved drivers:', response.status);
        }
      } catch (err) {
        console.error('[AdminDashboard] Approved drivers fetch error:', err);
      }
    };
    const fetchBookings = async () => {
      const bookingsUrl = 'http://localhost:8305/api/bookings';
      console.log('[AdminDashboard] Fetching bookings from:', bookingsUrl);
      try {
        const response = await fetch(bookingsUrl);
        console.log('[AdminDashboard] Bookings response status:', response.status);
        if (!response.ok) {
          const text = await response.text();
          console.error('[AdminDashboard] Bookings response not OK:', response.status, text);
          throw new Error('Failed to fetch bookings: ' + response.status);
        }
        const data = await response.json();
        console.log('[AdminDashboard] Bookings data:', data);
        setBookings(data);
      } catch (err) {
        console.error('[AdminDashboard] Bookings fetch error:', err);
        setError(err.message);
        Swal.fire('Error', err.message, 'error');
      }
    };
    Promise.all([fetchUsers(), fetchBookings(), fetchApprovedDrivers()]).finally(() => setLoading(false));
  }, []);

  const totalUsers = users.filter(u => String(u.role).toLowerCase() === 'user').length;
  const totalDrivers = users.filter(u => String(u.role).toLowerCase() === 'driver').length;
  // Sort users by userId descending and take the top 5 as recent users
  const recentUsers = [...users]
    .sort((a, b) => (b.userId || 0) - (a.userId || 0))
    .slice(0, 5);
  const totalRides = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (typeof b.fare === 'number' ? b.fare : 0), 0);

  if (loading) return <div>Loading</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users2 className="text-blue-500" />} title="Total Users" value={totalUsers} color="blue" />
        <StatCard icon={<Car className="text-green-500" />} title="Total Drivers" value={totalDrivers} color="green" />
        <StatCard icon={<BookOpenCheck className="text-yellow-500" />} title="Total Rides" value={totalRides} color="yellow" />
        <StatCard icon={<IndianRupee className="text-indigo-500" />} title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} color="indigo" />
      </section>

      {/* Recent Users & Approved Drivers */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recently Registered Users</h3>
          <ul className="divide-y divide-gray-200">
            {recentUsers.map((user, index) => (
              <li key={user.userId} className="py-3 flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold ${avatarColors[index % avatarColors.length]}`}>
                  {getInitials(user.fullName)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.fullName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
              </li>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent user registrations.</p>
            )}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            <div className="flex items-center">
              <Car className="text-green-500 mr-2" size={20} />
              Recently Approved Drivers
            </div>
          </h3>
          <ul className="divide-y divide-gray-200">
            {recentApprovedDrivers.map((driver, index) => (
              <li key={driver.userId} className="py-3 flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold ${avatarColors[index % avatarColors.length]}`}>
                  {getInitials(driver.fullName)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{driver.fullName}</p>
                  <p className="text-sm text-gray-500">{driver.email}</p>
                  <div className="flex items-center mt-1">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Approved
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {driver.vehicleModel || driver.vehicleBrand || 'Vehicle Info'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
            {recentApprovedDrivers.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recently approved drivers.</p>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;