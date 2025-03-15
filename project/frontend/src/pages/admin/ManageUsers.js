import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaUser, 
  FaPlus, 
  FaEdit, 
  FaTrash,
  FaUniversity,
  FaUsersCog
} from 'react-icons/fa';

const ManageUsers = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/admin/users',
          message: "Please log in to access the admin area."
        }
      });
      return;
    }

    if (user && !['admin', 'super-admin'].includes(user.role)) {
      navigate('/admin', {
        state: {
          message: "You don't have permission to manage users."
        }
      });
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch users
  useEffect(() => {
    if (isAuthenticated && ['admin', 'super-admin'].includes(user?.role)) {
      // Mock data - in real app, this would be an API call
      setTimeout(() => {
        const mockUsers = [
          {
            _id: '1',
            firstName: 'Ivan',
            lastName: 'Petrov',
            email: 'ivan@example.com',
            role: 'user',
            university: { 
              _id: '1', 
              name: 'Moscow State University' 
            },
            isActive: true
          },
          {
            _id: '2',
            firstName: 'Anna',
            lastName: 'Ivanova',
            email: 'anna@example.com',
            role: 'user',
            university: { 
              _id: '1', 
              name: 'Moscow State University' 
            },
            isActive: true
          },
          {
            _id: '3',
            firstName: 'Sergei',
            lastName: 'Kuznetsov',
            email: 'sergei@example.com',
            role: 'admin',
            university: { 
              _id: '2', 
              name: 'Saint Petersburg University' 
            },
            isActive: true
          },
          {
            _id: '4',
            firstName: 'Elena',
            lastName: 'Smirnova',
            email: 'elena@example.com',
            role: 'user',
            university: { 
              _id: '3', 
              name: 'Kazan Federal University' 
            },
            isActive: false
          }
        ];
        
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    }
  }, [isAuthenticated, user]);

  // Get role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <FaUsersCog className="mr-1" />
            Admin
          </span>
        );
      case 'super-admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaUsersCog className="mr-1" />
            Super Admin
          </span>
        );
      case 'user':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FaUser className="mr-1" />
            User
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {role}
          </span>
        );
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <button className="btn-primary">
          <FaPlus className="mr-2" />
          Add User
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold">Users List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University
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
              {users.map(u => (
                <tr key={u._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {u.firstName} {u.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(u.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.university ? (
                      <div className="flex items-center text-sm text-gray-900">
                        <FaUniversity className="text-gray-500 mr-2" />
                        {u.university.name}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {u.isActive ? 'Active' : 'Inactive'}
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
          <strong>Note:</strong> This is a placeholder component. In a real application, you would be able to add, edit, and delete users, as well as manage their roles and permissions.
        </p>
      </div>
    </div>
  );
};

export default ManageUsers;