import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaUniversity, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

const ManageFacilities = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useSelector(state => state.auth);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/admin/facilities',
          message: "Please log in to access the admin area."
        }
      });
      return;
    }

    if (user && !['admin', 'super-admin'].includes(user.role)) {
      navigate('/admin', {
        state: {
          message: "You don't have permission to manage facilities."
        }
      });
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch facilities
  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/facilities', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if response.data is an array
      if (Array.isArray(response.data)) {
        setFacilities(response.data);
      } else if (response.data && Array.isArray(response.data.facilities)) {
        // Maybe the data is nested in a 'facilities' property
        setFacilities(response.data.facilities);
      } else {
        // If not an array, set an empty array and log the error
        console.error('Expected array but got:', response.data);
        setFacilities([]);
        setError('Invalid data format received from server');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError(err.response?.data?.message || 'Failed to fetch facilities');
      setFacilities([]);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated && ['admin', 'super-admin'].includes(user?.role)) {
      fetchFacilities();
    }
  }, [isAuthenticated, user, token]);

  // Add facility handler
  const handleAddFacility = () => {
    navigate('/admin/facilities/create');
  };

  // Edit facility handler
  const handleEditFacility = (facilityId) => {
    navigate(`/admin/facilities/${facilityId}/edit`);
  };

  // Delete facility handler
  const handleDeleteFacility = async (facilityId) => {
    if (!window.confirm('Are you sure you want to delete this facility? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/facilities/${facilityId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update the facilities list
      setFacilities(facilities.filter(facility => facility._id !== facilityId));
      
      alert('Facility deleted successfully');
    } catch (err) {
      console.error('Error deleting facility:', err);
      alert(err.response?.data?.message || 'Failed to delete facility');
    }
  };

  // Toggle facility status
  const handleToggleStatus = async (facilityId, currentStatus) => {
    try {
      const response = await axios.patch(
        `/api/facilities/${facilityId}`,
        { isActive: !currentStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update the facilities list with the updated facility
      setFacilities(facilities.map(facility => 
        facility._id === facilityId ? { ...facility, isActive: !currentStatus } : facility
      ));
    } catch (err) {
      console.error('Error updating facility status:', err);
      alert(err.response?.data?.message || 'Failed to update facility status');
    }
  };

  // Helper function to get facility type display name
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">
          <FaExclamationTriangle className="text-5xl" />
        </div>
        <h2 className="text-xl font-bold mb-2">Error Loading Facilities</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchFacilities} 
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Facilities</h1>
        <button 
          className="btn-primary"
          onClick={handleAddFacility}
        >
          <FaPlus className="mr-2" />
          Add Facility
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold">Facilities List</h2>
        </div>
        {!facilities || facilities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No facilities found. Create your first facility by clicking the "Add Facility" button.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {facilities.map(facility => (
                  <tr key={facility._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaBuilding className="text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {facility.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getFacilityTypeName(facility.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUniversity className="text-gray-500 mr-2" />
                        <div className="text-sm text-gray-900">
                          {facility.university?.name || 'Unknown University'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(facility.pricePerHour, facility.currency)} / hour
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleToggleStatus(facility._id, facility.isActive)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          facility.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {facility.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-primary hover:text-primary-dark mr-3"
                        onClick={() => handleEditFacility(facility._id)}
                        title="Edit facility"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteFacility(facility._id)}
                        title="Delete facility"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageFacilities;