import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaUniversity,
  FaBuilding
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [favoritesFacilities, setFavoritesFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get upcoming bookings (status: confirmed or pending, date >= today)
        const upcomingResponse = await axios.get('/api/bookings/user/upcoming');
        // Ensure we have an array
        const upcomingData = Array.isArray(upcomingResponse.data) ? upcomingResponse.data : [];
        
        // Get recent bookings (completed or cancelled, limited to last few)
        const recentResponse = await axios.get('/api/bookings/user/recent');
        // Ensure we have an array
        const recentData = Array.isArray(recentResponse.data) ? recentResponse.data : [];
        
        // Get favorite facilities
        // Note: You may need to implement this endpoint in your backend
        const favoritesResponse = await axios.get('/api/users/favorites');
        // Ensure we have an array
        const favoritesData = Array.isArray(favoritesResponse.data) ? favoritesResponse.data : [];
        
        // Process bookings data if needed (e.g., ensure nested objects exist)
        const processedUpcoming = upcomingData.map(booking => ({
          ...booking,
          facility: booking.facility || { 
            _id: booking.facilityId || '', 
            name: booking.facilityName || 'Unknown Facility',
            type: booking.facilityType || 'unknown',
            images: booking.facilityImages || []
          },
          university: booking.university || {
            _id: booking.universityId || '',
            name: booking.universityName || 'Unknown University'
          }
        }));
        
        const processedRecent = recentData.map(booking => ({
          ...booking,
          facility: booking.facility || { 
            _id: booking.facilityId || '', 
            name: booking.facilityName || 'Unknown Facility',
            type: booking.facilityType || 'unknown',
            images: booking.facilityImages || []
          },
          university: booking.university || {
            _id: booking.universityId || '',
            name: booking.universityName || 'Unknown University'
          }
        }));
        
        setUpcomingBookings(processedUpcoming);
        setRecentBookings(processedRecent);
        setFavoritesFacilities(favoritesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    if (user && user._id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Helper to get status badge styles
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="badge-success flex items-center">
            <FaCheckCircle className="mr-1" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="badge-warning flex items-center">
            <FaClock className="mr-1" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge-danger flex items-center">
            <FaExclamationCircle className="mr-1" />
            Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="badge flex items-center bg-gray-200 text-gray-800">
            <FaCheckCircle className="mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="badge flex items-center bg-gray-200 text-gray-800">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  // Helper to get facility type display name
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
    return typeMap[type] || type || 'Unknown Type';
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Date format error:', error);
      return dateString;
    }
  };

  return (
    <div className="container mx-auto">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName || 'User'}!</h1>
        <p className="text-gray-600">
          Here's an overview of your bookings and favorite facilities.
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Upcoming bookings */}
          <div className="xl:col-span-2">
            <div className="card h-full">
              <div className="card-header">
                <h2 className="text-xl font-bold flex items-center">
                  <FaCalendarAlt className="mr-2 text-primary" />
                  Upcoming Bookings
                </h2>
              </div>
              <div className="card-body">
                {!Array.isArray(upcomingBookings) || upcomingBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No upcoming bookings</p>
                    <Link to="/universities" className="btn-primary mt-4">
                      Book a Facility
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {upcomingBookings.map(booking => (
                      <div key={booking._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div className="flex items-start">
                            <div className="h-16 w-16 rounded bg-gray-200 mr-4 overflow-hidden flex-shrink-0">
                              {booking.facility && booking.facility.images && booking.facility.images.length > 0 ? (
                                <img
                                  src={booking.facility.images[0]}
                                  alt={booking.facility.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-300">
                                  <FaBuilding className="text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                <Link to={`/booking/${booking._id}`} className="hover:text-primary">
                                  {booking.facility?.name || 'Unknown Facility'}
                                </Link>
                              </h3>
                              <div className="text-sm text-gray-600 mb-1">
                                {getFacilityTypeName(booking.facility?.type)}
                              </div>
                              <div className="text-sm flex items-center text-gray-600">
                                <FaUniversity className="mr-1" />
                                {booking.university?.name || 'Unknown University'}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 flex flex-col items-end">
                            <div className="text-sm font-semibold mb-1">
                              {formatDate(booking.date)}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {booking.startTime || 'N/A'} - {booking.endTime || 'N/A'}
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Link to={`/booking/${booking._id}`} className="text-primary text-sm hover:text-primary-dark">
                            View details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {Array.isArray(upcomingBookings) && upcomingBookings.length > 0 && (
                  <div className="mt-4 text-center">
                    <Link to="/my-bookings" className="text-primary hover:text-primary-dark">
                      View all bookings →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* User information and quick links */}
          <div>
            <div className="card mb-8">
              <div className="card-header">
                <h2 className="text-xl font-bold flex items-center">
                  <FaUser className="mr-2 text-primary" />
                  Your Profile
                </h2>
              </div>
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200 mr-4 overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="User avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-300">
                        <FaUser className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {user?.firstName || ''} {user?.lastName || ''}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {user?.email || ''}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link 
                    to="/profile" 
                    className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
                  >
                    Edit Profile
                  </Link>
                  <Link 
                    to="/my-bookings" 
                    className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
                  >
                    My Bookings
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Favorite Facilities */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-bold flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-primary" />
                  Favorite Facilities
                </h2>
              </div>
              <div className="card-body">
                {!Array.isArray(favoritesFacilities) || favoritesFacilities.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No favorite facilities yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favoritesFacilities.map(facility => (
                      <div key={facility._id} className="flex items-center">
                        <div className="h-12 w-12 rounded bg-gray-200 mr-3 overflow-hidden">
                          {facility.images && facility.images.length > 0 ? (
                            <img
                              src={facility.images[0]}
                              alt={facility.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-300">
                              <FaBuilding className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">
                            <Link to={`/facilities/${facility._id}`} className="hover:text-primary">
                              {facility.name || 'Unknown Facility'}
                            </Link>
                          </h3>
                          <div className="text-xs text-gray-600">
                            {facility.university?.name || 'Unknown University'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-center">
                  <Link to="/facilities" className="text-primary hover:text-primary-dark">
                    Browse all facilities →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent bookings */}
      {!loading && Array.isArray(recentBookings) && recentBookings.length > 0 && (
        <div className="mt-8">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-bold flex items-center">
                <FaCalendarAlt className="mr-2 text-primary" />
                Recent Activity
              </h2>
            </div>
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Facility
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        University
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking Code
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map(booking => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/facilities/${booking.facility?._id || ''}`} className="font-medium text-primary hover:text-primary-dark">
                            {booking.facility?.name || 'Unknown Facility'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booking.university?.name || 'Unknown University'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{formatDate(booking.date)}</div>
                          <div className="text-sm text-gray-500">
                            {booking.startTime || 'N/A'} - {booking.endTime || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                            {booking.bookingCode || 'N/A'}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;