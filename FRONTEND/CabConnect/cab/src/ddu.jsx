import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import routeData from "./data/routeData.json";
import cabImage2 from '../../assets/cab2.png';
import ECONOMY from '../../assets/ECONOMY.png';
import STANDARD from '../../assets/STANDARD.png';
import BUSINESS from '../../assets/BUSINESS.png';
import { FaMapMarkerAlt, FaChevronDown, FaCalendarAlt } from "react-icons/fa";
import "../../styles/booking.css"; // Import the dedicated CSS file.
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

//leaflet//left side
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;


const Booking = () => {
  //pick and drop and vehicle dropdown selection state
  const [start, setStart] = useState('');//f1
  const [end, setEnd] = useState('');//f1 

  const [vehicle, setVehicle] = useState(null);//f3

  //date state
  const [date, setDate] = useState('');//f2
  const [displayDate, setDisplayDate] = useState('Loading date...');//f2

  //handleCabs State
  const [fare, setFare] = useState(null);//f4
  const [eta, setEta] = useState(null);//f4
  const [pickupEtaMinutes, setPickupEtaMinutes] = useState(null);//f4
  const [distance, setDistance] = useState(null);//f4
  const [loading, setLoading] = useState(false);//f4
  const [formFilled, setFormFilled] = useState(false);//f4

  //error and inline message states
  const [errorMessage, setErrorMessage] = useState('');//f4
  const [inlineMessage, setInlineMessage] = useState({ type: null, content: null });//f4

  //dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  //for navigation purpose
  const navigate = useNavigate();

  //f3
  //drop downla irukara cars oda static data 
  const vehicles = [
    { id: 'economy', name: 'Economy', model: 'Maruti Ritz', numberPlate: 'TN 01 AB 1234', image: ECONOMY, rate: 12 },
    { id: 'standard', name: 'Standard', model: 'Maruti Ciaz', numberPlate: 'TN 02 CD 5678', image: STANDARD, rate: 15 },
    { id: 'luxury', name: 'Luxury', model: 'Maruti Zentra', numberPlate: 'TN 03 EF 9012', image: BUSINESS, rate: 20 },
  ];


//f4
//handling all calculations and all like distance and ETA
//first old data lam clear panra code...next form check pannum..endha form validation error uhm illana loader 3 seconds ku run aagum ...aprom run agum bodhu...route la reverse route uhm allow pannitu ..irukanu check pannum
//pinnadi cost find pannum-->distance * vechicle rate....Math.ceil vandhu value  round off panna use panrom
//trip time-->distance/speed*60-->**
//pickup time--random ah assign aagum
//arrival time -->cuurent local time + trip time
//aprom naamba ippo get panna values lam set panrom state la...

  const handleFindCabs = () => {
    setFare(null);
    setEta(null);
    setPickupEtaMinutes(null);
    setDistance(null);
    setFormFilled(false);
    setErrorMessage('');
    setInlineMessage({ type: null, content: null });

    //error and inline message setting happen here :
    
    if (!start || !end || !vehicle || !date) {
      setInlineMessage({
        type: 'error',
        content: (
          <>
            <p>Please select pickup, drop, vehicle type, and date.</p>
            <div className="inline-message-actions">
              <button className="inline-message-button inline-message-button-confirm" onClick={() => setInlineMessage({ type: null, content: null })}>OK</button>
            </div>
          </>
        )
      });
      return;
    }
    //
    if (start === end) {
      setErrorMessage('Pickup and drop locations cannot be the same.');
      return;
    }

    const avgSpeed = 30;
    setLoading(true);
     
     setTimeout(() => {
      const key1 = `${start.toLowerCase()}-${end.toLowerCase()}`;
      const key2 = `${end.toLowerCase()}-${start.toLowerCase()}`;
      const route = routeData[key1] || routeData[key2];

      if (!route) {
        setErrorMessage('Route not available. Please select a different route.');
      }
       else 
       {
        const cost = Math.ceil(route.distance * vehicle.rate);
        const tripDurationInMinutes = Math.ceil((route.distance / avgSpeed) * 60);
        const pickupTime = Math.floor(Math.random() * 6) + 5;
        //cuurent local time la irundhu ..random ah set panna pickup time ah add panni kudukara code
        //AM ah PM ah nu set panntu...24 hours ah 12 hours ah convert pannitu ...aporm minutes ah add panni sollum.
        const arrivalTimestamp = new Date();
        arrivalTimestamp.setMinutes(arrivalTimestamp.getMinutes() + tripDurationInMinutes + pickupTime);
        const ampm = arrivalTimestamp.getHours() >= 12 ? 'PM' : 'AM';
        const displayHours = (arrivalTimestamp.getHours() % 12) || 12;
        const minutes = arrivalTimestamp.getMinutes().toString().padStart(2, '0');
        const arrivalTime = `${displayHours.toString().padStart(2, '0')}:${minutes} ${ampm}`;

        setFare(`₹${cost}`);
        setEta(arrivalTime);
        setDistance(route.distance);
        setPickupEtaMinutes(pickupTime);
        setFormFilled(true);
        setErrorMessage('');
      }
      setLoading(false);
    }, 3000);
  };

//f5
//last ah book now button ah handle pannudhu if directly u gave without clicking findcabs
 const handleProceed = () => {
    if (loading || !formFilled || !fare || !vehicle || errorMessage) 
      {
      setInlineMessage({
        type: 'error',
        content: (
          <>
            <p>Cab details are not ready or the form is incomplete. Please find a cab first.</p>
            <div className="inline-message-actions">
              <button className="inline-message-button inline-message-button-confirm" onClick={() => setInlineMessage({ type: null, content: null })}>OK</button>
            </div>
          </>
        )
      });
      return;
     }
    //idhudha andha confirm details ah show panni naamba last ah booking ku munnadi verify pannikalam..
    //confimation content show pannum...yes book now kuduthal confirm booking pogum
    else
    {
    const confirmationContent = (
      <>
        <h3 className="confirmation-title">Confirm Your Booking</h3>
        <div className="confirmation-vehicle-header">
          <img src={vehicle.image} alt={vehicle.name} className="confirmation-vehicle-image" />
          <div>
            <p className="confirmation-vehicle-name">{vehicle.name}</p>
            <p className="confirmation-vehicle-model">{vehicle.model}</p>
          </div>
        </div>
        <div className="confirmation-route-info">
          <p><strong>From:</strong> {start}</p>
          <p><strong>To:</strong> {end}</p>
        </div>
        <div className="confirmation-summary">
          <div>
            <p className="summary-label">Distance</p>
            <p className="summary-value">{distance} km</p>
          </div>
          <div>
            <p className="summary-label">Reaching Time</p>
            <p className="summary-value eta">{eta}</p>
          </div>
          <div>
            <p className="summary-label">Fare</p>
            <p className="summary-value fare">{fare}</p>
          </div>
        </div>
        <div className="inline-message-actions">
            <button className="inline-message-button inline-message-button-secondary" onClick={() => setInlineMessage({ type: null, content: null })}>Cancel</button>
            <button className="inline-message-button inline-message-button-confirm" onClick={confirmBooking}>Yes, Book Now!</button>
        </div>
      </>
    );
    setInlineMessage({ type: 'confirm', content: confirmationContent });
  }
  };//


  //passing data from one page to another page// f6

  const confirmBooking = () => {
    //booked time calculate panranga...
   const bookingTimestamp = new Date();
    const bookedDate = bookingTimestamp.toISOString().split('T')[0];
    const ampm = bookingTimestamp.getHours() >= 12 ? 'PM' : 'AM';
    const displayHours = (bookingTimestamp.getHours() % 12) || 12;
    const minutes = bookingTimestamp.getMinutes().toString().padStart(2, '0');
    const bookedTime = `${displayHours.toString().padStart(2, '0')}:${minutes} ${ampm}`;

    // Generate a random booking ID
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const bookingId = `CBC${randomPart}`;

     //setting up inline message
    setInlineMessage({
      type: 'success',
      content: <p>Booking Confirmed! Your ride is on its way. <br/>Booking ID: <strong>{bookingId}</strong></p>
    });
    setTimeout(() => {
      navigate("/booking-confirm", {
        //all details uhm temporary ah memory la state object ah store aaidum da...
        //then navigate pannumpodhu...next page ku use location hook mooliyama andha data kidaikum...
        //we are passing data from one page to other page using state navigate..and in next page we are retreivig the data using uselocation
        state: {
          bookingId, pickup: start, drop: end, fare, distance, eta, pickupEtaMinutes,
          date: bookedDate,
          time: bookedTime,
          vehicleImage: vehicle.image, vehicle: vehicle.name, numberPlate: vehicle.numberPlate,
          cabName: vehicle.model, driverName: "Ramesh Kumar", driverPhone: "+91 98765 43210"
        }
      });
    }, 2000);
  };

   
  //f2
  //idhu drop down ku eludhi irukanga  

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //f2 :
  //current date eduthtu vara code ra 
  //new Date cuurent date ah kudukum 2025-08-15T10:15
  //T la split pannitu 
  //ISO-->UK
  //useeffect runs only once at the time of  component open
  useEffect(() => {
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setDisplayDate(now.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    }));
  }, []);

//routedata.json la pick and drop ah split panra code :
//first namba kiita neraya keys and value pair iruku routedata.json la ...
// "t. nagar-velachery": { "distance": 9.3 }"key":{values}
//ippo naamba drop down la show panradhukaga unique key value venum..so object.keys use panni ella keys ah yum get pannrom
//aprom map use panni oru oru key ah point panni pick thaniya edukurom...aprom drop thaniya edukuron...aprom pick and drop ah spread use panni merge panrrom but unique ah irukanum 
//so set array la store panrom

//f1 :
  const uniquePlaces = [  
      ...new Set([
      ...Object.keys(routeData).map(key => key.split('-')[0]),
      ...Object.keys(routeData).map(key => key.split('-')[1]),
    ]),
  ];


  return (

    //left side :

    <section id="booking-section" className="booking-section">
      <div className="booking-container">
        <div className="info-column">
          <h2 className="info-title-main">Best In City</h2>
          <h2 className="info-title-sub">TRUSTED CAB SERVICES IN CHENNAI</h2>
         
          <div className="image-map-grid">
            <div className="image-container">
              <img src={cabImage2} alt="cab" className="cab-image" />
            </div>
            <div className="map-container-wrapper">
              <MapContainer center={[13.0827, 80.2707]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[13.0827, 80.2707]}>
                  <Popup>CabConnect services available here!</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="booking-form-container">
          {
            inlineMessage.type === 'confirm' || inlineMessage.type === 'success' ? (
              <div className={`inline-message-container inline-message-${inlineMessage.type}`}>
                {inlineMessage.content}
              </div>

            ) : (   //right side // 1st step

              //f1 :
              <div className="booking-form-content">
                <div>
                  <label htmlFor="pickup" className="form-label">Pickup Location</label>
                  <div className="input-wrapper">
                    <FaMapMarkerAlt className="input-icon pickup" />
                    <select id="pickup" value={start} onChange={(e) => setStart(e.target.value)} className="select-input">
                      <option value="">Select Pickup</option>
                      {uniquePlaces.map((place, index) => <option key={index} value={place}>{place}</option>)}
                    </select>
                    <FaChevronDown className="select-arrow" />
                  </div>
                </div>

                <div>
                  <label htmlFor="drop" className="form-label">Drop Location</label>
                  <div className="input-wrapper">
                    <FaMapMarkerAlt className="input-icon drop" />
                    <select id="drop" value={end} onChange={(e) => setEnd(e.target.value)} className="select-input">
                      <option value="">Select Drop</option>
                      {uniquePlaces.map((place, index) => <option key={index} value={place}>{place}</option>)}
                    </select>
                    <FaChevronDown className="select-arrow" />
                  </div>
                </div>
              
                {/* f2 */}

                <div>
                  <label className="form-label">Booking Date</label>
                  <div className="input-wrapper">
                    <FaCalendarAlt className="input-icon date" />
                    <div className="date-display-wrapper">
                      <p className="date-display-text">{displayDate}</p>
                    </div>
                  </div>
                </div>
                
                {/* //f3 */}
                 {/* vehicle already choose aagi irundhal..display pannum illana drop down open panni ...vehicles array object la irukara data va list use panni show panrom...once andha list la irundhu nee edhadhu car ah click panna setVehicle aagidum */}
                <div className="vehicle-dropdown-container" ref={dropdownRef}>
                  <label htmlFor="vehicle" className="form-label">Vehicle Type</label>
                  <button type="button" id="vehicle" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="vehicle-select-button">
                    {vehicle ? (
                      <div className="vehicle-selected-container">
                        <img src={vehicle.image} alt={vehicle.name} className="vehicle-selected-image" />
                        <div>
                          <p className="vehicle-selected-name">{vehicle.name}</p>
                          <p className="vehicle-selected-model">{vehicle.model}</p>
                        </div>
                      </div>
                    ) 
                    :
                    (
                      <span className="vehicle-placeholder">Select Vehicle Type</span>
                    )}
                    <FaChevronDown className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
                  </button>

                  <div className={`dropdown-menu ${isDropdownOpen ? 'open' : 'closed'}`}>
                    <ul className="dropdown-list">
                      {vehicles.map((v) => (

                        //onclick pannale podhum setVechicle pannipan

                        <li key={v.id} onClick={() => { setVehicle(v); setIsDropdownOpen(false); }} className="dropdown-item">
                          <div className="dropdown-item-details">
                            <img src={v.image} alt={v.name} className="dropdown-item-image" />
                            <div>
                              <p className="dropdown-item-name">{v.name}</p>
                              <p className="dropdown-item-model">{v.model}</p>
                            </div>
                          </div>
                          <p className="dropdown-item-rate">₹{v.rate}/km</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>  
                <div className="button-container">  
                   

                   {/* //f4 */}
                  <button type="button" onClick={handleFindCabs} className="find-cabs-button">  
                    FIND CABS  
                  </button>  
                </div>
             
                
                {errorMessage && (
                  <div className="error-message">{errorMessage}</div>
                )}

                {inlineMessage.type && (
                  <div className={`inline-message-container inline-message-${inlineMessage.type}`}>
                    {inlineMessage.content}
                  </div>
                )}

                {loading && (  
                  <div className="loading-message">🔍 Finding available cabs...</div>  
                )}  
                
                {/* //result container */}
                
                {/* //f5 */} 

                {/* loading stop aagi endha error message uhm varalana result container show aagum.. */}
                {!loading && !errorMessage && fare && (
                  <div className="results-container">
                    <div className="results-header">
                      <div>
                        <p className="results-label">Fare</p>
                        <p className="results-value fare">{fare}</p>
                      </div>
                      <div>
                        <p className="results-label">Distance</p>
                        <p className="results-value distance">{distance} km</p>
                      </div>
                      <div>
                        <p className="results-label">Reaching Time</p>
                        <p className="results-value eta">{eta}</p>
                      </div>
                    </div>
                    {vehicle && (
                      <div className="results-cab-details">
                        <div className="results-cab-name-container">
                          <p className="results-cab-name">{vehicle.model}</p>
                          <div className="results-number-plate-container">
                            <span className="results-number-plate-prefix">IND</span>
                            <p className="results-number-plate">{vehicle.numberPlate}</p>
                          </div>
                        </div>
                        <div className="results-driver-details">
                          <div className="results-driver-info-group">
                            <p>👨‍✈️ Driver:</p>
                            <p className="results-driver-info-value">Ramesh Kumar</p>
                          </div>
                          <div className="results-driver-info-group">
                            <p>📞 Mobile:</p>
                            <p className="results-driver-info-value">+91 98765 43210</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}  

                {/* //f6 */}
                <div className="proceed-button-container">  
                  <button onClick={handleProceed} className="proceed-button">  
                    Proceed to Book  
                  </button>  
                </div>
              </div>
            )
          }
        </div>  
      </div>
    </section>
  );
};

export default Booking;