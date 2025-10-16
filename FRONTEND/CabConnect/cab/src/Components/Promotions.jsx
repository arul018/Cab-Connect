import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTags, FaPlaneDeparture, FaMoon, FaCopy, FaCheck } from 'react-icons/fa';

const offers = [
  {
    id: 1,
    icon: <FaTags className="w-8 h-8 text-yellow-500" />,
    title: 'FLAT 20% OFF',
    description: 'On your next 3 rides this week. Max discount ₹50.',
    code: 'WEEKDAY20',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    darkBgColor: 'dark:bg-gray-800',
  },
  {
    id: 2,
    icon: <FaPlaneDeparture className="w-8 h-8 text-blue-500" />,
    title: 'AIRPORT SPECIAL',
    description: 'Get ₹100 off on all rides to and from the airport.',
    code: 'FLYHIGH',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    darkBgColor: 'dark:bg-gray-800',
  },
  {
    id: 3,
    icon: <FaMoon className="w-8 h-8 text-indigo-500" />,
    title: 'NIGHT RIDER',
    description: 'Enjoy 15% off on all rides between 10 PM and 5 AM.',
    code: 'NIGHTOWL',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    darkBgColor: 'dark:bg-gray-800',
  },
];

const OfferCard = ({ offer, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(offer.code);
    setCopied(true);
  };

  // Reset the copied state after a delay
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className={`relative ${offer.bgColor} ${offer.darkBgColor} border ${offer.borderColor} dark:border-gray-700 rounded-xl p-6 flex items-start space-x-6 overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}>
      <div className="flex-shrink-0 p-2 bg-white/60 dark:bg-gray-700/50 rounded-full">{offer.icon}</div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{offer.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{offer.description}</p>
        <div className="mt-4">
          <button
            onClick={handleCopy}
            disabled={copied}
            className={`inline-flex items-center justify-center px-4 py-2 border border-dashed rounded-lg text-sm font-medium transition-all duration-300 w-36 ${
              copied
                ? 'bg-green-500 text-white border-green-500 cursor-not-allowed'
                : 'border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {copied ? (
              <>
                <FaCheck className="mr-2" />
                Copied!
              </>
            ) : (
              <>
                <span className="mr-2 font-mono tracking-wider">{offer.code}</span>
                <FaCopy />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Promotions = () => {
  const navigate = useNavigate();

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // The visual feedback is now in the OfferCard, so the alert is not needed.
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex items-center mb-8">
          <button onClick={() => navigate('/', { state: { openSidebar: true } })} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-300 font-medium">
            <FaArrowLeft className="mr-2" /> Back to Home
          </button>
        </header>
        <main>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Promotions & Offers</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">Your exclusive deals for more savings on rides.</p>
          </div>
          <div className="space-y-6">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} onCopy={copyToClipboard} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Promotions;