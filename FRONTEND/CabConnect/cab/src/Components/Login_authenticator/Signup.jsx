import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from '../../assets/logo.png';

const Signup=()=> {
  const navigate = useNavigate();
  const location = useLocation();

  // This state determines if the role was passed via navigation state and should be locked.
  const [isRoleLocked] = useState(!!location.state?.role);
  const [signupRole, setSignupRole] = useState(location.state?.role || 'user');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    aadhar: "",
    license: "",
    vehicleBrand: "",
    vehicleNumber: ""
  });
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);


  // handleInputChange keeps the form responsive and clean.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear specific field error on change
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // handleRoleChange ensures that switching roles gives the user a fresh form tailored to that role.
  const handleRoleChange = (newRole) => {
    if (isRoleLocked) return; // Prevent role change if it's locked

    if (newRole !== signupRole) {
      setSignupRole(newRole);
      setFormData({
        name: "", email: "", password: "", confirmPassword: "",
        phone: "", aadhar: "", license: "", vehicleBrand: "", vehicleNumber: ""
      });
      setError("");
      setFormErrors({});
      setAcceptTerms(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    const { name, email, password, confirmPassword, phone, aadhar, license, vehicleBrand, vehicleNumber } = formData;

    if (!name) errors.name = "Full name is required.";
    if (!email) {
      errors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email address is invalid.";
    }
    if (!phone) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10,}$/.test(phone)) {
      errors.phone = "Phone number must be at least 10 digits.";
    }
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (signupRole === 'driver') {
      if (!aadhar) errors.aadhar = "Aadhar number is required.";
      if (!license) errors.license = "License number is required.";
      if (!vehicleBrand) errors.vehicleBrand = "Vehicle brand and model are required.";
      if (!vehicleNumber) errors.vehicleNumber = "Vehicle number plate is required.";
    }

    if (!acceptTerms) {
      errors.terms = "You must accept the terms and conditions.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors.terms || "Please fix the errors above.");
      return;
    }

    setError("");
    setLoading(true);
    
    try {
      // Prepare user data for backend API
      const userData = {
        fullName: formData.name,              // ✅ Correct: maps to fullName in UserEntity
        email: formData.email,                // ✅ Correct
        password: formData.password,          // ✅ Correct
        phone: formData.phone,                // ✅ Correct
        role: signupRole,                     // ✅ Correct
        // Driver-specific fields (null for users) - FIXED FIELD NAMES
        aadharNumber: signupRole === 'driver' ? formData.aadhar : null,        // ✅ Fixed: aadharNumber
        licenseNumber: signupRole === 'driver' ? formData.license : null,      // ✅ Fixed: licenseNumber
        vehicleModel: signupRole === 'driver' ? formData.vehicleBrand : null,  // ✅ Correct
        vehicleNumber: signupRole === 'driver' ? formData.vehicleNumber : null // ✅ Correct
      };

      // Log the data being sent
      console.log('Sending registration data:', userData);
      console.log('User role:', signupRole);
      
      // Call backend registration API through Gateway
      const response = await fetch('http://localhost:8305/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('Registration successful:', result);
        // Registration successful
        if (signupRole === 'driver') {
          navigate('/login', {
            state: {
              role: signupRole,
              message: 'Request submitted! Your application is pending admin approval. You will be able to login once approved.'
            }
          });
        } else {
          navigate('/login', {
            state: {
              role: signupRole,
              message: 'Account created successfully! Please sign in.'
            }
          });
        }
      } else {
        // Handle registration errors
        const errorText = await response.text();
        console.log('Registration failed - Status:', response.status);
        console.log('Registration failed - Response text:', errorText);
        
        let errorData = null;
        try {
          errorData = JSON.parse(errorText);
          console.log('Registration failed - Parsed error:', errorData);
        } catch (e) {
          console.log('Registration failed - Could not parse as JSON:', e);
        }
        
        if (response.status === 409) {
          setError("An account with this email already exists.");
        } else if (response.status === 400) {
          setError("Invalid data provided. Please check your information.");
        } else if (response.status === 500) {
          setError(`Server error: ${errorText || 'Please try again later.'}`);
        } else {
          setError(errorData?.message || errorText || `Registration failed (${response.status}). Please try again.`);
        }
      }
    } catch (networkError) {
      console.error("Network error during registration:", networkError);
      if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
        setError("Cannot reach server. Please ensure the Gateway service is running on port 8305.");
      } else {
        setError("Unable to connect to server. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-300 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Logo/Brand Section */}
        <div className="text-center mb-4">
          <img 
            src={logo} 
            alt="Cab Connect Logo" 
            className="mx-auto h-16 w-auto"
          />
          <h1 className="mt-4 text-xl font-extrabold text-gray-900">Create Your Account</h1>
          <p className="mt-2 text-sm text-gray-600">Join our community and start your journey today.</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white p-8 shadow-2xl rounded-lg border border-yellow-200/50">
          <div className="mb-6">
            <div className={`flex w-full max-w-sm items-center justify-center rounded-full bg-gray-100 p-1 mx-auto ${isRoleLocked ? 'cursor-not-allowed' : ''}`}>
              <button
                type="button"
                onClick={() => handleRoleChange('user')}
                disabled={isRoleLocked}
                className={`flex w-full items-center justify-center gap-x-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                  signupRole === 'user'
                    ? 'bg-white text-amber-600 shadow'
                    : `text-gray-600 ${isRoleLocked ? 'opacity-50' : 'hover:bg-white/60'}`
                }`}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                <span>User</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('driver')}
                disabled={isRoleLocked}
                className={`flex w-full items-center justify-center gap-x-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                  signupRole === 'driver'
                    ? 'bg-white text-amber-600 shadow'
                    : `text-gray-600 ${isRoleLocked ? 'opacity-50' : 'hover:bg-white/60'}`
                }`}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM15.5 10a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0zM10 4.5a.75.75 0 01.75.75v1.316a3.996 3.996 0 013.455 3.168.75.75 0 01-1.48.232A2.496 2.496 0 0010.75 7.5v-2a.75.75 0 01-.75-.75zM10 15.5a.75.75 0 01-.75-.75v-1.316a3.996 3.996 0 01-3.455-3.168.75.75 0 011.48-.232A2.496 2.496 0 009.25 12.5v2a.75.75 0 01.75.75zM4.5 10a.75.75 0 01.75-.75h1.316a3.996 3.996 0 013.168 3.455.75.75 0 01-.232 1.48A2.496 2.496 0 007.5 12.75h-2a.75.75 0 01-.75-.75zM15.5 10a.75.75 0 01-.75.75h-1.316a3.996 3.996 0 01-3.168-3.455.75.75 0 01.232-1.48A2.496 2.496 0 0012.5 7.25h2a.75.75 0 01.75.75z" clipRule="evenodd" />
                </svg>
                <span>Driver</span>
              </button>
            </div>
          </div>

          <h2 className="text-base font-bold text-gray-800 mb-4 text-center">
            Sign Up as a {signupRole.charAt(0).toUpperCase() + signupRole.slice(1)}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-7-8a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 4a1 1 0 011 1v4a1 1 0 11-2 0V5a1 1 0 011-1zm0 8a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input id="name" name="name" type="text" required value={formData.name} onChange={handleInputChange}
                    className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="David Kumar" />
                </div>
                {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
              </div>
              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg></div>
                  <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleInputChange}
                    className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="10-digit number" />
                </div>
                {formErrors.phone && <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>}
              </div>
            </div>
            
            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg></div>
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="you@example.com" />
              </div>
              {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
            </div>

            {/* Driver-specific fields */}
            {signupRole === "driver" && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Driver Information</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {/* Aadhar Number */}
                    <div>
                      <label htmlFor="aadhar" className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg></div>
                        <input id="aadhar" name="aadhar" type="text" required={signupRole === 'driver'} value={formData.aadhar} onChange={handleInputChange}
                          className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.aadhar ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="12-digit number" />
                      </div>
                      {formErrors.aadhar && <p className="mt-1 text-xs text-red-600">{formErrors.aadhar}</p>}
                    </div>
                    {/* License Number */}
                    <div>
                      <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg></div>
                        <input id="license" name="license" type="text" required={signupRole === 'driver'} value={formData.license} onChange={handleInputChange}
                          className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.license ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Driving License No." />
                      </div>
                      {formErrors.license && <p className="mt-1 text-xs text-red-600">{formErrors.license}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {/* Vehicle Brand & Model */}
                    <div>
                      <label htmlFor="vehicleBrand" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Brand & Model *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M1 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6Zm2-2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H3Z" clipRule="evenodd" /><path d="M14 8a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1ZM6 8a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1Z" /></svg></div>
                        <input id="vehicleBrand" name="vehicleBrand" type="text" required={signupRole === 'driver'} value={formData.vehicleBrand} onChange={handleInputChange}
                          className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.vehicleBrand ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="e.g., Toyota Camry" />
                      </div>
                      {formErrors.vehicleBrand && <p className="mt-1 text-xs text-red-600">{formErrors.vehicleBrand}</p>}
                    </div>
                    {/* Vehicle Number Plate */}
                    <div>
                      <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number Plate *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0v-4.5h13v4.5a.75.75 0 0 0 1.5 0V2.75a.75.75 0 0 0-1.5 0v4.5h-13v-4.5ZM4 8.25h12V12H4V8.25Z" /></svg></div>
                        <input id="vehicleNumber" name="vehicleNumber" type="text" required={signupRole === 'driver'} value={formData.vehicleNumber} onChange={handleInputChange}
                          className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.vehicleNumber ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="e.g., MH 12 AB 1234" />
                      </div>
                      {formErrors.vehicleNumber && <p className="mt-1 text-xs text-red-600">{formErrors.vehicleNumber}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password Fields */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Account Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-amber-600" aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                    </button>
                  </div>
                  {formErrors.password && <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></div>
                    <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleInputChange}
                      className={`appearance-none block w-full pl-10 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Confirm password" />
                  </div>
                  {formErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{formErrors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="pt-1">
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="accept-terms" className="ml-3 block text-sm text-gray-900">
                I agree to the <a href="#" className="font-medium text-amber-600 hover:text-amber-500">Terms of Service</a>
              </label>
              {formErrors.terms && <p className="mt-1 text-xs text-red-600">{formErrors.terms}</p>}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-lg text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-300 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating Account...</>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-5 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                className="font-medium text-amber-600 hover:text-amber-500"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>

  );
}

export default Signup;
