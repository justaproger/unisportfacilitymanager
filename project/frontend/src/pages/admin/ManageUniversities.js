import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaUniversity, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const ManageUniversities = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

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
  useEffect(() => {
    if (isAuthenticated && user?.role === 'super-admin') {
      // Mock data - in real app, this would be an API call
      setTimeout(() => {
        const mockUniversities = [
          {
            _id: '1',
            name: 'Moscow State University',
            address: {
              city: 'Moscow',
              country: 'Russia'
            },
            isActive: true
          },
          {
            _id: '2',
            name: 'Saint Petersburg University',
            address: {
              city: 'Saint Petersburg',
              country: 'Russia'
            },
            isActive: true
          },
          {
            _id: '3',
            name: 'Kazan Federal University',
            address: {
              city: 'Kazan',
              country: 'Russia'
            },
            isActive: true
          }
        ];
        
        setUniversities(mockUniversities);
        setLoading(false);
      }, 1000);
    }
  }, [isAuthenticated, user]);

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
        <h1 className="text-2xl font-bold">Manage Universities</h1>
        <button className="btn-primary">
          <FaPlus className="mr-2" />
          Add University
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold">Universities List</h2>
        </div>
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      university.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {university.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-primary-dark mr-3">
                      <FaEdit />
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> This is a placeholder component. In a real application, you would be able to add, edit, and delete universities.
        </p>
      </div>
    </div>
  );
};

export default ManageUniversities;