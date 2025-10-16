import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaEnvelope, FaPhone, FaArrowLeft, FaEdit, FaSave, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Swal from 'sweetalert2';

// Field component for displaying and editing fields
const ProfileField = ({ icon, label, name, value, isEditing, onChange, type = 'text' }) => {
  const IconComponent = icon;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 items-center py-4">
      <label htmlFor={name} className="sm:col-span-1 text-sm font-medium text-gray-700 flex items-center gap-3">
        <IconComponent className="h-5 w-5 text-gray-500" />
        {label}
      </label>
      <div className="sm:col-span-2">
        {isEditing ? (
          <input
            id={name}
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            className="block w-full text-base text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all"
            autoComplete="off"
            disabled={name === "role"} // Prevent editing role
          />
        ) : (
          <p className="text-base font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border">
            {value || 'Not provided'}
          </p>
        )}
      </div>
    </div>
  );
};

// Helper to get initials
const getInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length > 1) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: ''
  });

  const [tempProfileData, setTempProfileData] = useState(profileData);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = sessionStorage.getItem('userId');
        let token = sessionStorage.getItem('token') || sessionStorage.getItem('jwtToken');
        
        if (!userId || !token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:8305/api/users/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const user = await response.json();
          const profile = {
            fullName: user.fullName || user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || ''
          };
          
          setProfileData(profile);
          setTempProfileData(profile);
        } else {
          if (response.status === 401 || response.status === 403) {
            sessionStorage.clear();
            navigate('/login');
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        
        // Fallback to sessionStorage data
        const fallbackProfile = {
          fullName: sessionStorage.getItem('username') || '',
          email: sessionStorage.getItem('email') || '',
          phone: sessionStorage.getItem('phone') || '',
          role: sessionStorage.getItem('role') || 'USER'
        };
        
        if (fallbackProfile.fullName || fallbackProfile.email) {
          setProfileData(fallbackProfile);
          setTempProfileData(fallbackProfile);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Show SweetAlert2 confirmation
  const handleSaveClick = async () => {
    const emailChanged = profileData.email !== tempProfileData.email;
    
    let confirmText = 'Are you sure you want to save these profile changes?';
    let htmlContent = confirmText;
    
    if (emailChanged) {
      htmlContent = `
        <div style="text-align: left; margin: 15px 0;">
          <p style="margin-bottom: 15px; color: #374151;">Are you sure you want to save these profile changes?</p>
          <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 12px; margin-top: 10px;">
            <p style="color: #92400E; font-weight: 600; margin: 0 0 8px 0;">⚠️ Email Address Changed</p>
            <p style="color: #92400E; margin: 0 0 5px 0; font-size: 14px;">New email: <strong>${tempProfileData.email}</strong></p>
            <p style="color: #92400E; margin: 0; font-size: 13px;">Please use this new email for future logins.</p>
          </div>
        </div>
      `;
    }

    const result = await Swal.fire({
      title: 'Confirm Changes',
      html: htmlContent,
      icon: emailChanged ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: '#1F2937',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        htmlContainer: 'swal-custom-html'
      }
    });

    if (result.isConfirmed) {
      await handleConfirmSave(emailChanged);
    }
  };

  // Actual save function
  const handleConfirmSave = async (emailChanged) => {
    try {
      // Show loading
      Swal.fire({
        title: 'Saving...',
        text: 'Please wait while we update your profile',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });

      const userId = sessionStorage.getItem('userId');
      const username = sessionStorage.getItem('username') || profileData.fullName;
      let token = sessionStorage.getItem('token') || sessionStorage.getItem('jwtToken');

      // Step 1: Update user profile
      const userUpdateResponse = await fetch(`http://localhost:8305/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: tempProfileData.fullName,
          email: tempProfileData.email,
          phone: tempProfileData.phone
        })
      });

      if (!userUpdateResponse.ok) {
        const errorText = await userUpdateResponse.text();
        throw new Error("Failed to update profile: " + errorText);
      }

      // Step 2: Update booking details (non-critical)
      try {
        await fetch(`http://localhost:8305/api/bookings/user/${username}/update-details`, {
          method: 'PUT',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone: tempProfileData.phone
          })
        });
      } catch (bookingError) {
        console.log("Booking update failed (non-critical):", bookingError);
      }

      // Step 3: Update local state and session
      setProfileData(tempProfileData);
      sessionStorage.setItem('username', tempProfileData.fullName);
      sessionStorage.setItem('email', tempProfileData.email);
      sessionStorage.setItem('phone', tempProfileData.phone);

      setIsEditing(false);

      // Show success message
      if (emailChanged) {
        await Swal.fire({
          title: 'Profile Updated!',
          html: `
            <div style="text-align: left; margin: 10px 0;">
              <p style="color: #374151; margin-bottom: 15px;">Your profile has been updated successfully!</p>
              <div style="background: #ECFDF5; border: 1px solid #10B981; border-radius: 8px; padding: 12px;">
                <p style="color: #047857; margin: 0 0 5px 0; font-weight: 600;">📧 New Email Address</p>
                <p style="color: #047857; margin: 0; font-size: 14px;">Use <strong>${tempProfileData.email}</strong> for future logins</p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#1F2937',
          confirmButtonText: 'Got it!'
        });
      } else {
        await Swal.fire({
          title: 'Success!',
          text: 'Your profile has been updated successfully!',
          icon: 'success',
          confirmButtonColor: '#1F2937',
          timer: 3000,
          timerProgressBar: true
        });
      }

    } catch (error) {
      console.error("Failed to save profile:", error);
      
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to save profile: ' + error.message,
        icon: 'error',
        confirmButtonColor: '#DC2626',
        confirmButtonText: 'Try Again'
      });
    }
  };

  const handleCancel = () => {
    setTempProfileData(profileData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setTempProfileData(profileData);
    setIsEditing(true);
  };

  const profileFields = [
    { name: 'fullName', label: 'Full Name', icon: FaUserCircle, type: 'text' },
    { name: 'email', label: 'Email Address', icon: FaEnvelope, type: 'email' },
    { name: 'phone', label: 'Phone Number', icon: FaPhone, type: 'tel' },
    { name: 'role', label: 'Role', icon: FaUserCircle, type: 'text' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      {loading && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-800">Loading profile...</h3>
          </div>
        </div>
      )}

      {!loading && (
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/', { state: { openSidebar: true } })}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors group"
            >
              <FaArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header section */}
            <div className="px-6 py-8 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <span className="text-2xl font-semibold text-gray-700">{getInitials(profileData.fullName)}</span>
                  </div>
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
                      <p className="text-gray-600 mt-1">Manage your personal information</p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={handleEdit}
                        className="hidden sm:inline-flex items-center justify-center mt-3 sm:mt-0 bg-gray-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all shadow-sm hover:shadow-md"
                      >
                        <FaEdit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile fields */}
            <div className="px-6 py-6">
              <div className="space-y-1">
                {profileFields.map((field, index) => (
                  <div key={field.name}>
                    <ProfileField
                      {...field}
                      value={tempProfileData[field.name]}
                      isEditing={isEditing}
                      onChange={handleInputChange}
                    />
                    {index < profileFields.length - 1 && (
                      <div className="border-b border-gray-100"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            {isEditing ? (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                  >
                    <FaTimes className="mr-2 h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveClick}
                    className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all shadow-sm"
                  >
                    <FaSave className="mr-2 h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sm:hidden">
                <button
                  onClick={handleEdit}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all shadow-sm"
                >
                  <FaEdit className="mr-2 h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .swal-custom-popup {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .swal-custom-title {
          color: #1F2937 !important;
          font-size: 1.5rem !important;
          font-weight: 600 !important;
        }
        .swal-custom-html {
          margin: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default Profile;
