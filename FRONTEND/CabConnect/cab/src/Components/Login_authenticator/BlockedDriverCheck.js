// Blocked Driver Check Logic - Add this to your Login component

export const checkBlockedDriver = async (email, password) => {
  try {
    // First, authenticate the user
    const loginResponse = await fetch('http://localhost:9091/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    if (!loginResponse.ok) {
      throw new Error('Invalid credentials');
    }

    const loginData = await loginResponse.json();
    
    // Check if user is a driver and if they are blocked
    if (loginData.role && loginData.role.toLowerCase() === 'driver') {
      // Fetch user details to check block status
      const userResponse = await fetch(`http://localhost:9091/api/users/${loginData.userId}`);
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        // Check if driver is blocked
        if (userData.blockStatus === 'yes') {
          return {
            success: false,
            blocked: true,
            message: `Your account has been blocked. Reason: ${userData.comments || 'Account suspended by admin'}`,
            blockReason: userData.comments
          };
        }
        
        // Check if driver is not approved yet
        if (userData.adminApproval === 'pending') {
          return {
            success: false,
            pending: true,
            message: 'Your driver application is still pending admin approval. Please wait for approval before logging in.'
          };
        }
        
        if (userData.adminApproval === 'rejected') {
          return {
            success: false,
            rejected: true,
            message: `Your driver application has been rejected. Reason: ${userData.adminComment || 'Application rejected by admin'}`
          };
        }
      }
    }

    // If not blocked, return success
    return {
      success: true,
      user: loginData
    };

  } catch (error) {
    return {
      success: false,
      error: true,
      message: error.message
    };
  }
};

// Usage in Login Component:
/*
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  const result = await checkBlockedDriver(email, password);
  
  if (result.success) {
    // Login successful - redirect to dashboard
    if (result.user.role === 'driver') {
      navigate('/driver-dashboard');
    } else {
      navigate('/user-dashboard');
    }
  } else if (result.blocked) {
    // Show blocked message
    setError(`🚫 Account Blocked: ${result.message}`);
  } else if (result.pending) {
    // Show pending approval message
    setError(`⏳ ${result.message}`);
  } else if (result.rejected) {
    // Show rejection message
    setError(`❌ ${result.message}`);
  } else {
    // Show general error
    setError(result.message || 'Login failed');
  }
  
  setLoading(false);
};
*/