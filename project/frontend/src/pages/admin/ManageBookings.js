import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaCalendarAlt, 
  FaPlus, 
  FaEye, 
  FaBan,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock
} from 'react-icons/fa';

const ManageBookings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/admin/bookings',
          message: "Please log in to access the admin area."
        }
      });
      return;
    }

    if (user && !['admin', 'super-admin'].includes(user.role)) {
      navigate('/admin', {
        state: {
          message: "You don't have permission to manage bookings."
        }
      });
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch bookings
  useEffect(() => {
    if (isAuthenticated && ['admin', 'super-admin'].includes(user?.role)) {
      // Mock data - in real app, this would be an API call
      setTimeout(() => {
        const mockBookings = [
          {
            _id: '1',
            facility: { name: 'Olympic Swimming Pool' },
            university: { name: 'Moscow State University' },
            user: { name: 'Ivan Petrov', email: 'ivan@example.com' },
            date: '2025-03-15',
            startTime: '14:00',
            endTime: '15:00',
            totalPrice: 3000,
            currency: 'RUB',
            status: 'confirmed',
            paymentStatus: 'paid',
            bookingCode: 'ABC123XY',
            createdAt: '2025-03-10T10:30:00Z'
          },
          {
            _id: '2',
            facility: { name: 'Tennis Court A' },
            university: { name: 'Moscow State University' },
            user: { name: 'Anna Ivanova', email: 'anna@example.com' },
            date: '2025-03-18',
            startTime: '10:00',
            endTime: '11:00',
            totalPrice: 1500,
            currency: 'RUB',
            status: 'pending',
            paymentStatus: 'unpaid',
            bookingCode: 'DEF456ZY',
            createdAt: '2025-03-14T16:45:00Z'
          },
          {
            _id: '3',
            facility: { name: 'Football Field' },
            university: { name: 'Saint Petersburg University' },
            user: { name: 'Sergei Kuznetsov', email: 'sergei@example.com' },
            date: '2025-03-13',
            startTime: '16:00',
            endTime: '18:00',
            totalPrice: 5000,
            currency: 'RUB',
            status: 'completed',
            paymentStatus: 'paid',
            bookingCode: 'GHI789AB',
            createdAt: '2025-03-08T09:20:00Z'
          }
        ];
        
        setBookings(mockBookings);
        setLoading(false);
      }, 1000);
    }
  }, [isAuthenticated, user]);

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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Paid
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Unpaid
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Bookings</h1>
        <button className="btn-primary">
          <FaPlus className="mr-2" />
          Create Booking
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold">Bookings List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map(booking => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <FaCalendarAlt className="text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.facility.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.university.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.user.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.date}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.startTime} - {booking.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      {getPaymentBadge(booking.paymentStatus)}
                      <span className="text-xs text-gray-500 mt-1">
                        {formatCurrency(booking.totalPrice, booking.currency)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-primary-dark mr-3">
                      <FaEye />
                    </button>
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button className="text-red-500 hover:text-red-700">
                        <FaBan />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> This is a placeholder component. In a real application, you would be able to view, create, update, and cancel bookings.
        </p>
      </div>
    </div>
  );
};

export default ManageBookings;