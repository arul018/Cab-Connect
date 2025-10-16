import React from 'react';

const Download = () => {
  return (
    <section className="p-10 text-center text-black bg-gray-100">
      <h2 className="text-2xl text-yellow-400">DOWNLOAD</h2>
      <h3 className="text-3xl font-bold mb-6 text-gray-900">GET THE BEST CAB SERVICE</h3>
      <p>Download the Cab voucher app free! Get Exciting New Offers</p>
      <div className="flex flex-col md:flex-row justify-center gap-4 mt-4">
        <img
          src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
          alt="App Store"
          className="h-12"
        />
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
          alt="Google Play"
          className="h-12"
        />
      </div>
    </section>
  );
};

export default Download;