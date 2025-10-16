import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaPhone, FaChevronDown, FaHeadset } from 'react-icons/fa';

// A reusable accordion item component for the FAQs
const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left p-5 font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none transition-colors duration-300"
      >
        <span className="flex-1">{title}</span>
        <FaChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-yellow-500' : 'text-gray-400'}`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="p-5 pt-0 text-gray-600">
          {children}
        </div>
      </div>
    </div>
  );
};

const Support = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How do I book a ride?",
      answer: "You can book a ride from the homepage. Select your pickup and drop locations, choose a vehicle type, and click 'Find Cabs'. Once you see the fare details, click 'Proceed to Book' and confirm your ride."
    },
    {
      question: "Can I cancel a booking?",
      answer: "Yes, you can cancel a booking from your 'Ride History' page. Please note that cancellation charges may apply depending on the timing of the cancellation."
    },
    {
      question: "How is the fare calculated?",
      answer: "The fare is calculated based on the distance between your pickup and drop locations and the per-kilometer rate of the vehicle type you have chosen. Any tolls or surcharges will be mentioned in the final bill."
    },
    {
      question: "What if I have an issue with my ride or driver?",
      answer: "We are sorry to hear that. Please contact our support team immediately using the phone number or email provided on this page. Provide your Booking ID for a faster resolution."
    }
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/', { state: { openSidebar: true } })}
            className="flex items-center text-gray-600 hover:text-black transition-colors duration-300 font-medium"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-yellow-400 p-8 text-center">
            <FaHeadset className="mx-auto text-5xl text-black mb-4" />
            <h1 className="text-4xl font-bold text-gray-900">Help & Support</h1>
            <p className="text-gray-800 mt-2">We're here to help you with any questions or issues.</p>
          </div>

          <div className="p-6 sm:p-10">
            {/* FAQs Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Frequently Asked Questions</h2>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} title={faq.question}>
                    <p>{faq.answer}</p>
                  </AccordionItem>
                ))}
              </div>
            </div>

            {/* Contact Us Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Still Need Help?</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Phone Card */}
                <div className="group bg-gray-50 p-6 rounded-lg flex items-start space-x-4 transition-all duration-300 hover:shadow-lg hover:bg-white border border-transparent hover:border-gray-200">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FaPhone className="text-yellow-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Call Us</h3>
                    <p className="text-gray-600 mt-1">For immediate assistance with your ride.</p>
                    <a href="tel:+9118001234567" className="text-blue-600 font-semibold mt-2 inline-block hover:underline">+91 1800 123 4567</a>
                  </div>
                </div>
                {/* Email Card */}
                <div className="group bg-gray-50 p-6 rounded-lg flex items-start space-x-4 transition-all duration-300 hover:shadow-lg hover:bg-white border border-transparent hover:border-gray-200">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaEnvelope className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Email Us</h3>
                    <p className="text-gray-600 mt-1">For non-urgent inquiries and feedback.</p>
                    <a href="mailto:support@cabconnect.com" className="text-blue-600 font-semibold mt-2 inline-block hover:underline">support@cabconnect.com</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;