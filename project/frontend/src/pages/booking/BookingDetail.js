import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import {
  FaCalendarAlt,
  FaClock,
  FaUniversity,
  FaBuilding,
  FaQrcode,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock as FaPending,
  FaBan,
  FaMapMarkerAlt,
  FaPrint,
  FaDownload,
  FaArrowLeft
} from 'react-icons/fa';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  // Check if we have booking data from previous page
  const bookingDataFromLocation = location.state;
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: `/booking/${id}`,
          message: "Please log in to view your booking details."
        } 
      });
      return;
    }
    
    const fetchBookingData = async () => {
      try {
        // If we have booking data from location, use it
        if (bookingDataFromLocation) {
          setBooking(bookingDataFromLocation);
          setLoading(false);
          return;
        }
        
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate with static data
        setTimeout(() => {
          // Mock booking data
          const mockBooking = {
            _id: id,
            facilityId: "1",
            universityId: "1",
            facilityName: "Olympic Swimming Pool",
            universityName: "Moscow State University",
            date: "2025-03-15",
            startTime: "14:00",
            endTime: "15:00",
            duration: 60,
            totalPrice: 3000,
            currency: "RUB",
            status: "confirmed",
            paymentStatus: "paid",
            bookingCode: "XYZ123AB",
            createdAt: "2025-03-10T10:30:00Z"
          };
          
          setBooking(mockBooking);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching booking data:', error);
        setLoading(false);
      }
    };
    
    fetchBookingData();
  }, [id, isAuthenticated, navigate, bookingDataFromLocation]);

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

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <FaPending className="mr-1" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <FaBan className="mr-1" />
            Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <FaCheckCircle className="mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Get payment status badge
  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            Paid
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <FaExclamationCircle className="mr-1" />
            Unpaid
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <FaMoneyBillWave className="mr-1" />
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      // In a real app, this would be an API call
      // For demo purposes, we'll just update the local state
      setBooking({
        ...booking,
        status: 'cancelled'
      });
    }
  };

  // Generate QR code data
  const getQRCodeData = () => {
    if (!booking) return '';
    
    const data = {
      bookingId: booking._id,
      facilityId: booking.facilityId,
      universityId: booking.universityId,
      bookingCode: booking.bookingCode,
      date: booking.date,
      time: `${booking.startTime}-${booking.endTime}`
    };
    
    return JSON.stringify(data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FaExclamationCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="text-2xl font-bold mt-4 mb-2">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">The booking you're looking for does not exist or has been removed.</p>
          <Link to="/my-bookings" className="btn-primary inline-flex">
            <FaArrowLeft className="mr-2" />
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to="/my-bookings"
          className="inline-flex items-center text-sm text-gray-600 hover:text-primary"
        >
          <FaArrowLeft className="mr-1" />
          Back to My Bookings
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Booking Details</h1>
            <p className="text-sm text-gray-500">
              Booking Code: <span className="font-mono font-bold">{booking.bookingCode}</span>
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            {getStatusBadge(booking.status)}
            {getPaymentBadge(booking.paymentStatus)}
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-start mb-6">
                <FaBuilding className="mt-1 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Facility</h3>
                  <p>{booking.facilityName}</p>
                </div>
              </div>
              <div className="flex items-start mb-6">
                <FaUniversity className="mt-1 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">University</h3>
                  <p>{booking.universityName}</p>
                </div>
              </div>
              <div className="flex items-start mb-6">
                <FaMapMarkerAlt className="mt-1 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <Link to={`/universities/${booking.universityId}`} className="text-primary hover:text-primary-dark">
                    {booking.universityName}
                  </Link>
                </div>
              </div>
              <div className="flex items-start mb-6">
                <FaCalendarAlt className="mt-1 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Date</h3>
                  <p>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-start mb-6">
                <FaClock className="mt-1 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Time</h3>
                  <p>{booking.startTime} - {booking.endTime}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Duration: {Math.floor(booking.duration / 60)} hours
                    {booking.duration % 60 > 0 ? ` ${booking.duration % 60} minutes` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <FaMoneyBillWave className="mt-1 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Payment</h3>
                  <p className="font-bold">
                    {formatCurrency(booking.totalPrice, booking.currency)}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              {/* QR Code Section */}
              <div className="bg-gray-50 border rounded-lg p-4 mb-6 text-center">
                <div className="mb-4">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-primary-light hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <FaQrcode className="mr-2" />
                    {showQR ? 'Hide QR Code' : 'Show QR Code'}
                  </button>
                </div>
                
                {showQR && (
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-lg">
                      <QRCode value={getQRCodeData()} size={180} />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Present this QR code at the facility to verify your booking
                    </p>
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>Booking Code: <span className="font-mono font-bold">{booking.bookingCode}</span></p>
                </div>
              </div>
              
              {/* Actions Section */}
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-4">Booking Actions</h3>
                
                <div className="space-y-3">
                  {/* Only show cancel button if booking is not already cancelled or completed */}
                  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <button
                      onClick={handleCancelBooking}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaBan className="mr-2" />
                      Cancel Booking
                    </button>
                  )}
                  
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <FaPrint className="mr-2" />
                    Print Receipt
                  </button>
                  
                  <Link
                    to={`/facilities/${booking.facilityId}`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <FaBuilding className="mr-2" />
                    View Facility
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-6">
            <h3 className="font-medium mb-2">Important Information</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Please arrive 15 minutes before your booking time.</li>
              <li>Bring your QR code or booking code for check-in.</li>
              <li>Cancellations made at least 24 hours prior to the booking time are eligible for a full refund.</li>
              <li>For any questions or changes, please contact the university sports department.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;