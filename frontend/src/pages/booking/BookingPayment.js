import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaCalendarAlt,
  FaClock,
  FaUniversity,
  FaBuilding,
  FaCreditCard,
  FaLock,
  FaMoneyBillWave,
  FaCheck,
  FaArrowLeft,
  FaExclamationCircle
} from 'react-icons/fa';

const BookingPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, token } = useSelector(state => state.auth);
  
  // Check if we have booking data from previous page
  const bookingData = location.state;
  
  // Form state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [paymentError, setPaymentError] = useState(null);

  // If no booking data, redirect to booking page
  useEffect(() => {
    if (!bookingData) {
      toast.error('No booking information found');
      navigate('/facilities');
      return;
    }
    
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/booking/payment',
          message: 'Please log in to complete your booking'
        }
      });
    }
  }, [bookingData, navigate, isAuthenticated]);

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

  // Format card number with spaces
  const formatCardNumber = (value) => {
    if (!value) return value;
    
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Handle card number input with formatting
  const handleCardNumberChange = (e) => {
    const value = e.target.value;
    const formattedValue = formatCardNumber(value);
    setCardNumber(formattedValue.substring(0, 19)); // Limit to 16 digits + 3 spaces
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!cardName.trim()) {
      newErrors.cardName = 'Name on card is required';
    }
    
    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Card number should be 16 digits';
    }
    
    if (!expiryMonth) {
      newErrors.expiryMonth = 'Required';
    }
    
    if (!expiryYear) {
      newErrors.expiryYear = 'Required';
    }
    
    if (!cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (cvv.length !== 3) {
      newErrors.cvv = 'CVV should be 3 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Configure authentication headers
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      // Create payment data object
      const paymentData = {
        bookingId: bookingData.bookingId,
        cardName,
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryMonth,
        expiryYear,
        cvv,
        amount: bookingData.totalPrice,
        currency: bookingData.currency
      };

      // Send payment request to API
      const response = await axios.post('/api/payments', paymentData, config);
      
      // Update booking with payment details
      const bookingResponse = await axios.patch(
        `/api/bookings/${bookingData.bookingId}/confirm-payment`,
        { paymentId: response.data._id },
        config
      );
      
      // Get updated booking details
      setBookingId(bookingResponse.data._id);
      setBookingCode(bookingResponse.data.bookingCode);
      setPaymentSuccess(true);
      
      toast.success('Payment successful!');
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentError(error.response?.data?.message || 'Failed to process payment');
      toast.error(error.response?.data?.message || 'Failed to process payment');
      setIsProcessing(false);
    }
  };

  // Handle viewing booking details after successful payment
  const viewBooking = () => {
    navigate(`/booking/${bookingId}`, {
      state: {
        ...bookingData,
        _id: bookingId,
        bookingCode,
        status: 'confirmed',
        paymentStatus: 'paid'
      }
    });
  };

  if (!bookingData) {
    return null;
  }

  // If payment was successful, show success message
  if (paymentSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-green-50 border-b border-green-100 flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <FaCheck className="text-green-500 text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-800">Payment Successful!</h1>
              <p className="text-green-600">Your booking has been confirmed.</p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Booking Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-start mb-4">
                    <FaBuilding className="mt-1 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium">Facility</h3>
                      <p>{bookingData.facilityName}</p>
                    </div>
                  </div>
                  <div className="flex items-start mb-4">
                    <FaUniversity className="mt-1 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium">University</h3>
                      <p>{bookingData.universityName}</p>
                    </div>
                  </div>
                  <div className="flex items-start mb-4">
                    <FaCalendarAlt className="mt-1 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium">Date</h3>
                      <p>{format(new Date(bookingData.date), 'MMMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-start mb-4">
                    <FaClock className="mt-1 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium">Time</h3>
                      <p>{bookingData.startTime} - {bookingData.endTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start mb-4">
                    <FaMoneyBillWave className="mt-1 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium">Total Amount</h3>
                      <p>{formatCurrency(bookingData.totalPrice, bookingData.currency)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaCreditCard className="mt-1 mr-3 text-primary" />
                    <div>
                      <h3 className="font-medium">Booking Code</h3>
                      <p className="font-mono font-bold">{bookingCode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                type="button"
                className="btn-primary"
                onClick={viewBooking}
              >
                View Booking Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-primary"
        >
          <FaArrowLeft className="mr-1" />
          Back to Booking
        </button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Payment</h1>
      
      {paymentError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaExclamationCircle className="text-red-500 mr-2" />
            <span className="text-red-800">{paymentError}</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Payment Details</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    className={`form-input ${errors.cardName ? 'border-red-500' : ''}`}
                    placeholder="John Smith"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                  {errors.cardName && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <div className={`relative rounded-md shadow-sm ${errors.cardNumber ? 'border-red-500' : ''}`}>
                    <input
                      type="text"
                      id="cardNumber"
                      className={`form-input ${errors.cardNumber ? 'border-red-500' : ''}`}
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                      <FaCreditCard />
                    </div>
                  </div>
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                  )}
                </div>
                
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <select
                          id="expiryMonth"
                          className={`form-select ${errors.expiryMonth ? 'border-red-500' : ''}`}
                          value={expiryMonth}
                          onChange={(e) => setExpiryMonth(e.target.value)}
                        >
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                            <option key={month} value={month.toString().padStart(2, '0')}>
                              {month.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        {errors.expiryMonth && (
                          <p className="mt-1 text-sm text-red-600">{errors.expiryMonth}</p>
                        )}
                      </div>
                      <div>
                        <select
                          id="expiryYear"
                          className={`form-select ${errors.expiryYear ? 'border-red-500' : ''}`}
                          value={expiryYear}
                          onChange={(e) => setExpiryYear(e.target.value)}
                        >
                          <option value="">YY</option>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                            <option key={year} value={year.toString().slice(-2)}>
                              {year.toString().slice(-2)}
                            </option>
                          ))}
                        </select>
                        {errors.expiryYear && (
                          <p className="mt-1 text-sm text-red-600">{errors.expiryYear}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      className={`form-input ${errors.cvv ? 'border-red-500' : ''}`}
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                      maxLength={3}
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-6 flex items-center justify-between">
                  <div className="flex items-center text-green-700">
                    <FaLock className="mr-2" />
                    <span className="text-sm">Your payment info is secure</span>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      `Pay ${formatCurrency(bookingData.totalPrice, bookingData.currency)}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex">
              <FaLock className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Secure Payment</p>
                <p>For testing purposes, you can use any valid-looking credit card information. No actual payment will be processed.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-bold">Order Summary</h2>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-start mb-3">
                  <FaBuilding className="mt-1 mr-2 text-gray-500" />
                  <div>
                    <h3 className="font-medium">{bookingData.facilityName}</h3>
                    <p className="text-sm text-gray-500">{bookingData.universityName}</p>
                  </div>
                </div>
                <div className="flex items-center mb-2 text-sm">
                  <FaCalendarAlt className="mr-2 text-gray-500" />
                  <span>{format(new Date(bookingData.date), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center text-sm">
                  <FaClock className="mr-2 text-gray-500" />
                  <span>{bookingData.startTime} - {bookingData.endTime}</span>
                </div>
              </div>
              
              <div className="border-t border-dashed pt-4 mt-4">
                <div className="flex justify-between mb-2 text-sm">
                  <span>Duration</span>
                  <span>
                    {Math.floor(bookingData.duration / 60)} hours
                    {bookingData.duration % 60 > 0 ? ` ${bookingData.duration % 60} min` : ''}
                  </span>
                </div>
                <div className="flex justify-between mb-4 text-sm">
                  <span>Price per hour</span>
                  <span>{formatCurrency(bookingData.price, bookingData.currency)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatCurrency(bookingData.totalPrice, bookingData.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPayment;