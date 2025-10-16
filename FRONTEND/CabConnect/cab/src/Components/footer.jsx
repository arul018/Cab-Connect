import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <>
      {/* Footer Section */}
      <footer className="bg-black text-white px-10 py-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 text-sm">

          {/* About Section */}
          <div>
            <h3 className="font-bold mb-4 text-lg">ABOUT Cab Connect</h3>
            <p className="mb-4">
              Cab Connect offers fast, safe, and affordable cab services anytime, anywhere.
              Our drivers are verified and available 24/7 to get you where you need to go.
            </p>
            {/* Social Media Icons */}
            <div className="flex gap-4 text-yellow-400 text-xl">
              <FaFacebookF />
              <FaTwitter />
              <FaInstagram />
              <FaLinkedinIn />
            </div>
          </div>

          {/* Download Section */}
          <div className="text-center">
            <h3 className="font-bold mb-4 text-lg">DOWNLOAD</h3>
            <p className="mb-2">Android User</p>
            <p>iOS User</p>
          </div>

          {/* Contact Section */}
          <div className="text-center md:text-left">
            <h3 className="font-bold mb-4 text-lg">CONTACT</h3>
            <p className="mb-2">45B, Green Avenue, Chennai, India</p>
            <p className="mb-2">+91 98765 43210</p>
            <p className="mb-2">contact@cabhub.com</p>
            <p>www.cabhub.com</p>
          </div>
        </div>
      </footer>

      {/* Bottom Bar */}
      <div className="bg-black text-center text-gray-500 text-xs py-4">
        © 2025 Cab Connect. All rights reserved.
      </div>
    </>
  );
};

export default Footer;