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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, these would be actual API calls
        // For demo purposes, we'll simulate with static data
        
        // Simulated delay
        setTimeout(() => {
          // Mock upcoming bookings
          setUpcomingBookings([
            {
              _id: '1',
              facility: { _id: '1', name: 'Tennis Court A', type: 'tennis_court', images: ['https://via.placeholder.com/150'] },
              university: { _id: '1', name: 'Moscow State University' },
              date: '2025-03-15T14:00:00Z',
              startTime: '14:00',
              endTime: '15:00',
              status: 'confirmed',
              bookingCode: 'ABCD1234'
            },
            {
              _id: '2',
              facility: { _id: '2', name: 'Basketball Court Main', type: 'basketball_court', images: ['https://via.placeholder.com/150'] },
              university: { _id: '1', name: 'Moscow State University' },
              date: '2025-03-18T10:00:00Z',
              startTime: '10:00',
              endTime: '11:30',
              status: 'pending',
              bookingCode: 'EFGH5678'
            }
          ]);
          
          // Mock recent bookings
          setRecentBookings([
            {
              _id: '3',
              facility: { _id: '3', name: 'Football Field', type: 'football_field', images: ['https://via.placeholder.com/150'] },
              university: { _id: '2', name: 'Saint Petersburg University' },
              date: '2025-03-10T16:00:00Z',
              startTime: '16:00',
              endTime: '18:00',
              status: 'completed',
              bookingCode: 'IJKL9012'
            }
          ]);
          
          // Mock favorite facilities
          setFavoritesFacilities([
            {
              _id: '1',
              name: 'Tennis Court A',
              type: 'tennis_court',
              images: ['https://via.placeholder.com/150'],
              university: { _id: '1', name: 'Moscow State University' }
            },
            {
              _id: '3',
              name: 'Football Field',
              type: 'football_field',
              images: ['https://via.placeholder.com/150'],
              university: { _id: '2', name: 'Saint Petersburg University' }
            }
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

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
            {status}
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
    return typeMap[type] || type;
  };

  // Helper to format date
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
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
                {upcomingBookings.length === 0 ? (
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
                              {booking.facility.images && booking.facility.images.length > 0 ? (
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
                                  {booking.facility.name}
                                </Link>
                              </h3>
                              <div className="text-sm text-gray-600 mb-1">
                                {getFacilityTypeName(booking.facility.type)}
                              </div>
                              <div className="text-sm flex items-center text-gray-600">
                                <FaUniversity className="mr-1" />
                                {booking.university.name}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 flex flex-col items-end">
                            <div className="text-sm font-semibold mb-1">
                              {formatDate(booking.date)}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {booking.startTime} - {booking.endTime}
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
                {upcomingBookings.length > 0 && (
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
                    <img
                      src="https://via.placeholder.com/150"
                      alt="User avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {user?.email}
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
                {favoritesFacilities.length === 0 ? (
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
                              {facility.name}
                            </Link>
                          </h3>
                          <div className="text-xs text-gray-600">
                            {facility.university.name}
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
      {!loading && recentBookings.length > 0 && (
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
                          <Link to={`/facilities/${booking.facility._id}`} className="font-medium text-primary hover:text-primary-dark">
                            {booking.facility.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booking.university.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{formatDate(booking.date)}</div>
                          <div className="text-sm text-gray-500">{booking.startTime} - {booking.endTime}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm">{booking.bookingCode}</code>
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