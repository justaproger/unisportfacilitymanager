import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { format } from 'date-fns';
import {
  FaCalendarCheck,
  FaBuilding,
  FaUniversity,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaQrcode,
  FaInfoCircle
} from 'react-icons/fa';

const UserBookings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: '/my-bookings',
          message: "Please log in to view your bookings."
        } 
      });
    }
  }, [isAuthenticated, navigate]);

  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        // Fetch user bookings from the API
        const response = await axios.get('/api/bookings/user');
        
        // Fetch facility and university details for each booking if they aren't populated
        const bookingsWithDetails = await Promise.all(
          response.data.map(async (booking) => {
            try {
              // If university name is not included, fetch it
              let universityName = booking.universityName;
              let facilityName = booking.facilityName;
              
              if (!universityName && booking.universityId) {
                const universityResponse = await axios.get(`/api/universities/${booking.universityId}`);
                universityName = universityResponse.data.name;
              }
              
              if (!facilityName && booking.facilityId) {
                const facilityResponse = await axios.get(`/api/facilities/${booking.facilityId}`);
                facilityName = facilityResponse.data.name;
              }
              
              return {
                ...booking,
                universityName: universityName || 'Unknown University',
                facilityName: facilityName || 'Unknown Facility'
              };
            } catch (error) {
              console.error(`Error fetching details for booking ${booking._id}:`, error);
              return {
                ...booking,
                universityName: booking.universityName || 'Unknown University',
                facilityName: booking.facilityName || 'Unknown Facility'
              };
            }
          })
        );
        
        setBookings(bookingsWithDetails);
        setFilteredBookings(bookingsWithDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  // Apply filters and sorting when search term, status filter, or sort order changes
  useEffect(() => {
    if (bookings.length === 0) return;
    
    let results = [...bookings];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(booking => 
        (booking.facilityName && booking.facilityName.toLowerCase().includes(term)) || 
        (booking.universityName && booking.universityName.toLowerCase().includes(term)) ||
        (booking.bookingCode && booking.bookingCode.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      results = results.filter(booking => booking.status === statusFilter);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredBookings(results);
  }, [searchTerm, statusFilter, sortOrder, bookings]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    const currencySymbols = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    
    // Handle case where amount might not be a number
    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    
    return `${numericAmount.toFixed(2)} ${currencySymbols[currency] || currency}`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="mr-1" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaBan className="mr-1" />
            Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FaCheckCircle className="mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  // Check if booking is upcoming
  const isUpcoming = (dateString) => {
    if (!dateString) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bookingDate = new Date(dateString);
    bookingDate.setHours(0, 0, 0, 0);
    
    return bookingDate >= today;
  };

  // View booking details
  const viewBookingDetails = (bookingId) => {
    navigate(`/booking/${bookingId}`);
  };

  // Format date with fallback
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <Link to="/universities" className="btn-primary mt-4 sm:mt-0">
          Book a Facility
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="form-input pl-10"
                placeholder="Search by facility, university..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Status filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* Reset filters */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <FaFilter className="mr-2" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex justify-between">
          <h2 className="font-bold">Booking History</h2>
          <button
            type="button"
            onClick={toggleSortOrder}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            {sortOrder === 'desc' ? (
              <>
                <FaSortAmountDown className="mr-1" /> Newest First
              </>
            ) : (
              <>
                <FaSortAmountUp className="mr-1" /> Oldest First
              </>
            )}
          </button>
        </div>
        
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center">
            <FaCalendarCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any bookings{statusFilter ? ` with status "${statusFilter}"` : ''}.
            </p>
            {(searchTerm || statusFilter) && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Reset Filters
              </button>
            )}
            <div className="mt-6">
              <Link
                to="/universities"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Book a Facility
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Code
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map(booking => (
                  <tr 
                    key={booking._id}
                    className={`hover:bg-gray-50 ${
                      isUpcoming(booking.date) && booking.status === 'confirmed'
                        ? 'bg-blue-50'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaBuilding className="text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.facilityName || 'Unknown Facility'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.universityName || 'Unknown University'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.startTime || 'N/A'} - {booking.endTime || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(booking.totalPrice, booking.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-mono">{booking.bookingCode || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => viewBookingDetails(booking._id)}
                        className="text-primary hover:text-primary-dark"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {filteredBookings.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Booking Information</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Upcoming bookings are highlighted in blue</li>
                <li>Cancellations made at least 24 hours prior to the booking time are eligible for a full refund</li>
                <li>You can view your booking QR code by clicking on "View" and then showing it at the facility</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookings;