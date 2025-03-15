import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaUniversity,
  FaBuilding,
  FaList,
  FaClock,
  FaDollarSign,
  FaArrowLeft,
  FaCheck
} from 'react-icons/fa';

const FacilityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [facility, setFacility] = useState(null);
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availabilityDate, setAvailabilityDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchFacilityData = async () => {
      setLoading(true);
      try {
        const facilityResponse = await axios.get(`/api/facilities/${id}`);
        setFacility(facilityResponse.data);

        // Fetch university data based on the facility's university ID
        if (facilityResponse.data.university) {
          const universityResponse = await axios.get(`/api/universities/${facilityResponse.data.university}`);
          setUniversity(universityResponse.data);
        }
        
        setLoading(false);
        
        // Fetch initial availability for today
        fetchAvailability(id, availabilityDate);
      } catch (error) {
        console.error('Error fetching facility data:', error);
        setLoading(false);
      }
    };

    fetchFacilityData();
  }, [id]);

  const fetchAvailability = async (facilityId, date) => {
    setLoadingSlots(true);
    try {
      const response = await axios.get(`/api/facilities/${facilityId}/availability`, {
        params: { date: date }
      });
      
      setAvailableSlots(response.data);
      setLoadingSlots(false);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setAvailabilityDate(newDate);
    if (facility) {
      fetchAvailability(facility._id, newDate);
    }
  };

  const handleBookSlot = (slot) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { 
        state: { 
          from: `/facilities/${id}`,
          message: "Please log in to book this facility."
        } 
      });
      return;
    }
    
    // Navigate to booking page with slot information
    navigate(`/facilities/${id}/book`, {
      state: {
        date: availabilityDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        facilityName: facility?.name,
        universityName: university?.name,
        price: facility?.pricePerHour,
        currency: facility?.currency
      }
    });
  };

  // Helper function to get facility type display name
  const getFacilityTypeName = (type) => {
    const typeMap = {
      football_field: 'Football Field',
      basketball_court: 'Basketball Court',
      tennis_court: 'Tennis Court',
      swimming_pool: 'Swimming Pool',
      gym: 'Gym',
      track_field: 'Track & Field',
      volleyball_court: 'Volleyball Court',
      other: 'Other'
    };
    return typeMap[type] || type;
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    const currencySymbols = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    
    return `${amount} ${currencySymbols[currency] || currency}`;
  };

  // Get day of the week
  const getDayOfWeek = (dateString) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  // Format time to 12-hour format
  const formatTime = (time24) => {
    if (!time24 || !time24.includes(':')) return time24;
    const [hour, minute] = time24.split(':');
    const hourNum = parseInt(hour, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!facility || !university) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <FaBuilding className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-2 text-lg font-medium text-gray-900">Facility not found</h2>
              <p className="mt-1 text-sm text-gray-500">
                The facility you're looking for does not exist or has been removed.
              </p>
              <div className="mt-6">
                <Link
                  to="/facilities"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Back to Facilities
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get operating hours for the selected date
  const dayOfWeek = getDayOfWeek(availabilityDate);
  const operatingHours = facility.operatingHours?.[dayOfWeek];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        {/* Facility Images */}
        <div className="bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative h-64 sm:h-80 md:h-96">
              {facility.images && facility.images.length > 0 ? (
                <img
                  src={facility.images[0]}
                  alt={facility.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <FaBuilding className="text-white text-5xl" />
                </div>
              )}
              
              {/* Thumbnail navigation (if multiple images) */}
              {facility.images && facility.images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0">
                  <div className="flex justify-center space-x-2">
                    {facility.images.map((image, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-white' : 'bg-gray-400'}`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back to university link */}
          <div className="mb-6">
            <Link 
              to={`/universities/${university._id}`}
              className="inline-flex items-center text-sm text-gray-600 hover:text-primary"
            >
              <FaArrowLeft className="mr-1" />
              Back to {university.name}
            </Link>
          </div>
          
          {/* Facility Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold text-gray-900">{facility.name}</h1>
                  <span className="ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {getFacilityTypeName(facility.type)}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <FaUniversity className="mr-1" />
                  <span>{university.name}</span>
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <FaMapMarkerAlt className="mr-1" />
                  <span>
                    {facility.location?.building && `${facility.location.building}, `}
                    {facility.location?.floor && `Floor ${facility.location.floor}, `}
                    {facility.location?.roomNumber && `Room ${facility.location.roomNumber}, `}
                    {university.address?.city}, {university.address?.country}
                  </span>
                </div>
              </div>
              <div className="mt-5 sm:mt-0 flex flex-col sm:items-end">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(facility.pricePerHour, facility.currency)}
                </div>
                <div className="text-sm text-gray-500">per hour</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Facility Details */}
            <div className="lg:col-span-2">
              {/* Description */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <p className="text-gray-600">{facility.description}</p>
              </div>
              
              {/* Amenities */}
              {facility.amenities && facility.amenities.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h2 className="text-xl font-bold mb-4">Amenities</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {facility.amenities.map((amenity, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <FaCheck className="text-green-500 mr-2" />
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Operating Hours */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Operating Hours</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                    const hours = facility.operatingHours?.[day] || { isOpen: false };
                    const isToday = day === dayOfWeek;
                    
                    return (
                      <div 
                        key={day} 
                        className={`p-3 border rounded-md ${isToday ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium capitalize">
                            {day}
                            {isToday && <span className="ml-2 text-xs font-bold text-primary">(Today)</span>}
                          </div>
                          {hours.isOpen ? (
                            <div className="text-sm">
                              {formatTime(hours.open)} - {formatTime(hours.close)}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Closed</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Right Column - Booking and Information */}
            <div>
              {/* Quick Info */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Facility Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="mr-2 text-gray-400" />
                      Capacity
                    </div>
                    <div className="font-medium">{facility.capacity} people</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <FaDollarSign className="mr-2 text-gray-400" />
                      Price
                    </div>
                    <div className="font-medium">
                      {formatCurrency(facility.pricePerHour, facility.currency)} / hour
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <FaList className="mr-2 text-gray-400" />
                      Type
                    </div>
                    <div className="font-medium">{getFacilityTypeName(facility.type)}</div>
                  </div>
                </div>
              </div>
              
              {/* Availability Calendar */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Check Availability</h2>
                
                {/* Date Picker */}
                <div className="mb-6">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    className="form-input"
                    value={availabilityDate}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>
                
                {/* Time Slots */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Available Time Slots</h3>
                    <div className="text-xs text-gray-500">
                      {operatingHours && operatingHours.isOpen 
                        ? `${operatingHours.open} - ${operatingHours.close}`
                        : 'Closed on this day'
                      }
                    </div>
                  </div>
                  
                  {!operatingHours || !operatingHours.isOpen ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-md text-center">
                      This facility is closed on the selected date.
                    </div>
                  ) : loadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full"></div>
                      <p className="mt-2 text-gray-500">Loading availability...</p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md text-center">
                      No time slots available for the selected date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          className={`p-3 border rounded-md text-center ${
                            slot.isAvailable 
                              ? 'border-green-200 bg-green-50 hover:bg-green-100 text-green-800'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!slot.isAvailable}
                          onClick={() => slot.isAvailable && handleBookSlot(slot)}
                        >
                          <div className="text-sm">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {operatingHours && operatingHours.isOpen && availableSlots.length > 0 && (
                    <div className="mt-6">
                      <Link
                        to={`/facilities/${id}/book`}
                        className="btn-primary w-full justify-center"
                      >
                        <FaCalendarAlt className="mr-2" />
                        Book Now
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FacilityDetail;