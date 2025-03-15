import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaBuilding
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
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

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

  // Fetch statistics
  useEffect(() => {
    if (isAuthenticated && ['admin', 'super-admin'].includes(user?.role)) {
      // Mock data - in real app, this would be an API call
      setTimeout(() => {
        const mockStats = {
          summary: {
            totalBookings: 527,
            totalRevenue: 782500,
            totalUsers: 356,
            totalFacilities: 24,
            averageBookingsPerDay: 17.5,
            averageRevenuePerBooking: 1485,
            currency: 'RUB'
          },
          bookingsByStatus: {
            confirmed: 125,
            pending: 24,
            completed: 478,
            cancelled: 25
          },
          bookingsByFacilityType: {
            football_field: 156,
            tennis_court: 124,
            swimming_pool: 98,
            basketball_court: 92,
            gym: 57
          },
          revenueData: {
            week: {
              labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
              data: [15000, 12500, 18200, 14300, 16700, 22000, 18900]
            },
            month: {
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              data: [58700, 74500, 81200, 68100]
            },
            year: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              data: [124000, 146700, 152000, 163500, 184300, 172000, 155000, 147000, 168000, 182000, 174000, 158000]
            }
          },
          bookingsData: {
            week: {
              labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
              data: [18, 22, 15, 24, 28, 35, 21]
            },
            month: {
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              data: [87, 104, 118, 92]
            },
            year: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              data: [267, 312, 351, 384, 402, 378, 345, 332, 367, 389, 356, 319]
            }
          },
          popularFacilities: [
            { name: 'Football Field', bookings: 156 },
            { name: 'Tennis Court A', bookings: 124 },
            { name: 'Olympic Swimming Pool', bookings: 98 },
            { name: 'Basketball Court', bookings: 92 },
            { name: 'University Gym', bookings: 57 }
          ]
        };
        
        setStats(mockStats);
        setLoading(false);
      }, 1000);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Statistics & Analytics</h1>
      
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
      
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> This is a placeholder component with mock data. In a real application, you would see actual statistics and analytics based on your booking data.
        </p>
      </div>
    </div>
  );
};

export default Statistics;