import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Trash2, UserX, UserCheck, Star, CheckCircle, XCircle, ShieldOff, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

const getInitials = (name) => {
  if (!name) return '?';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

const avatarColors = ['bg-blue-200 text-blue-800', 'bg-green-200 text-green-800', 'bg-purple-200 text-purple-800', 'bg-red-200 text-red-800', 'bg-yellow-200 text-yellow-800'];

const TabButton = ({ text, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
      isActive
        ? 'border-amber-500 text-amber-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {text} <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{count}</span>
  </button>
);

const AllDrivers = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [approvedDrivers, setApprovedDrivers] = useState([]);
  const [rejectedDrivers, setRejectedDrivers] = useState([]);
  const [driverRatings, setDriverRatings] = useState([]);

  // Fetch drivers data for each tab
  useEffect(() => {
    // Fetch pending drivers
    fetch('http://localhost:8305/admin/pending-drivers')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setPendingDrivers(Array.isArray(data) ? data.map(d => ({
          ...d,
          status: 'Pending Approval',
          name: d.fullName,
          email: d.email,
          phone: d.phone,
          vehicleBrand: d.vehicleBrand || d.vehicleModel || '',
          vehicleModel: d.vehicleModel || '',
          vehicleNumber: d.vehicleNumber || '',
          license: d.licenseNumber || '',
          aadhar: d.aadharNumber || '',
          registered: d.registered || '',
          id: d.userId || d.id,
        })) : []);
      });
    // Fetch approved drivers
    fetch('http://localhost:8305/admin/approved-drivers')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setApprovedDrivers(Array.isArray(data) ? data.map(d => ({
          ...d,
          status: 'Approved',
          name: d.fullName,
          email: d.email,
          phone: d.phone,
          vehicleBrand: d.vehicleBrand || d.vehicleModel || '',
          vehicleModel: d.vehicleModel || '',
          vehicleNumber: d.vehicleNumber || '',
          license: d.licenseNumber || '',
          aadhar: d.aadharNumber || '',
          registered: d.registered || '',
          id: d.userId || d.id,
        })) : []);
      });
    // Fetch rejected drivers
    fetch('http://localhost:8305/admin/rejected-drivers')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setRejectedDrivers(Array.isArray(data) ? data.map(d => ({
          ...d,
          status: 'Rejected',
          name: d.fullName,
          email: d.email,
          phone: d.phone,
          vehicleBrand: d.vehicleBrand || d.vehicleModel || '',
          vehicleModel: d.vehicleModel || '',
          vehicleNumber: d.vehicleNumber || '',
          license: d.licenseNumber || '',
          aadhar: d.aadharNumber || '',
          registered: d.registered || '',
          id: d.userId || d.id,
          rejectionReason: d.adminComment || '',
        })) : []);
      });
    
    // Fetch driver ratings from feedback service and merge with block status
    const fetchDriverRatingsWithBlockStatus = async () => {
      try {
        // Fetch feedback data
        const feedbackRes = await fetch('http://localhost:8305/api/feedback');
        const feedbackData = feedbackRes.ok ? await feedbackRes.json() : [];
        
        // Fetch all users to get block status
        const usersRes = await fetch('http://localhost:8305/api/users');
        const usersData = usersRes.ok ? await usersRes.json() : [];
        
        if (Array.isArray(feedbackData)) {
          // Group feedback by driver name and calculate average ratings
          const ratingsMap = {};
          feedbackData.forEach(feedback => {
            const driverName = feedback.driverName;
            if (!ratingsMap[driverName]) {
              ratingsMap[driverName] = {
                driverName,
                ratings: [],
                totalRatings: 0,
                averageRating: 0,
                feedbackCount: 0,
                recentComments: [],
                isBlocked: false,
                blockReason: null
              };
            }
            ratingsMap[driverName].ratings.push(feedback.ratings);
            ratingsMap[driverName].feedbackCount++;
            ratingsMap[driverName].recentComments.push({
              rating: feedback.ratings,
              comment: feedback.comments,
              userId: feedback.userId
            });
          });
          
          // Calculate averages and merge with block status
          const ratingsArray = Object.values(ratingsMap).map(driver => {
            const total = driver.ratings.reduce((sum, rating) => sum + rating, 0);
            driver.averageRating = (total / driver.ratings.length).toFixed(1);
            driver.totalRatings = total;
            driver.recentComments = driver.recentComments.slice(-3);
            
            // Find corresponding user data to get block status
            const userData = usersData.find(u => 
              u.fullName === driver.driverName && 
              String(u.role).toLowerCase() === 'driver'
            );
            
            if (userData) {
              driver.isBlocked = userData.blockStatus === 'yes';
              driver.blockReason = userData.blockStatus === 'yes' ? userData.comments : null;
              console.log(`[AllDrivers] Driver ${driver.driverName}: blockStatus=${userData.blockStatus}, isBlocked=${driver.isBlocked}`);
            }
            
            return driver;
          }).sort((a, b) => b.averageRating - a.averageRating);
          
          setDriverRatings(ratingsArray);
          console.log('[AllDrivers] Driver ratings with block status:', ratingsArray);
        }
      } catch (err) {
        console.error('Failed to fetch driver ratings with block status:', err);
      }
    };
    
    fetchDriverRatingsWithBlockStatus();
  }, []);

  const handleApproveDriver = (driver) => {
    Swal.fire({
      title: 'Approve Driver',
      text: `Are you sure you want to approve ${driver.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, approve!'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:8305/admin/driver/${driver.id}/approve`, { method: 'PUT' })
          .then(res => {
            if (!res.ok) throw new Error('Failed to approve driver');
            setPendingDrivers(prevDrivers => prevDrivers.filter(d => d.id !== driver.id));
            setApprovedDrivers(prevDrivers => [...prevDrivers, { ...driver, status: 'Approved' }]);
            Swal.fire('Approved!', `${driver.name} has been approved.`, 'success');
          })
          .catch(err => {
            Swal.fire('Error', err.message, 'error');
          });
      }
    });
  };

  const handleBlockDriver = (driver) => {
    Swal.fire({
      title: `Block ${driver.name}`,
      text: 'Please select a reason for blocking this driver:',
      input: 'select',
      inputOptions: {
        'Poor Customer Ratings': 'Poor Customer Ratings',
        'Violated Terms of Service': 'Violated Terms of Service',
        'Vehicle Maintenance Issues': 'Vehicle Maintenance Issues',
        'Other': 'Other (specify reason)'
      },
      inputPlaceholder: 'Select a reason',
      showCancelButton: true,
      confirmButtonText: 'Next &rarr;',
      confirmButtonColor: '#ef4444', // red-500
      cancelButtonColor: '#6b7280', // gray-500
      customClass: { popup: 'rounded-xl shadow-lg', input: 'mt-4' },
      inputValidator: (value) => !value && 'You need to select a reason!'
    }).then((result) => {
      if (!result.isConfirmed) return;

      const performBlock = (reason) => {
        setPendingDrivers(drivers => drivers.filter(d => d.id !== driver.id));
        setRejectedDrivers(drivers => [...drivers, { ...driver, status: 'Rejected', rejectionReason: reason }]);
        Swal.fire('Blocked!', `${driver.name} has been blocked.`, 'success');
      };

      if (result.value === 'Other') {
        Swal.fire({
          title: 'Specify Reason for Blocking',
          input: 'textarea',
          inputPlaceholder: 'Enter the specific reason here...',
          showCancelButton: true,
          confirmButtonText: 'Block Driver',
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#6b7280',
          customClass: { popup: 'rounded-xl shadow-lg', input: 'h-24' },
          inputValidator: (value) => !value && 'You must provide a reason!'
        }).then((textResult) => {
          if (textResult.isConfirmed && textResult.value) {
            performBlock(textResult.value);
          }
        });
      } else {
        performBlock(result.value);
      }
    });
  };

  const handleUnblockDriver = (driver) => {
    Swal.fire({
      title: `Unblock ${driver.name}?`,
      text: "This will allow the driver to go online again.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981', // green-500
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Unblock'
    }).then((result) => {
      if (result.isConfirmed) {
        setRejectedDrivers(drivers => drivers.filter(d => d.id !== driver.id));
        setApprovedDrivers(drivers => [...drivers, { ...driver, status: 'Approved' }]);
        Swal.fire('Unblocked!', `${driver.name} has been unblocked.`, 'success');
      }
    });
  };

  const handleDeleteDriver = (driver) => {
    Swal.fire({
      title: `Delete ${driver.name}`,
      text: 'Please select a reason for deleting this driver. This action is permanent.',
      input: 'select',
      inputOptions: {
        'Driver Left Platform': 'Driver Left the Platform',
        'Duplicate Account': 'Duplicate Account',
        'Fraudulent Activity': 'Fraudulent Activity',
        'Other': 'Other (please specify)'
      },
      inputPlaceholder: 'Select a reason',
      showCancelButton: true,
      confirmButtonText: 'Next &rarr;',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      customClass: { popup: 'rounded-xl shadow-lg', input: 'mt-4' },
      inputValidator: (value) => !value && 'You must select a reason!'
    }).then((result) => {
      if (!result.isConfirmed) return;

      const performDelete = (reason) => {
        setRejectedDrivers(drivers => drivers.filter(d => d.id !== driver.id));
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `${driver.name} has been permanently deleted. Reason: ${reason}`,
        });
      };

      if (result.value === 'Other') {
        Swal.fire({
          title: 'Specify Deletion Reason',
          input: 'textarea',
          inputPlaceholder: 'Enter the specific reason for deletion...',
          showCancelButton: true,
          confirmButtonText: 'Confirm Deletion',
          confirmButtonColor: '#d33',
          cancelButtonColor: '#6b7280',
          customClass: { popup: 'rounded-xl shadow-lg', input: 'h-24' },
          inputValidator: (value) => !value && 'You must provide a reason!'
        }).then((textResult) => {
          if (textResult.isConfirmed && textResult.value) {
            performDelete(textResult.value);
          }
        });
      } else {
        performDelete(result.value);
      }
    });
  };

  const handleRejectWithRemark = (driver) => {
    const performReject = (reason) => {
      fetch(`http://localhost:8305/admin/driver/${driver.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: reason })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to reject driver');
          setPendingDrivers(prevDrivers => prevDrivers.filter(d => d.id !== driver.id));
          setRejectedDrivers(prevDrivers => [...prevDrivers, { ...driver, status: 'Rejected', rejectionReason: reason }]);
          Swal.fire('Rejected!', `${driver.name} has been rejected.`, 'success');
        })
        .catch(err => {
          Swal.fire('Error', err.message, 'error');
        });
    };

    Swal.fire({
      title: `Reject ${driver.name}`,
      text: 'Please select a reason for rejecting this application:',
      input: 'select',
      inputOptions: {
        'Incomplete/Invalid Documents': 'Incomplete/Invalid Documents',
        'Vehicle Does Not Meet Standards': 'Vehicle Does Not Meet Standards',
        'Background Check Failed': 'Background Check Failed',
        'Other': 'Other (specify reason)'
      },
      inputPlaceholder: 'Select a reason',
      showCancelButton: true,
      confirmButtonText: 'Next &rarr;',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      customClass: { popup: 'rounded-xl shadow-lg', input: 'mt-4' },
      inputValidator: (value) => !value && 'You must select a reason!'
    }).then((result) => {
      if (!result.isConfirmed) return;

      if (result.value === 'Other') {
        Swal.fire({
          title: 'Specify Rejection Reason',
          input: 'textarea',
          inputPlaceholder: 'Enter the specific reason here...',
          showCancelButton: true,
          confirmButtonText: 'Confirm Rejection',
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#6b7280',
          customClass: { popup: 'rounded-xl shadow-lg', input: 'h-24' },
          inputValidator: (value) => !value && 'You must provide a reason!'
        }).then((textResult) => {
          if (textResult.isConfirmed && textResult.value) {
            performReject(textResult.value);
          }
        });
      } else {
        performReject(result.value);
      }
    });
  };

  const handleBlockDriverFromRatings = async (driverName, averageRating) => {
    try {
      // First, get driver details from approved drivers to find the user ID
      const driverDetails = approvedDrivers.find(d => d.name === driverName);
      if (!driverDetails) {
        Swal.fire('Error', 'Driver details not found. Driver may not be approved yet.', 'error');
        return;
      }

      // Check if driver has good ratings (3+ stars)
      if (averageRating >= 3) {
        const confirmResult = await Swal.fire({
          title: 'Are you sure?',
          html: `
            <div class="text-left">
              <p class="mb-3">Driver Rating: <strong class="text-green-600">${averageRating}/5.0</strong></p>
              <p class="mb-3 text-orange-600">⚠️ This driver has good ratings. Are you sure you want to block them?</p>
            </div>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, Block Anyway',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#6b7280'
        });
        
        if (!confirmResult.isConfirmed) return;
      }

      const result = await Swal.fire({
        title: `Block ${driverName}?`,
        html: `
          <div class="text-left">
            <p class="mb-3">Driver Rating: <strong>${averageRating}/5.0</strong></p>
            <p class="mb-3 ${averageRating < 3 ? 'text-red-600' : 'text-gray-600'}">Select a reason for blocking:</p>
          </div>
        `,
        input: 'select',
        inputOptions: {
          'Poor Customer Ratings': 'Poor Customer Ratings',
          'Consistently Bad Service': 'Consistently Bad Service', 
          'Customer Complaints': 'Customer Complaints',
          'Other': 'Other (specify reason)'
        },
        inputPlaceholder: 'Select a reason',
        showCancelButton: true,
        confirmButtonText: 'Block Driver',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        inputValidator: (value) => !value && 'You must select a reason!'
      });

      if (!result.isConfirmed) return;

      let blockReason = result.value;
      if (result.value === 'Other') {
        const customReason = await Swal.fire({
          title: 'Specify Blocking Reason',
          input: 'textarea',
          inputPlaceholder: 'Enter the specific reason for blocking...',
          showCancelButton: true,
          confirmButtonText: 'Block Driver',
          confirmButtonColor: '#ef4444',
          inputValidator: (value) => !value && 'You must provide a reason!'
        });
        if (!customReason.isConfirmed) return;
        blockReason = customReason.value;
      }

      // Call Authentication Service to block the driver
      const response = await fetch(`http://localhost:8305/api/users/${driverDetails.id}/block`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: blockReason })
      });

      if (!response.ok) throw new Error('Failed to block driver');

      // Update local state - mark driver as blocked
      setDriverRatings(prevRatings => 
        prevRatings.map(driver => 
          driver.driverName === driverName 
            ? { ...driver, isBlocked: true, blockReason }
            : driver
        )
      );

      Swal.fire('Blocked!', `${driverName} has been blocked due to poor ratings.`, 'success');
    } catch (error) {
      console.error('Block driver error:', error);
      Swal.fire('Error', 'Failed to block driver. Please try again.', 'error');
    }
  };

  const handleUnblockDriverFromRatings = async (driverName) => {
    try {
      const driverDetails = approvedDrivers.find(d => d.name === driverName);
      if (!driverDetails) {
        Swal.fire('Error', 'Driver details not found.', 'error');
        return;
      }

      const result = await Swal.fire({
        title: `Unblock ${driverName}?`,
        text: 'This will allow the driver to go online again.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Unblock'
      });

      if (!result.isConfirmed) return;

      const response = await fetch(`http://localhost:8305/api/users/${driverDetails.id}/unblock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to unblock driver');

      // Update local state
      setDriverRatings(prevRatings => 
        prevRatings.map(driver => 
          driver.driverName === driverName 
            ? { ...driver, isBlocked: false, blockReason: null }
            : driver
        )
      );

      Swal.fire('Unblocked!', `${driverName} has been unblocked.`, 'success');
    } catch (error) {
      console.error('Unblock driver error:', error);
      Swal.fire('Error', 'Failed to unblock driver. Please try again.', 'error');
    }
  };

  const handleReview = (driver) => {
    Swal.fire({
      title: `<strong class="text-2xl font-bold text-gray-800">Driver Application Review</strong>`,
      html: `
        <div class="text-left p-4 space-y-6 bg-gray-50 rounded-lg border">
          
          <div><strong class="text-gray-500">Driver ID:</strong><p class="text-gray-900 font-mono">${driver.id}</p></div>
          <!-- Personal Details -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Personal Details</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><strong class="text-gray-500">Name:</strong><p class="text-gray-900">${driver.name}</p></div>
              <div><strong class="text-gray-500">Email:</strong><p class="text-gray-900">${driver.email}</p></div>
              <div><strong class="text-gray-500">Phone:</strong><p class="text-gray-900">${driver.phone}</p></div>
              <div><strong class="text-gray-500">Registered:</strong><p class="text-gray-900">${formatDate(driver.registered)}</p></div>
            </div>
          </div>

          <!-- Document Details -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Documents</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><strong class="text-gray-500">Aadhar No:</strong><p class="text-gray-900 font-mono">${driver.aadhar}</p></div>
              <div><strong class="text-gray-500">License No:</strong><p class="text-gray-900 font-mono">${driver.license}</p></div>
            </div>
          </div>

          <!-- Vehicle Details -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Vehicle Information</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><strong class="text-gray-500">Brand:</strong><p class="text-gray-900">${driver.vehicleBrand}</p></div>
              <div><strong class="text-gray-500">Model:</strong><p class="text-gray-900">${driver.vehicleModel}</p></div>
              <div class="sm:col-span-2"><strong class="text-gray-500">Number Plate:</strong>
                <p class="inline-block mt-1 font-mono bg-gray-200 px-2 py-1 rounded-md text-gray-800">${driver.vehicleNumber}</p>
              </div>
            </div>
          </div>

          <!-- Document Verification -->
          <div>
            <h3 class="text-lg font-semibold text-red-600 mb-3 pb-2 border-b border-red-200">Document Verification Required</h3>
            <div class="space-y-3 bg-red-50 p-4 rounded-lg">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" id="aadhar-verified" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                <span class="text-sm font-medium text-gray-700">✅ Aadhar document verified and matches details</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" id="license-verified" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                <span class="text-sm font-medium text-gray-700">✅ Driving license verified and valid</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" id="vehicle-verified" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                <span class="text-sm font-medium text-gray-700">✅ Vehicle registration verified and matches</span>
              </label>
              <p class="text-xs text-red-600 mt-2 font-medium">⚠️ All documents must be verified before approval</p>
            </div>
          </div>

        </div>
      `,
      showCloseButton: true,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: `<span class="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><polyline points="20 6 9 17 4 12"></polyline></svg>Approve</span>`,
      denyButtonText: `<span class="flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>Reject</span>`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10B981', // green-500
      denyButtonColor: '#EF4444', // red-500
      preConfirm: () => {
        const aadharChecked = document.getElementById('aadhar-verified').checked;
        const licenseChecked = document.getElementById('license-verified').checked;
        const vehicleChecked = document.getElementById('vehicle-verified').checked;
        
        if (!aadharChecked || !licenseChecked || !vehicleChecked) {
          Swal.showValidationMessage('Please verify all documents before approving!');
          return false;
        }
        return true;
      },
      customClass: {
        popup: 'rounded-2xl shadow-lg',
        title: 'pt-5',
        htmlContainer: 'text-base',
        actions: 'w-full px-4',
        confirmButton: 'font-semibold',
        denyButton: 'font-semibold',
      },
      width: '44rem',
    }).then((result) => {
      if (result.isConfirmed) {
        handleApproveDriver(driver);
      } else if (result.isDenied) {
        handleRejectWithRemark(driver);
      }
    });
  };

  // Only use real drivers from context; no dummy data
  const filteredPendingDrivers = useMemo(() => pendingDrivers.filter(d => d.adminApproval === 'pending'), [pendingDrivers]);
  const filteredApprovedDrivers = useMemo(() => approvedDrivers.filter(d => d.adminApproval === 'approved'), [approvedDrivers]);
  const filteredRejectedDrivers = useMemo(() => rejectedDrivers.filter(d => d.adminApproval === 'rejected'), [rejectedDrivers]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Online': return 'bg-green-100 text-green-800';
      case 'Offline': return 'bg-gray-100 text-gray-800';
      case 'Pending Approval': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-orange-100 text-orange-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Manage Drivers</h3>
      </div>
      <div className="flex border-b border-gray-200">
        <TabButton text="Pending Approval" count={pendingDrivers.length} isActive={activeTab === 'pending'} onClick={() => setActiveTab('pending')} />
        <TabButton text="Approved" count={approvedDrivers.length} isActive={activeTab === 'approved'} onClick={() => setActiveTab('approved')} />
        <TabButton text="Rejected" count={rejectedDrivers.length} isActive={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')} />
        <TabButton text="Driver Ratings" count={driverRatings.length} isActive={activeTab === 'ratings'} onClick={() => setActiveTab('ratings')} />
      </div>

      {/* Pending Drivers Table */}
      {activeTab === 'pending' && (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr className="text-sm text-gray-600 uppercase tracking-wider">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Vehicle</th>
              <th className="p-4 font-medium">Registered</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPendingDrivers.map((driver, index) => (
              <tr key={driver.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold ${avatarColors[index % avatarColors.length]}`}>
                      {getInitials(driver.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{driver.name}</div>
                      <div className="text-sm text-gray-500 font-mono">ID: {driver.id}</div>
                      <div className="text-sm text-gray-500">{driver.email}</div>
                      <div className="text-sm text-gray-500">{driver.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-gray-600">{`${driver.vehicleBrand} ${driver.vehicleModel}`}</td>
                <td className="p-4 text-gray-600">{formatDate(driver.registered)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800`}>
                    Pending Approval
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => handleReview(driver)} className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors" title="Review Application">
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPendingDrivers.length === 0 && (
              <tr><td colSpan="5" className="text-center p-8 text-gray-500">No pending driver applications.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Approved Drivers Table */}
      {activeTab === 'approved' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr className="text-sm text-gray-600 uppercase tracking-wider">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Vehicle</th>
                <th className="p-4 font-medium">Registered</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApprovedDrivers.map((driver, index) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold ${avatarColors[index % avatarColors.length]}`}>
                        {getInitials(driver.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{driver.name}</div>
                        <div className="text-sm text-gray-500 font-mono">ID: {driver.id}</div>
                        <div className="text-sm text-gray-500">{driver.email}</div>
                        <div className="text-sm text-gray-500">{driver.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{`${driver.vehicleBrand} ${driver.vehicleModel}`}</td>
                  <td className="p-4 text-gray-600">{formatDate(driver.registered)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800`}>
                      Approved
                    </span>
                  </td>
                </tr>
              ))}
              {filteredApprovedDrivers.length === 0 && (
                <tr><td colSpan="4" className="text-center p-8 text-gray-500">No approved drivers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejected Drivers Table */}
      {activeTab === 'rejected' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr className="text-sm text-gray-600 uppercase tracking-wider">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Reason for Rejection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRejectedDrivers.map((driver, index) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold ${avatarColors[index % avatarColors.length]}`}>
                        {getInitials(driver.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{driver.name}</div>
                        <div className="text-sm text-gray-500 font-mono">ID: {driver.id}</div>
                        <div className="text-sm text-gray-500">{driver.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700 italic">"{driver.rejectionReason}"</td>
                </tr>
              ))}
              {filteredRejectedDrivers.length === 0 && (
                <tr><td colSpan="2" className="text-center p-8 text-gray-500">No rejected drivers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Driver Ratings Table */}
      {activeTab === 'ratings' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr className="text-sm text-gray-600 uppercase tracking-wider">
                <th className="p-4 font-medium">Driver Name</th>
                <th className="p-4 font-medium">Average Rating</th>
                <th className="p-4 font-medium">Total Feedback</th>
                <th className="p-4 font-medium">Recent Comments</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {driverRatings.map((driver, index) => (
                <tr key={driver.driverName} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold ${avatarColors[index % avatarColors.length]}`}>
                        {getInitials(driver.driverName)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{driver.driverName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="flex items-center mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={`${
                              star <= Math.round(driver.averageRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {driver.averageRating}/5.0
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {driver.feedbackCount} reviews
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1 max-w-xs">
                      {driver.recentComments.slice(0, 2).map((comment, idx) => (
                        <div key={idx} className="text-xs text-gray-600 italic">
                          <span className="font-medium">{comment.rating}★</span> "{comment.comment}"
                        </div>
                      ))}
                      {driver.recentComments.length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{driver.recentComments.length - 2} more reviews
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center space-x-2">
                      {driver.isBlocked ? (
                        <>
                          <button 
                            onClick={() => handleUnblockDriverFromRatings(driver.driverName)}
                            className="p-2 rounded-full text-green-600 hover:bg-green-100 transition-colors" 
                            title="Unblock Driver"
                          >
                            <UserCheck size={18} />
                          </button>
                          <div className="text-xs text-red-600 mt-1">
                            Blocked: {driver.blockReason}
                          </div>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleBlockDriverFromRatings(driver.driverName, driver.averageRating)}
                          className={`p-2 rounded-full transition-colors ${
                            driver.averageRating < 3 
                              ? 'text-red-600 hover:bg-red-100' 
                              : 'text-yellow-600 hover:bg-yellow-100'
                          }`}
                          title={`Block Driver ${driver.averageRating < 3 ? '(Poor Rating)' : ''}`}
                        >
                          <UserX size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {driverRatings.length === 0 && (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">No driver ratings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllDrivers;