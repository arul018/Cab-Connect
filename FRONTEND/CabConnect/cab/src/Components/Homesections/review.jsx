import React, { useState, useEffect } from 'react';
import { FaStar } from "react-icons/fa";
import axios from 'axios';

const Review = () => {
  const [reviewsData, setReviewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        // Fetch feedback data from backend
        const feedbackResponse = await axios.get('http://localhost:8305/api/feedback');
        
        if (feedbackResponse.status === 200) {
          const feedbackData = feedbackResponse.data;
          
          // Fetch user details for each feedback using userId
          const reviewsWithUserNames = await Promise.all(
            feedbackData.map(async (feedback) => {
              try {
                // Fetch user details from Authentication service
                const userResponse = await axios.get(`http://localhost:8305/api/users/${feedback.userId}`);
                
                return {
                  name: userResponse.data.fullName || null,
                  review: feedback.comments,
                  rating: feedback.ratings
                };
              } catch (userError) {
                // Return null for missing users to filter them out
                return null;
              }
            })
          );
          
          // Show only reviews with complete data (user found, positive rating) and limit to 3
          const positiveReviews = reviewsWithUserNames
            .filter(review => review !== null && review.name && review.review && review.rating >= 4)
            .slice(0, 3);
          
          setReviewsData(positiveReviews);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
        // Fallback to show a message if no feedback available
        setReviewsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <section className="p-10 bg-white text-center">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">What Our Customers Say</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          <p className="ml-4 text-gray-600">Loading reviews...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-10 bg-white text-center">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">What Our Customers Say</h2>

      {reviewsData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No reviews available yet.</p>
          <p className="text-gray-500 text-sm mt-2">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {reviewsData.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-100 p-6 rounded-xl shadow-sm text-left text-gray-800"
            >
              {/* ⭐ Stars */}
              <div className="flex mb-2">
                {Array(5)
                  .fill()
                  .map((_, i) => (
                    <FaStar
                      key={i}
                      className={`text-yellow-400 ${i < item.rating ? "" : "opacity-30"}`}
                    />
                  ))}
              </div>

              <p className="mb-2">"{item.review}"</p>
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-gray-400">Cab Rider</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Review;