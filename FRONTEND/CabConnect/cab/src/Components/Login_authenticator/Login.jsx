import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from '../../assets/logo.png';


function Login({ onLogin, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

// useState hooks for form fields and state management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [loginRole, setLoginRole] = useState(location.state?.role || 'user'); // 'user', 'driver', or 'admin'
  const [adminCredentials, setAdminCredentials] = useState({
    email: "",
    password: "",
    adminKey: "",
  });
// useEffect to clear success message on component mount or location change
  useEffect(() => {
    if (location.state?.message) {
      // Create a copy of the state without the message
      const { message: _, ...restState } = location.state;
      // Replace the location state to prevent the message from reappearing on refresh
      navigate(location.pathname, { state: restState, replace: true });
    }
  }, [location.state, navigate, location.pathname]);

//validation functions for forms used in submission handlers
  const validateUserDriverForm = () => {
    const errors = {};
    if (!email) {
      errors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email address is invalid.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    return errors;
  };
// validation function for admin form like how user/driver form is validated
  const validateAdminForm = () => {
    const errors = {};
    if (!adminCredentials.email) errors.email = "Admin email is required.";
    if (!adminCredentials.password) errors.password = "Password is required.";
    if (!adminCredentials.adminKey) errors.adminKey = "Admin Key is required.";
    return errors;
  };
// submission handler for user and driver logins
  const handleUserDriverSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateUserDriverForm();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setLoading(true);
    
    try {
      // Call backend login API via Gateway
      const response = await fetch('http://localhost:8305/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      console.log('Login response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Authentication successful:', data);
        
        // Check if the user's role matches the selected login role
        if (data.role && data.role.toLowerCase() !== loginRole) {
          setError(`Invalid credentials or you are not registered as a ${loginRole}.`);
          return;
        }
        
        // BLOCKED DRIVER CHECK - Fetch user details to check block status
        if (loginRole === 'driver' && data.userId) {
          try {
            const userCheckResponse = await fetch(`http://localhost:8305/api/users/${data.userId}`);
            if (userCheckResponse.ok) {
              const userData = await userCheckResponse.json();
              console.log('Driver user data:', userData);
              
              // Check if driver is blocked
              if (userData.blockStatus === 'yes') {
                setError(`🚫 Your account has been blocked by the admin. Reason: ${userData.comments || 'Account suspended for policy violations'}. Please contact support for assistance.`);
                setLoading(false);
                return;
              }
              
              // Check if driver application is still pending
              if (userData.adminApproval === 'pending') {
                setError(`⏳ Your driver application is still pending admin approval. Please wait for approval before logging in.`);
                setLoading(false);
                return;
              }
              
              // Check if driver application was rejected
              if (userData.adminApproval === 'rejected') {
                setError(`❌ Your driver application has been rejected. Reason: ${userData.adminComment || 'Application rejected by admin'}. Please contact support for more information.`);
                setLoading(false);
                return;
              }
              
              // Check if driver is approved
              if (userData.adminApproval !== 'approved') {
                setError(`⚠️ Your driver account is not approved yet. Current status: ${userData.adminApproval || 'Unknown'}. Please contact admin.`);
                setLoading(false);
                return;
              }
              
              console.log('Driver status check passed - allowing login');
            } else {
              console.warn('Could not fetch user details for block status check');
            }
          } catch (userCheckError) {
            console.error('Error checking user block status:', userCheckError);
            // Continue with login if user check fails (fallback)
          }
        }
        
        // Store session data directly from Authentication service
        if (data.token) {
          sessionStorage.setItem('jwtToken', data.token);
        }
        sessionStorage.setItem('email', data.email);
        sessionStorage.setItem('role', data.role.toUpperCase());
        if (loginRole === 'user') {
          sessionStorage.setItem('username', data.username);
        } else {
          sessionStorage.setItem('driverName', data.username);
        }
        
        // Store essential driver/user details
        if (data.phone) {
          sessionStorage.setItem('phone', data.phone);
        }
        if (data.userId) {
          sessionStorage.setItem('userId', data.userId.toString());
        }
        
        const userProfile = {
          id: data.userId,
          fullName: data.username,
          email: data.email,
          phone: data.phone,
          role: data.role.toUpperCase()
        };
        
        sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        window.dispatchEvent(new Event('profileUpdated'));
        setSuccessMessage("Login successful!");
        
        if (onLogin) onLogin(data.email);
        if (setUser) setUser(userProfile);
        
        navigate(loginRole === 'driver' ? '/driverdashboard' : '/');
      } else if (response.status === 403) {
        // Try to parse error as JSON (for rejection with comment)
        let errorText = await response.text();
        let rejectionComment = "";
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.adminApproval === "rejected") {
            rejectionComment = errorJson.adminComment || "No reason provided.";
            setError(`Your registration has been rejected by the admin. Reason: ${rejectionComment}`);
          } else if (errorJson.adminApproval === "pending") {
            setError('Your registration is pending admin approval. You cannot login until approved.');
          } else {
            setError(errorJson.message || "You have been blocked, contact admin.");
          }
        } catch {
          // Fallback to plain text error
          if (errorText.toLowerCase().includes('rejected')) {
            setError('Your registration has been rejected by the admin. Reason: Not provided.');
          } else if (errorText === 'Approval pending by admin') {
            setError('Your registration is pending admin approval. You cannot login until approved.');
          } else {
            setError(errorText || "You have been blocked, contact admin.");
          }
        }
        setLoading(false);
        return;
      } else {
        const errorData = await response.json().catch(() => null);
        console.log('Login error:', errorData);
        setError(errorData?.message || "Invalid email or password. Please try again.");
      }
    } catch (networkError) {
      console.error("Network error during login:", networkError);
      if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
        setError("Cannot reach server. Please ensure the authentication service is running on port 9091.");
      } else {
        setError("Unable to connect to server. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // submission handler for admin login like how user/driver login is handled
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateAdminForm();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    setError("");

    // Static admin credentials check
    if (
      adminCredentials.email === 'admin@cabconnect.com' &&
      adminCredentials.password === 'admin123' &&
      adminCredentials.adminKey === 'codered'
    ) {
      // Simulate admin login by setting role and token in sessionStorage
      sessionStorage.setItem('jwtToken', 'static-admin-token');
      sessionStorage.setItem('role', 'ADMIN');
      sessionStorage.setItem('email', adminCredentials.email);
      sessionStorage.setItem('username', 'Admin');
      setSuccessMessage('Admin login successful!');
      navigate('/admin');
      setLoading(false);
      return;
    } else {
      setError('Invalid admin credentials.');
      setLoading(false);
      return;
    }
  };

  // input change handler for admin form fields
  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setAdminCredentials(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };
// Role change handler to reset form state when switching roles
  const handleRoleChange = (newRole) => {
    if (newRole !== loginRole) {
      setLoginRole(newRole);
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setShowAdminKey(false);
      setAdminCredentials({ email: "", password: "", adminKey: "" });
      setError("");
      setFormErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-yellow-300 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Pattern */}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center">
          <img
            className="mx-auto h-16 w-auto"
            src={logo}
            alt="Cab Connect Logo"
          />
         
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back! Please sign in to your account.
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-white p-8 shadow-2xl rounded-lg border border-yellow-200/50">
            <h2 className="text-left text-2xl font-bold text-gray-800 mb-6">
              Sign In as a {loginRole.charAt(0).toUpperCase() + loginRole.slice(1)}
            </h2>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-700 font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Role Toggle Slider */}
            <div className="mb-6">
              <div className="flex w-full items-center justify-center rounded-full bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => handleRoleChange('user')}
                  className={`flex w-full items-center justify-center gap-x-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                    loginRole === 'user'
                      ? 'bg-white text-amber-600 shadow'
                      : 'text-gray-600 hover:bg-white/60'
                  }`}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                  <span>User</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('driver')}
                  className={`flex w-full items-center justify-center gap-x-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                    loginRole === 'driver'
                      ? 'bg-white text-amber-600 shadow'
                      : 'text-gray-600 hover:bg-white/60'
                  }`}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM15.5 10a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0zM10 4.5a.75.75 0 01.75.75v1.316a3.996 3.996 0 013.455 3.168.75.75 0 01-1.48.232A2.496 2.496 0 0010.75 7.5v-2a.75.75 0 01-.75-.75zM10 15.5a.75.75 0 01-.75-.75v-1.316a3.996 3.996 0 01-3.455-3.168.75.75 0 011.48-.232A2.496 2.496 0 009.25 12.5v2a.75.75 0 01.75.75zM4.5 10a.75.75 0 01.75-.75h1.316a3.996 3.996 0 013.168 3.455.75.75 0 01-.232 1.48A2.496 2.496 0 007.5 12.75h-2a.75.75 0 01-.75-.75zM15.5 10a.75.75 0 01-.75.75h-1.316a3.996 3.996 0 01-3.168-3.455.75.75 0 01.232-1.48A2.496 2.496 0 0012.5 7.25h2a.75.75 0 01.75.75z" clipRule="evenodd" />
                  </svg>
                  <span>Driver</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`flex w-full items-center justify-center gap-x-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                    loginRole === 'admin'
                      ? 'bg-white text-amber-600 shadow'
                      : 'text-gray-600 hover:bg-white/60'
                  }`}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" /></svg>
                  <span>Admin</span>
                </button>
              </div>
            </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {loginRole === 'admin' ? (
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              {/* Admin Email Field */}
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">Admin Email</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                  </div>
                  <input id="admin-email" name="email" type="email" required value={adminCredentials.email} onChange={handleAdminInputChange}
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="admin@example.com" />
                </div>
                {formErrors.email && <p className="mt-2 text-xs text-red-600">{formErrors.email}</p>}
              </div>
              {/* Admin Password Field */}
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  </div>
                  <input id="admin-password" name="password" type={showPassword ? "text" : "password"} required value={adminCredentials.password} onChange={handleAdminInputChange}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-amber-600" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  </button>
                </div>
                {formErrors.password && <p className="mt-2 text-xs text-red-600">{formErrors.password}</p>}
              </div>
              {/* Admin Key Field */}
              <div>
                <label htmlFor="admin-key" className="block text-sm font-medium text-gray-700">Admin Key</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25z" /></svg>
                  </div>
                  <input id="admin-key" name="adminKey" type={showAdminKey ? "text" : "password"} required value={adminCredentials.adminKey} onChange={handleAdminInputChange}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.adminKey ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Secret Admin Key" />
                  <button type="button" onClick={() => setShowAdminKey(!showAdminKey)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-amber-600" aria-label={showAdminKey ? "Hide admin key" : "Show admin key"}>
                    {showAdminKey ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  </button>
                </div>
                {formErrors.adminKey && <p className="mt-2 text-xs text-red-600">{formErrors.adminKey}</p>}
              </div>
              {/* Admin Sign In Button */}
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-300 disabled:cursor-not-allowed transition-all duration-300">
                {loading ? 'Signing in...' : 'Sign In as Admin'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleUserDriverSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                  </div>
                  <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="you@example.com" />
                </div>
                {formErrors.email && <p className="mt-2 text-xs text-red-600">{formErrors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  </div>
                  <input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-amber-600 focus:outline-none focus:text-amber-600 transition-colors" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                {formErrors.password && <p className="mt-2 text-xs text-red-600">{formErrors.password}</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
                </div>
                <a href="#" className="text-sm font-medium text-amber-600 hover:text-amber-500">Forgot password?</a>
              </div>

              {/* Sign In Button */}
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-300 disabled:cursor-not-allowed transition-all duration-300">
                {loading ? (
                  <React.Fragment>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Signing in...
                  </React.Fragment>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}

          {/* Sign Up Link */}
          {loginRole !== 'admin' && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/signup', { state: { role: loginRole } });
                  }}
                  className="font-medium text-amber-600 hover:text-amber-500"
                >
                  Sign up here
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
