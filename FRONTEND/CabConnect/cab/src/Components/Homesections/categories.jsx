import React, { useState } from 'react';
import ECONOMY from '../../assets/ECONOMY.png';
import STANDARD from '../../assets/STANDARD.png';
import BUSINESS from '../../assets/BUSINESS.png';
const Categories = () => {
  const [expandedCab, setExpandedCab] = useState(null);

  const handleReadMoreToggle = (cabType) => {
    setExpandedCab(prev => (prev === cabType ? null : cabType));
  };

  return (
    <section className="p-10 text-center text-black bg-white">
      <h2 className="text-3xl font-bold mb-10 text-gray-900">Choose Your Ride</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            type: "Economy",
            image: ECONOMY,
            price: "₹10/km",
            description: "Perfect for solo trips and quick rides across the city. Compact, efficient, and easy on your wallet."
          },
          {
            type: "Standard",
            image: STANDARD,
            price: "₹15/km",
            description: "The ideal choice for comfortable family rides or business trips. Offers more space and a smoother ride."
          },
          {
            type: "Business",
            image: BUSINESS,
            price: "₹20/km",
            description: "Travel in style and luxury. Our premium sedans come with top-of-the-line features for an executive experience."
          },
        ].map((cab) => (
          <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300" key={cab.type}>
            <div className="w-full aspect-[11/7] mb-4 overflow-hidden rounded">
              <img
                src={cab.image}
                alt={`${cab.type} Cab`}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{cab.type} Class</h3>
            <p className="text-gray-600">{cab.price}</p>
            <button onClick={() => handleReadMoreToggle(cab.type)} className="mt-2 text-yellow-600 font-semibold hover:underline">
              {expandedCab === cab.type ? 'Read Less' : 'Read More'}
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedCab === cab.type ? 'max-h-40 opacity-100 pt-4' : 'max-h-0 opacity-0'
                }`}
            >
              <p className="text-sm text-gray-600 text-left">
                {cab.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;