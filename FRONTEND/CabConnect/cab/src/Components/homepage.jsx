 // Homepage.js
import React from "react";
import Header from "../Components/Header.jsx";
import Landing from "./Homesections/landing.jsx";
import Booking from "./Homesections/booking.jsx";
import Features from "./features.jsx";
import Download from "./Homesections/download.jsx";
import Review from "./Homesections/review.jsx";
import Contact from "./Homesections/contact.jsx";
import Footer from "./footer.jsx";



const Homepage = () => {

  return (
    <Header>
      <div className="font-roboto text-gray-800">
        <Landing />
        <Booking />
        
        <Features />
        <Download />
        <Review />
        <Contact />
        <Footer />
      </div>
    </Header>
  );
};
 
export default Homepage;
