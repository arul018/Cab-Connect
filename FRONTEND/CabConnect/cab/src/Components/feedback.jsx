import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaStar, FaRegCommentDots, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Header from './Header';
import axios from 'axios'; // ✅ Import axios

const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(0);
  const ratingDescriptions = {
    1: "Very Poor",
    2: "Poor", 
    3: "Average",
    4: "Good",
    5: "Excellent"
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center space-x-2 mb-3">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <label key={index}>
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => setRating(ratingValue)}
                className="hidden"
              />
              <FaStar
                className="cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-125"
                color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                size={40}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
              />
            </label>
          );
        })}
      </div>
      <p className="text-gray-600 font-medium h-6 transition-opacity text-sm">
        {rating ? ratingDescriptions[rating] : "Select a rating"}
      </p>
    </div>
  );
};

const FeedbackTag = ({ tag, isSelected, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(tag)}
    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200
      ${isSelected
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg transform scale-105'
        : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:border-indigo-400'
      }`}
  >
    {tag}
  </button>
);

const Feedback = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { bookingId } = state || { bookingId: 'N/A' };
  
  const [userId, setUserId] = useState(null);
  const [driverName, setDriverName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [selectedComment, setSelectedComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const feedbackOptions = [
    "Clean Car", 
    "Safe Driving", 
    "Polite Driver", 
    "On Time", 
    "Good Navigation",
    "Excellent Service",
    "Poor Hygiene", 
    "Rash Driving", 
    "Rude Driver",
    "Late Arrival"
  ];

  useEffect(() => {
    const fetchBookingAndUserData = async () => {
      try {
        const userIdFromSession = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('token') || sessionStorage.getItem('jwtToken');
        
        if (!userIdFromSession || !token) {
          setError('Please login to submit feedback.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        setUserId(userIdFromSession);

        if (bookingId && bookingId !== 'N/A') {
          // ✅ API CALL 1: Fetch booking details (using axios)
          const response = await axios.get(`http://localhost:8305/api/bookings/${bookingId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          // ✅ Success response handling
          if (response.status === 200) {
            setDriverName(response.data.driverName);
            console.log('✅ Booking data loaded:', response.data);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching booking data:', error);
        if (error.response) {
          // Server responded with error status
          setError(`Failed to fetch booking details: ${error.response.status}`);
        } else if (error.request) {
          // Network error
          setError('Network error: Unable to connect to booking service.');
        } else {
          // Other error
          setError('Unable to load booking information.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookingAndUserData();
  }, [bookingId, navigate]);

  const handleCommentSelection = (comment) => {
    setSelectedComment(selectedComment === comment ? '' : comment);
    setError(''); // Clear any previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Frontend validation
    if (rating === 0) {
      setError('Please select a star rating before submitting.');
      return;
    }

    if (!selectedComment) {
      setError('Please select one feedback option.');
      return;
    }

    if (!driverName) {
      setError('Unable to identify the driver for this booking.');
      return;
    }

    setSubmitting(true);
    setError('');

    // ✅ Prepare data for backend
    const feedbackData = {
      userId: parseInt(userId),
      driverName: driverName,
      ratings: rating,
      comments: selectedComment
    };

    console.log('📤 Submitting feedback:', feedbackData);

    try {
      const token = sessionStorage.getItem('token') || sessionStorage.getItem('jwtToken');
      
      // ✅ API CALL 2: Submit feedback to feedback service (using axios)
      const response = await axios.post('http://localhost:8305/api/feedback', feedbackData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // ✅ Success response handling
      if (response.status === 201) {
        console.log('✅ Feedback submitted successfully:', response.data);
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }

    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || 'Unknown error';
        
        if (status === 401) {
          setError('Authentication failed. Please login again.');
          setTimeout(() => navigate('/login'), 2000);
        } else if (status === 400) {
          setError('Invalid feedback data. Please check your input.');
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Error ${status}: ${message}`);
        }
      } else if (error.request) {
        // Network error - feedback service not running
        setError('Cannot connect to feedback service. Please try again later.');
        console.error('🚨 Feedback service (port 9094) may not be running!');
      } else {
        // Other error
        setError('Unable to submit your feedback. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Header>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading feedback form...</p>
          </div>
        </main>
      </Header>
    );
  }

  if (success) {
    return (
      <Header>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-100 rounded-full">
                <FaCheckCircle className="text-green-600" size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-4">Your feedback has been submitted successfully.</p>
            <p className="text-sm text-gray-500 mb-6">We appreciate your time and will use your input to improve our service.</p>
            <div className="text-5xl mb-4">🚗✨</div>
            <p className="text-gray-500 text-sm">Redirecting to home in 3 seconds...</p>
          </div>
        </main>
      </Header>
    );
  }

  return (
    <Header>
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Header Section */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-indigo-100 rounded-full">
                <FaRegCommentDots className="text-indigo-600" size={28} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Rate Your Ride</h1>
            <p className="text-gray-600">
              Share your experience with <span className="font-semibold text-indigo-600">{driverName || 'your driver'}</span>
            </p>
            <p className="text-sm text-gray-400">
              Booking ID: <span className="font-medium text-gray-600">{bookingId}</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <FaExclamationTriangle className="text-red-500 mr-3" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            
            {/* Star Rating Section */}
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-center text-lg font-medium text-gray-800 mb-6">How was your experience?</p>
              <StarRating rating={rating} setRating={setRating} />
            </div>

            {/* Feedback Selection */}
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-center text-lg font-medium text-gray-800 mb-6">
                What stood out? <span className="text-sm text-gray-500 font-normal">(Select one)</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                {feedbackOptions.map(option => (
                  <FeedbackTag
                    key={option}
                    tag={option}
                    isSelected={selectedComment === option}
                    onClick={handleCommentSelection}
                  />
                ))}
              </div>
              {selectedComment && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full">
                    <span className="text-sm font-medium">Selected: {selectedComment}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={rating === 0 || !selectedComment || submitting}
              className="w-full py-4 px-6 border border-transparent rounded-xl text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-sm"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Feedback'
              )}
            </button>
            
          </form>
        </div>
      </main>
    </Header>
  );
};

export default Feedback;