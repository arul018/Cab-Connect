import React from 'react';
import { FaTaxi, FaMapMarkerAlt, FaHeadset, FaShieldAlt } from "react-icons/fa";

const Features = () => {
  const featuresData = [
    {
      title: "Fast Booking",
      desc: "Book your cab instantly with just a few taps.",
      icon: <FaTaxi className="text-black text-4xl mb-4" />,
    },
    {
      title: "Real-Time Tracking",
      desc: "Track your ride live from pickup to destination.",
      icon: <FaMapMarkerAlt className="text-black text-4xl mb-4" />,
    },
    {
      title: "24/7 Support",
      desc: "Our support team is always ready to help you.",
      icon: <FaHeadset className="text-black text-4xl mb-4" />,
    },
    {
      title: "Safe & Secure",
      desc: "Verified drivers and safety protocols ensure secure rides.",
      icon: <FaShieldAlt className="text-black text-4xl mb-4" />,
    },
  ];

  return (
    <section
      className="p-10 text-black bg-cover bg-center flex flex-col items-center bg-yellow-400"
      style={{ backgroundImage: "url('/assets/images/features-bg.jpg')" }} // Update path as needed
    >
      <div className="text-center mb-10">
        <h2 className="text-xl text-gray-900">WE DO BEST</h2>
        <h3 className="text-3xl font-bold text-black">Than You Wish</h3>
      </div>

      <div className="grid md:grid-cols-4 gap-6 w-full max-w-6xl">
        {featuresData.map((item, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center">
            {item.icon}
            <h4 className="font-bold text-lg mb-2 text-black">{item.title}</h4>
            <p className="text-sm text-gray-800">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;