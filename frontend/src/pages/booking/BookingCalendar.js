import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import { toast } from 'react-toastify';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUniversity, 
  FaBuilding, 
  FaMoneyBillWave, 
  FaInfoCircle,
  FaArrowLeft
} from 'react-icons/fa';

const BookingCalendar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, token } = useSelector(state => state.auth);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: `/facilities/${id}/book`,
          message: "Please log in to book a facility."
        } 
      });
    }
  }, [isAuthenticated, navigate, id]);

  // Use pre-selected date and time if available from location state
  const initialState = location.state || {};
  
  const [facility, setFacility] = useState(null);
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    initialState.date ? new Date(initialState.date) : new Date()
  );
  const [startTime, setStartTime] = useState(initialState.startTime || '');
  const [endTime, setEndTime] = useState(initialState.endTime || '');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    date: initialState.date || format(new Date(), 'yyyy-MM-dd'),
    facilityName: initialState.facilityName || '',
    universityName: initialState.universityName || '',
    price: initialState.price || 0,
    currency: initialState.currency || 'USD',
    duration: 0,
    totalPrice: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacilityData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Configure authentication headers
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

        // Fetch facility data
        const facilityResponse = await axios.get(`/api/facilities/${id}`, config);
        const facilityData = facilityResponse.data;
        setFacility(facilityData);

        // Fetch university data associated with the facility
        const universityResponse = await axios.get(`/api/universities/${facilityData.university}`, config);
        const universityData = universityResponse.data;
        setUniversity(universityData);

        // Update booking details
        setBookingDetails(prev => ({
          ...prev,
          facilityName: facilityData.name,
          universityName: universityData.name,
          price: facilityData.pricePerHour,
          currency: facilityData.currency
        }));

        setLoading(false);
        
        // Fetch availability for the selected date
        fetchAvailability(id, format(selectedDate, 'yyyy-MM-dd'));
      } catch (error) {
        console.error('Error fetching facility data:', error);
        setError(error.response?.data?.message || 'Failed to load facility data');
        setLoading(false);
        toast.error('Failed to load facility data');
      }
    };

    if (isAuthenticated && token) {
      fetchFacilityData();
    }
  }, [id, token, isAuthenticated]);

  const fetchAvailability = async (facilityId, date) => {
    setLoadingSlots(true);
    try {
      // Configure authentication headers
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      // Fetch availability data from the API
      const response = await axios.get(`/api/facilities/${facilityId}/availability?date=${date}`, config);
      const availabilityData = response.data;
      
      setAvailableSlots(availabilityData.slots);
      
      // Pre-select time if passed in location state and available
      if (initialState.startTime && initialState.endTime) {
        const matchingSlot = availabilityData.slots.find(
          slot => slot.startTime === initialState.startTime && 
                 slot.endTime === initialState.endTime &&
                 slot.isAvailable
        );
        
        if (matchingSlot) {
          setStartTime(matchingSlot.startTime);
          setEndTime(matchingSlot.endTime);
          calculateTotalPrice(matchingSlot.startTime, matchingSlot.endTime);
        }
      }
      
      setLoadingSlots(false);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailableSlots([]);
      setLoadingSlots(false);
      toast.error('Failed to load availability data');
    }
  };

  // Calculate time difference in minutes
  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  };

  // Calculate total price based on duration
  const calculateTotalPrice = (start, end) => {
    if (!facility || !start || !end) return;
    
    const durationMinutes = calculateDuration(start, end);
    const durationHours = durationMinutes / 60;
    const totalPrice = facility.pricePerHour * durationHours;
    
    setBookingDetails(prev => ({
      ...prev,
      duration: durationMinutes,
      totalPrice
    }));
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setStartTime('');
    setEndTime('');
    setBookingDetails(prev => ({
      ...prev,
      date: format(date, 'yyyy-MM-dd'),
      duration: 0,
      totalPrice: 0
    }));
    
    if (facility) {
      fetchAvailability(facility._id, format(date, 'yyyy-MM-dd'));
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot) => {
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    calculateTotalPrice(slot.startTime, slot.endTime);
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    const currencySymbols = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    
    return `${amount.toFixed(2)} ${currencySymbols[currency] || currency}`;
  };

  // Handle booking submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startTime || !endTime || bookingDetails.duration === 0) {
      toast.error('Please select a time slot');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Configure authentication headers
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      // Create booking data
      const bookingData = {
        facility: id,
        date: bookingDetails.date,
        startTime,
        endTime,
        totalPrice: bookingDetails.totalPrice
      };

      // Create booking
      const response = await axios.post('/api/bookings', bookingData, config);
      const booking = response.data;

      // Navigate to payment
      navigate('/booking/payment', {
        state: {
          bookingId: booking._id,
          facilityId: id,
          universityId: university._id,
          date: bookingDetails.date,
          startTime,
          endTime,
          duration: bookingDetails.duration,
          totalPrice: bookingDetails.totalPrice,
          currency: bookingDetails.currency,
          facilityName: bookingDetails.facilityName,
          universityName: bookingDetails.universityName
        }
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 max-w-md">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Get day of week
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
  const operatingHours = facility?.operatingHours?.[dayOfWeek];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-primary"
        >
          <FaArrowLeft className="mr-1" />
          Back
        </button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Book a Facility</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Booking Details</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-start mb-4">
                <FaBuilding className="mt-1 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Facility</h3>
                  <p>{bookingDetails.facilityName}</p>
                </div>
              </div>
              <div className="flex items-start mb-4">
                <FaUniversity className="mt-1 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">University</h3>
                  <p>{bookingDetails.universityName}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaMoneyBillWave className="mt-1 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Price</h3>
                  <p>{formatCurrency(bookingDetails.price, bookingDetails.currency)} per hour</p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-start mb-4">
                <FaCalendarAlt className="mt-1 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Date</h3>
                  <p>{format(selectedDate, 'MMMM d, yyyy')}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {operatingHours && operatingHours.isOpen 
                      ? `Operating hours: ${operatingHours.open} - ${operatingHours.close}`
                      : 'Closed on this day'
                    }
                  </p>
                </div>
              </div>
              {startTime && endTime && (
                <div className="flex items-start mb-4">
                  <FaClock className="mt-1 mr-3 text-primary" />
                  <div>
                    <h3 className="font-medium">Time</h3>
                    <p>{startTime} - {endTime}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Duration: {Math.floor(bookingDetails.duration / 60)} hours {bookingDetails.duration % 60 > 0 ? `${bookingDetails.duration % 60} minutes` : ''}
                    </p>
                  </div>
                </div>
              )}
              {bookingDetails.totalPrice > 0 && (
                <div className="flex items-start">
                  <FaMoneyBillWave className="mt-1 mr-3 text-primary" />
                  <div>
                    <h3 className="font-medium">Total Price</h3>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(bookingDetails.totalPrice, bookingDetails.currency)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Date Selection */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-bold">Select Date</h2>
            </div>
            <div className="p-4">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                inline
                minDate={new Date()}
                maxDate={addDays(new Date(), 30)}
                dateFormat="yyyy-MM-dd"
              />
              
              <div className="mt-4 text-sm text-gray-500">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
                  <span>Unavailable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Time Slot Selection */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-bold">Select Time Slot</h2>
            </div>
            <div className="p-4">
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
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        className={`p-3 border rounded-md text-center ${
                          slot.isAvailable 
                            ? startTime === slot.startTime && endTime === slot.endTime
                              ? 'border-primary bg-primary text-white'
                              : 'border-green-200 bg-green-50 hover:bg-green-100 text-green-800'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!slot.isAvailable}
                        onClick={() => slot.isAvailable && handleTimeSlotSelect(slot)}
                      >
                        <div className="text-sm">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {startTime && endTime && (
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex">
              <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Booking Information</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Bookings can be made up to 30 days in advance</li>
                  <li>Payment is required at the time of booking</li>
                  <li>Cancellations made at least 24 hours prior to the booking time are eligible for a full refund</li>
                  <li>Please arrive 15 minutes before your booking time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;