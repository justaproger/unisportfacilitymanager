import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaBuilding,
  FaUniversity
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

const Statistics = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('all');

  const isSuperAdmin = user?.role === 'super-admin';

  // Currency symbols for formatting
  const currencySymbols = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  
  // Format currency
  const formatCurrency = (amount, currency) => {
    return `${amount.toLocaleString()} ${currencySymbols[currency] || currency}`;
  };

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/admin/statistics',
          message: "Please log in to access the admin area."
        }
      });
      return;
    }

    if (user && !['admin', 'super-admin'].includes(user.role)) {
      navigate('/admin', {
        state: {
          message: "You don't have permission to view statistics."
        }
      });
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch universities for super-admin
  useEffect(() => {
    const fetchUniversities = async () => {
      if (isAuthenticated && user?.role === 'super-admin') {
        try {
          const config = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          };
          
          const response = await axios.get('/api/universities', config);
          setUniversities(response.data);
        } catch (err) {
          console.error('Error fetching universities:', err);
          toast.error('Failed to load universities');
        }
      }
    };

    fetchUniversities();
  }, [isAuthenticated, user, token]);

  // For admin users, set their university as selected
  useEffect(() => {
    if (user?.role === 'admin' && user?.university) {
      setSelectedUniversity(user.university);
    }
  }, [user]);

  // Fetch statistics from API
  useEffect(() => {
    const fetchStatistics = async () => {
      if (isAuthenticated && ['admin', 'super-admin'].includes(user?.role)) {
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

          // Construct API endpoint with appropriate query parameters
          let endpoint = '/api/statistics';
          
          // For admin users, we always filter by their university
          if (user.role === 'admin') {
            endpoint += `?university=${user.university}`;
          } 
          // For super-admin users, we filter by selected university if not 'all'
          else if (selectedUniversity !== 'all') {
            endpoint += `?university=${selectedUniversity}`;
          }
          
          // Add date range as a query parameter
          endpoint += (endpoint.includes('?') ? '&' : '?') + `dateRange=${dateRange}`;
          
          // Fetch statistics data from the backend
          const response = await axios.get(endpoint, config);
          
          setStats(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching statistics:', err);
          setError(err.response?.data?.message || 'Failed to load statistics data');
          setLoading(false);
          toast.error('Failed to load statistics data');
        }
      }
    };

    fetchStatistics();
  }, [isAuthenticated, user, token, dateRange, selectedUniversity]);

  // Chart data for revenue
  const revenueChartData = {
    labels: stats?.revenueData[dateRange]?.labels || [],
    datasets: [
      {
        label: 'Revenue',
        data: stats?.revenueData[dateRange]?.data || [],
        fill: true,
        backgroundColor: 'rgba(34, 139, 230, 0.2)',
        borderColor: 'rgba(34, 139, 230, 1)',
        tension: 0.4
      }
    ]
  };

  // Chart data for bookings
  const bookingsChartData = {
    labels: stats?.bookingsData[dateRange]?.labels || [],
    datasets: [
      {
        label: 'Bookings',
        data: stats?.bookingsData[dateRange]?.data || [],
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
        data: stats ? [
          stats.bookingsByStatus.confirmed,
          stats.bookingsByStatus.pending,
          stats.bookingsByStatus.completed,
          stats.bookingsByStatus.cancelled
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

  // Chart data for bookings by facility type
  const facilityTypeChartData = {
    labels: stats ? Object.keys(stats.bookingsByFacilityType).map(type => {
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
    }) : [],
    datasets: [
      {
        data: stats ? Object.values(stats.bookingsByFacilityType) : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
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

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative max-w-md">
          <strong className="font-bold">No data available!</strong>
          <span className="block sm:inline"> Could not load statistics data at this time.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Statistics & Analytics</h1>
        
        {/* University Selection for Super Admin */}
        {isSuperAdmin && (
          <div className="mt-4 md:mt-0 flex items-center">
            <FaUniversity className="text-gray-500 mr-2" />
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Universities</option>
              {universities.map(uni => (
                <option key={uni._id} value={uni._id}>{uni.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaCalendarAlt className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Bookings</h2>
              <p className="text-2xl font-bold">{stats.summary.totalBookings}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Avg. {stats.summary.averageBookingsPerDay} bookings per day
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
                {formatCurrency(stats.summary.totalRevenue, stats.summary.currency)}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Avg. {formatCurrency(stats.summary.averageRevenuePerBooking, stats.summary.currency)} per booking
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaUsers className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Users</h2>
              <p className="text-2xl font-bold">{stats.summary.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaBuilding className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm">Total Facilities</h2>
              <p className="text-2xl font-bold">{stats.summary.totalFacilities}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-bold flex items-center">
              <FaChartLine className="mr-2 text-primary" />
              Revenue Over Time
            </h2>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1 text-xs rounded ${
                  dateRange === 'week' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setDateRange('week')}
              >
                Week
              </button>
              <button 
                className={`px-3 py-1 text-xs rounded ${
                  dateRange === 'month' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setDateRange('month')}
              >
                Month
              </button>
              <button 
                className={`px-3 py-1 text-xs rounded ${
                  dateRange === 'year' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setDateRange('year')}
              >
                Year
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
                          return value.toLocaleString() + ' ' + (stats.summary.currency ? currencySymbols[stats.summary.currency] || stats.summary.currency : '');
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
            <h2 className="font-bold flex items-center">
              <FaChartBar className="mr-2 text-primary" />
              Bookings Over Time
            </h2>
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
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold flex items-center">
              <FaChartPie className="mr-2 text-primary" />
              Booking Status Distribution
            </h2>
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
          </div>
        </div>
        
        {/* Facility Type Distribution */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold flex items-center">
              <FaChartPie className="mr-2 text-primary" />
              Bookings by Facility Type
            </h2>
          </div>
          <div className="p-4">
            <div className="h-64 flex justify-center">
              <Pie 
                data={facilityTypeChartData} 
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
          </div>
        </div>
      </div>
      
      {/* Popular Facilities */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold flex items-center">
            <FaBuilding className="mr-2 text-primary" />
            Most Popular Facilities
          </h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Bookings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.popularFacilities.map((facility, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {facility.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {facility.bookings}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;