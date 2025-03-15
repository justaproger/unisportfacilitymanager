import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaBuilding, 
  FaUsers, 
  FaMoneyBillWave, 
  FaChartBar,
  FaQrcode,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBan,
  FaClock
} from 'react-icons/fa';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/admin',
          message: "Please log in to access the admin dashboard."
        }
      });
      return;
    }

    if (user && !['admin', 'super-admin'].includes(user.role)) {
      navigate('/dashboard', {
        state: {
          message: "You don't have permission to access the admin dashboard."
        }
      });
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate with static data
        setTimeout(() => {
          // Mock dashboard data
          const mockData = {
            stats: {
              totalBookings: 527,
              pendingBookings: 24,
              completedBookings: 478,
              cancelledBookings: 25,
              totalUsers: 356,
              totalRevenue: 782500,
              currency: 'RUB'
            },
            recentBookings: [
              {
                _id: '1',
                facilityName: 'Olympic Swimming Pool',
                universityName: 'Moscow State University',
                userName: 'Ivan Petrov',
                date: '2025-03-15',
                startTime: '14:00',
                endTime: '15:00',
                status: 'confirmed',
                totalPrice: 3000,
                currency: 'RUB'
              },
              {
                _id: '2',
                facilityName: 'Tennis Court A',
                universityName: 'Moscow State University',
                userName: 'Anna Ivanova',
                date: '2025-03-14',
                startTime: '10:00',
                endTime: '11:00',
                status: 'pending',
                totalPrice: 1500,
                currency: 'RUB'
              },
              {
                _id: '3',
                facilityName: 'Football Field',
                universityName: 'Moscow State University',
                userName: 'Sergei Kuznetsov',
                date: '2025-03-13',
                startTime: '16:00',
                endTime: '18:00',
                status: 'completed',
                totalPrice: 5000,
                currency: 'RUB'
              },
              {
                _id: '4',
                facilityName: 'Basketball Court',
                universityName: 'Moscow State University',
                userName: 'Elena Smirnova',
                date: '2025-03-12',
                startTime: '18:00',
                endTime: '19:00',
                status: 'cancelled',
                totalPrice: 1200,
                currency: 'RUB'
              }
            ],
            popularFacilities: [
              { name: 'Football Field', bookings: 156 },
              { name: 'Tennis Court A', bookings: 124 },
              { name: 'Olympic Swimming Pool', bookings: 98 },
              { name: 'Basketball Court', bookings: 92 },
              { name: 'University Gym', bookings: 57 }
            ],
            bookingsByStatus: {
              confirmed: 125,
              pending: 24,
              completed: 478,
              cancelled: 25
            },
            revenueData: {
              daily: {
                labels: ['Mar 9', 'Mar 10', 'Mar 11', 'Mar 12', 'Mar 13', 'Mar 14', 'Mar 15'],
                data: [12500, 15000, 9800, 14300, 18200, 16700, 15000]
              },
              weekly: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                data: [58700, 74500, 81200, 68100]
              },
              monthly: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                data: [124000, 146700, 152000, 163500, 184300, 172000]
              }
            },
            bookingsData: {
              daily: {
                labels: ['Mar 9', 'Mar 10', 'Mar 11', 'Mar 12', 'Mar 13', 'Mar 14', 'Mar 15'],
                data: [18, 22, 15, 24, 28, 25, 21]
              },
              weekly: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                data: [87, 104, 118, 92]
              },
              monthly: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                data: [267, 312, 351, 384, 402, 378]
              }
            }
          };
          
          setDashboardData(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    if (isAuthenticated && ['admin', 'super-admin'].includes(user?.role)) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  // Format currency
  const formatCurrency = (amount, currency) => {
    const currencySymbols = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    
    return `${amount.toLocaleString()} ${currencySymbols[currency] || currency}`;
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
            {status}
          </span>
        );
    }
  };

  // Chart data for revenue
  const revenueChartData = {
    labels: dashboardData?.revenueData[selectedPeriod]?.labels || [],
    datasets: [
      {
        label: 'Revenue',
        data: dashboardData?.revenueData[selectedPeriod]?.data || [],
        fill: true,
        backgroundColor: 'rgba(34, 139, 230, 0.2)',
        borderColor: 'rgba(34, 139, 230, 1)',
        tension: 0.4
      }
    ]
  };

  // Chart data for bookings
  const bookingsChartData = {
    labels: dashboardData?.bookingsData[selectedPeriod]?.labels || [],
    datasets: [
      {
        label: 'Bookings',
        data: dashboardData?.bookingsData[selectedPeriod]?.data || [],
        backgroundColor: 'rgba(46, 204, 113, 0.7)',
        borderWidth: 0,
        borderRadius: 4
      }
    ]
  };

  // Chart data for bookings by status
  const statusChartData = {
    labels: ['Confirmed', 'Pending', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: dashboardData ? [
          dashboardData.bookingsByStatus.confirmed,
          dashboardData.bookingsByStatus.pending,
          dashboardData.bookingsByStatus.completed,
          dashboardData.bookingsByStatus.cancelled
        ] : [],
        backgroundColor: [
          'rgba(46, 204, 113, 0.7)',
          'rgba(241, 196, 15, 0.7)',
          'rgba(52, 152, 219, 0.7)',
          'rgba(231, 76, 60, 0.7)'
        ],
        borderWidth: 0
      }
    ]
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div>
          <Link to="/admin/scanner" className="btn-primary inline-flex items-center">
            <FaQrcode className="mr-2" />
            QR Scanner
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaCalendarAlt className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Bookings</h2>
              <p className="text-2xl font-bold">{dashboardData.stats.totalBookings}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-gray-500">Pending: {dashboardData.stats.pendingBookings}</span>
            <span className="text-green-500">Completed: {dashboardData.stats.completedBookings}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <FaMoneyBillWave className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Revenue</h2>
              <p className="text-2xl font-bold">
                {formatCurrency(dashboardData.stats.totalRevenue, dashboardData.stats.currency)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/statistics" className="text-primary text-sm">
              View detailed analytics →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaUsers className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Users</h2>
              <p className="text-2xl font-bold">{dashboardData.stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/users" className="text-primary text-sm">
              Manage users →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaBuilding className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Popular Facilities</h2>
              <p className="text-2xl font-bold">{dashboardData.popularFacilities.length}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/facilities" className="text-primary text-sm">
              Manage facilities →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-bold">Revenue Overview</h2>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1 text-xs rounded ${
                  selectedPeriod === 'daily' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedPeriod('daily')}
              >
                Daily
              </button>
              <button 
                className={`px-3 py-1 text-xs rounded ${
                  selectedPeriod === 'weekly' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedPeriod('weekly')}
              >
                Weekly
              </button>
              <button 
                className={`px-3 py-1 text-xs rounded ${
                  selectedPeriod === 'monthly' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedPeriod('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="h-64">
              <Line 
                data={revenueChartData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return value.toLocaleString() + ' ₽';
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Bookings Chart */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold">Bookings Overview</h2>
          </div>
          <div className="p-4">
            <div className="h-64">
              <Bar 
                data={bookingsChartData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 5
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold">Recent Bookings</h2>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentBookings.map(booking => (
                  <tr key={booking._id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.facilityName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.universityName}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.userName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.date}</div>
                      <div className="text-xs text-gray-500">
                        {booking.startTime} - {booking.endTime}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(booking.totalPrice, booking.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-center">
              <Link to="/admin/bookings" className="text-primary text-sm">
                View all bookings →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold">Booking Status Distribution</h2>
          </div>
          <div className="p-4">
            <div className="h-64 flex justify-center">
              <Pie 
                data={statusChartData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-green-50 rounded-md">
                <h3 className="text-sm font-medium text-green-800">Confirmed</h3>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.bookingsByStatus.confirmed}
                </p>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded-md">
                <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardData.bookingsByStatus.pending}
                </p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-md">
                <h3 className="text-sm font-medium text-blue-800">Completed</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData.bookingsByStatus.completed}
                </p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-md">
                <h3 className="text-sm font-medium text-red-800">Cancelled</h3>
                <p className="text-2xl font-bold text-red-600">
                  {dashboardData.bookingsByStatus.cancelled}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alerts and Notifications */}
      {dashboardData.stats.pendingBookings > 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">Pending Bookings Require Attention</p>
              <p className="text-sm text-yellow-700 mt-1">
                There are {dashboardData.stats.pendingBookings} bookings pending confirmation. Please review and process them promptly.
              </p>
              <div className="mt-3">
                <Link
                  to="/admin/bookings?status=pending"
                  className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                >
                  Review pending bookings →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;