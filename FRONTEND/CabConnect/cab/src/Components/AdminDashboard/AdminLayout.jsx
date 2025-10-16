import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  LayoutDashboard,
  Users2,
  Car,
  Book,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import logo from '../../assets/logo.png';
import { dummyUsers, dummyDrivers } from './admindummydata';

const NavItem = ({ icon, label, to, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-amber-50 text-amber-600 font-semibold'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
  >
    {icon}
    <span className="ml-4">{label}</span>
  </NavLink>
);

const AdminLayout = () => {
  const navigate = useNavigate();
  // The data is now static within the component's lifecycle.
  // State is initialized from the imported data. We use a deep copy
  // to ensure that state modifications don't affect the original dummy data.
  const [users, setUsers] = useState(() => JSON.parse(JSON.stringify(dummyUsers)));
  const [drivers, setDrivers] = useState(() => JSON.parse(JSON.stringify(dummyDrivers)));

  const handleLogout = () => {
    Swal.fire({
      title: 'Confirm Logout',
      text: "Are you sure you want to log out from the admin panel?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('adminLoggedIn');
        navigate('/login');
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
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" to="/admin" end={true} />
          <NavItem icon={<Users2 size={20} />} label="Users" to="users" />
          <NavItem icon={<Car size={20} />} label="Drivers" to="drivers" />
          <NavItem icon={<BarChart3 size={20} />} label="Reports" to="reports" />
        </nav>
        <div className="px-4 py-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 w-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut size={20} />
            <span className="ml-4">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm flex items-center justify-between px-6 py-4 z-10">
          <h2 className="text-2xl font-semibold text-gray-800">Admin Panel</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Users2 className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <span className="text-gray-800 font-medium">Admin</span>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet context={{ users, drivers, setUsers, setDrivers }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;