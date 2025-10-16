import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './Components/homepage';
import Confirmbook from './Components/confirmbook';
import RideHistory from './Components/ridehistory'; // This seems to be for the user, not the driver
import DriverLayout from './Components/DriverDashboard/DriverLayout';
import DriverHome from './Components/DriverDashboard/DriverHome';
import DriverRideHistory from './Components/DriverDashboard/DriverRideHistory';
import DriverProfile from './Components/DriverDashboard/DriverProfile';
import AdminLayout from './Components/AdminDashboard/AdminLayout';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import Users from './Components/AdminDashboard/Users';
import AllDrivers from './Components/AdminDashboard/AllDrivers';
import Reports from './Components/AdminDashboard/Reports';
import RateManagement from './Components/AdminDashboard/RateManagement';
import Profile from './Components/Profile';

import Support from './Components/Support';
import Promotions from './Components/Promotions';
import Login from './Components/Login_authenticator/Login';
import Signup from './Components/Login_authenticator/Signup';
import Payment from './Components/payment';
import Feedback from './Components/feedback';
import Practice from '../../practice';






const App = () => {



  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/booking-confirm" element={<Confirmbook />} />
           <Route path="/payment" element={<Payment />} />
            <Route path="/feedback" element={<Feedback />} />
          <Route path="/ride-history" element={<RideHistory />} />
          <Route path="/profile" element={<Profile/>} />

          <Route path="/support" element={<Support />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/practice" element={<Practice />} />





        <Route path="/login" element={<Login  />} />
           <Route path="/signup" element={<Signup />} />


           
          

          <Route path="/driverdashboard" element={<DriverLayout />}>
            <Route index element={<DriverHome />} />
            <Route path="ridehistory" element={<DriverRideHistory />} /> 
            <Route path="profile" element={<DriverProfile />} />
            <Route path="support" element={<Support />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="drivers" element={<AllDrivers />} />
            <Route path="rates" element={<RateManagement />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default App
