import React from 'react';
import city from '../../assets/city.jpg';
import { FaSearch } from 'react-icons/fa';

const Landing = () => {
  return (
    <section className="relative bg-gray-900 text-white">
      {/* Blurred Background Layer */}
      <div
        style={{
          backgroundImage: `url(${city})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'blur(3px)',
        }}
        className="absolute inset-0 z-0 opacity-40"
      ></div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 text-center py-12">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-5xl md:text-5xl [text-shadow:_2px_2px_8px_rgb(0_0_0_/_50%)]">
            Your Journey, Your Way
          </h1>
          <p className="mt-4 text-lg md:text-xl text-yellow-300 font-medium [text-shadow:_1px_1px_4px_rgb(0_0_0_/_50%)]">
            Reliable rides at the tap of a button.
          </p>
        </div>

        {/* Elegant Call to Action */}
        <div className="mt-16 w-full max-w-2xl">
          <a
            href="#booking-section"
            className="group flex items-center justify-between w-full bg-white/90 backdrop-blur-md p-4 rounded-full shadow-2xl hover:bg-white transition-all duration-300"
          >
            <span className="pl-4 text-lg text-gray-500 font-medium group-hover:text-gray-800">Where to?</span>
            <span className="bg-yellow-400 p-3 rounded-full shadow-lg group-hover:bg-yellow-500 transition-all">
              <FaSearch className="text-black" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Landing;