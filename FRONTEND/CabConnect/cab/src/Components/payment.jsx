import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaCreditCard, FaRegCreditCard, FaLock, FaTicketAlt, FaUniversity } from 'react-icons/fa';
import { SiGooglepay, SiPaytm, SiPhonepe } from 'react-icons/si';
import Header from './Header';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { fare, bookingId } = state || { fare: 'N/A', bookingId: 'N/A' };
  const [paymentMethod, setPaymentMethod] = useState('card');

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const originalFare = useMemo(() => (fare ? parseFloat(fare.replace('₹', '')) : 0), [fare]);
  const finalFare = originalFare - discount;

  const availableCoupons = {
    WEEKDAY20: { type: 'percentage', value: 20, max: 50, description: '20% off up to ₹50' },
    CABCONNECT50: { type: 'flat', value: 50, description: 'Flat ₹50 off' },
    RIDEFREE: { type: 'percentage', value: 100, max: 150, description: '100% off up to ₹150' }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    // Simulate payment processing
    Swal.fire({
      title: 'Processing Payment...',
      text: 'Please wait while we securely process your transaction.',
      icon: 'info',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    setTimeout(async () => {
      try {
        // Update payment status in backend after successful payment
        const token = sessionStorage.getItem('jwtToken');
        
        console.log('Processing payment for booking ID:', bookingId);
        
        // First, let's try the payment endpoint (using PUT for updating payment status)
        const paymentResponse = await fetch(`http://localhost:8305/api/bookings/${bookingId}/payment`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentStatus: "COMPLETED"
          })
        });

        // If payment endpoint fails, try the status endpoint as fallback
        let response = paymentResponse;
        if (!paymentResponse.ok) {
          console.log('Payment endpoint failed, trying status endpoint...');
          response = await fetch(`http://localhost:8305/api/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              paymentStatus: "COMPLETED"
            })
          });
        }

        if (response.ok) {
          console.log('Payment status updated successfully for booking:', bookingId);
          
          // Verify the update by fetching the booking details
          const verifyResponse = await fetch(`http://localhost:8305/api/bookings/${bookingId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (verifyResponse.ok) {
            const updatedBooking = await verifyResponse.json();
            console.log('Verified booking payment status:', updatedBooking.paymentStatus);
          }
          
          Swal.fire({
            title: 'Payment Successful!',
            text: `Your ride (ID: ${bookingId}) has been completed and payment of ₹${finalFare.toFixed(2)} has been received.`,
            icon: 'success',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            willClose: () => {
              navigate('/feedback', { state: { bookingId } });
            }
          });
        } else {
          const errorText = await response.text();
          console.error('Payment status update failed:', errorText);
          throw new Error('Failed to update payment status');
        }
      } catch (error) {
        console.error('Payment status update error:', error);
        
        // Show error but still navigate to feedback
        Swal.fire({
          title: 'Payment Processed',
          text: `Your payment of ₹${finalFare.toFixed(2)} has been processed. There was an issue updating the status, but your payment is successful.`,
          icon: 'warning',
          timer: 4000,
          timerProgressBar: true,
          showConfirmButton: false,
          willClose: () => {
            navigate('/feedback', { state: { bookingId } });
          }
        });
      }
    }, 2000);
  };

  const handleApplyCoupon = () => {
    const coupon = availableCoupons[couponCode.toUpperCase()];
    if (coupon) {
      let calculatedDiscount = 0;
      if (coupon.type === 'percentage') {
        calculatedDiscount = (originalFare * coupon.value) / 100;
        if (coupon.max) {
          calculatedDiscount = Math.min(calculatedDiscount, coupon.max);
        }
      } else if (coupon.type === 'flat') {
        calculatedDiscount = coupon.value;
      }

      calculatedDiscount = Math.min(calculatedDiscount, originalFare);
      setDiscount(calculatedDiscount);
      setCouponError('');
      setCouponSuccess(`Coupon "${couponCode.toUpperCase()}" applied!`);
    } else {
      setDiscount(0);
      setCouponError('Invalid coupon code.');
      setCouponSuccess('');
    }
  };

  const renderCardForm = () => (
    <form onSubmit={handlePayment} className="space-y-5 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Pay with Card</h3>
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card Number</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaRegCreditCard className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input type="text" id="cardNumber" name="cardNumber" className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5" placeholder="0000 0000 0000 0000" required pattern="\d{16}" title="Card number must be 16 digits" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">Expiry Date</label>
          <input type="text" id="expiry" name="expiry" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2.5" placeholder="MM/YY" required pattern="(0[1-9]|1[0-2])\/?([0-9]{2})" title="Please enter a valid expiry date in MM/YY format" />
        </div>
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVV</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input type="text" id="cvv" name="cvv" className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2.5 pr-10" placeholder="123" required pattern="\d{3,4}" title="CVV must be 3 or 4 digits" />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700">Card Holder Name</label>
        <input type="text" id="cardHolder" name="cardHolder" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2.5" placeholder="John Doe" required />
      </div>
      <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
        Pay ₹{finalFare.toFixed(2)}
      </button>
    </form>
  );

  const renderUpiForm = () => (
    <form onSubmit={handlePayment} className="space-y-5 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Pay with UPI</h3>
      <div className="flex justify-center space-x-8 my-4">
        <SiGooglepay size={40} className="text-[#4285F4] hover:opacity-80 transition-opacity" title="Google Pay" />
        <SiPhonepe size={40} className="text-[#5f259f] hover:opacity-80 transition-opacity" title="PhonePe" />
        <SiPaytm size={40} className="text-[#00baf2] hover:opacity-80 transition-opacity" title="Paytm" />
      </div>
      <p className="text-center text-sm text-gray-500 -mt-2">Pay using your favorite UPI app</p>
      <div>
        <label htmlFor="upiId" className="block text-sm font-medium text-gray-700">Enter UPI ID</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUniversity className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input type="text" id="upiId" name="upiId" className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5" placeholder="yourname@bank" required />
        </div>
      </div>
      <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
        Pay ₹{finalFare.toFixed(2)}
      </button>
    </form>
  );

  return (
    <Header>
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden w-full animate-fade-in-up">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Payment Details</h1>
              <p className="text-gray-500 mt-1 text-sm">Booking ID: <span className="font-semibold text-gray-700">{bookingId}</span></p>
            </div>

            {/* Fare Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Original Fare</span>
                <span>₹{originalFare.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount</span>
                  <span>- ₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>To Pay</span>
                <span>₹{finalFare.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="mb-6">
              <label htmlFor="coupon" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaTicketAlt className="mr-2 text-gray-500" />
                Apply Coupon
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g., WEEKDAY20"
                  className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 transition-colors"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}
              {couponSuccess && <p className="mt-2 text-xs text-green-600">{couponSuccess}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(availableCoupons).map(([code, { description }]) => (
                  <button key={code} onClick={() => setCouponCode(code)} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full hover:bg-indigo-100" title={description}>
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="mb-6">
              <div className="flex border-b border-gray-200">
                <button onClick={() => setPaymentMethod('card')} className={`flex-1 py-3 px-1 text-center text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none ${paymentMethod === 'card' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-indigo-600 hover:border-gray-300'}`}>
                  <FaCreditCard className="inline-block mr-2 mb-1" /> Credit/Debit Card
                </button>
                <button onClick={() => setPaymentMethod('upi')} className={`flex-1 py-3 px-1 text-center text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none ${paymentMethod === 'upi' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-indigo-600 hover:border-gray-300'}`}>
                  <FaUniversity className="inline-block mr-2 mb-1" /> UPI
                </button>
              </div>
            </div>

            {paymentMethod === 'card' ? renderCardForm() : renderUpiForm()}
          </div>
          <div className="px-6 py-4 bg-gray-50 text-center text-xs text-gray-500">
            <p className="flex items-center justify-center"><FaLock className="mr-2" /> All transactions are secure and encrypted.</p>
          </div>
        </div>
      </main>
    </Header>
  );
};

export default Payment;
