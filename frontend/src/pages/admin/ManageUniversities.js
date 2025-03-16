import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaUniversity, FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

const ManageUniversities = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useSelector(state => state.auth);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated and has super-admin role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/admin/universities',
          message: "Please log in to access the admin area."
        }
      });
      return;
    }

    if (user && user.role !== 'super-admin') {
      navigate('/admin', {
        state: {
          message: "You don't have permission to manage universities."
        }
      });
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch universities
  // Fetch universities
const fetchUniversities = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axios.get('/api/universities', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Fix: Handle different response formats to ensure universities is always an array
    if (Array.isArray(response.data)) {
      setUniversities(response.data);
    } 
    // Handle response format: { success: true, count: X, data: [...] }
    else if (response.data && Array.isArray(response.data.data)) {
      setUniversities(response.data.data);
    }
    // Common API pattern where data is wrapped in an object
    else if (response.data && Array.isArray(response.data.universities)) {
      setUniversities(response.data.universities);
    }
    // If data exists but not in expected format, treat as empty array
    else {
      console.error('Unexpected API response format:', response.data);
      setUniversities([]);
    }
    
    setLoading(false);
  } catch (err) {
    console.error('Error fetching universities:', err);
    setError(err.response?.data?.message || 'Failed to fetch universities');
    setLoading(false);
  }
};

  useEffect(() => {
    if (isAuthenticated && user?.role === 'super-admin') {
      fetchUniversities();
    }
  }, [isAuthenticated, user, token]);

  // Add university handler
  const handleAddUniversity = () => {
    navigate('/admin/universities/create');
  };

  // Edit university handler
  const handleEditUniversity = (universityId) => {
    navigate(`/admin/universities/${universityId}/edit`);
  };

  // Delete university handler
  const handleDeleteUniversity = async (universityId) => {
    if (!window.confirm('Are you sure you want to delete this university? This action cannot be undone and will delete all associated facilities and bookings.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/universities/${universityId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update the universities list
      setUniversities(universities.filter(university => university._id !== universityId));
      
      alert('University deleted successfully');
    } catch (err) {
      console.error('Error deleting university:', err);
      alert(err.response?.data?.message || 'Failed to delete university');
    }
  };

  // Toggle university status
  const handleToggleStatus = async (universityId, currentStatus) => {
    try {
      const response = await axios.patch(
        `/api/universities/${universityId}`,
        { isActive: !currentStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update the universities list with the updated university
      setUniversities(universities.map(university => 
        university._id === universityId ? { ...university, isActive: !currentStatus } : university
      ));
    } catch (err) {
      console.error('Error updating university status:', err);
      alert(err.response?.data?.message || 'Failed to update university status');
    }
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
        <h2 className="text-xl font-bold mb-2">Error Loading Universities</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchUniversities} 
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
        <h1 className="text-2xl font-bold">Manage Universities</h1>
        <button 
          className="btn-primary"
          onClick={handleAddUniversity}
        >
          <FaPlus className="mr-2" />
          Add University
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold">Universities List</h2>
        </div>
        {universities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No universities found. Create your first university by clicking the "Add University" button.
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
                    Location
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
                {universities.map(university => (
                  <tr key={university._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaUniversity className="text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {university.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {university.address.city}
                      </div>
                      <div className="text-sm text-gray-500">
                        {university.address.country}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(university._id, university.isActive)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          university.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {university.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-primary hover:text-primary-dark mr-3"
                        onClick={() => handleEditUniversity(university._id)}
                        title="Edit university"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteUniversity(university._id)}
                        title="Delete university"
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

export default ManageUniversities;