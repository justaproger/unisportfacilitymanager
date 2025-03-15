import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  FaUser, 
  FaPlus, 
  FaEdit, 
  FaTrash,
  FaUniversity,
  FaUsersCog,
  FaExclamationTriangle
} from 'react-icons/fa';

const ManageUsers = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useSelector(state => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/users', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Fix: Handle different response formats to ensure users is always an array
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } 
      // Common API pattern where data is wrapped in an object
      else if (response.data && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      }
      // If data exists but not in expected format, treat as empty array
      else {
        console.error('Unexpected API response format:', response.data);
        setUsers([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && ['admin', 'super-admin'].includes(user?.role)) {
      fetchUsers();
    }
  }, [isAuthenticated, user, token]);

  // Add user handler
  const handleAddUser = () => {
    navigate('/admin/users/create');
  };

  // Edit user handler
  const handleEditUser = (userId) => {
    navigate(`/admin/users/${userId}/edit`);
  };

  // Delete user handler
  const handleDeleteUser = async (userId) => {
    // Prevent admins from deleting themselves
    if (userId === user._id) {
      alert("You cannot delete your own account.");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update the users list
      setUsers(users.filter(u => u._id !== userId));
      
      alert('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId, currentStatus) => {
    // Prevent admins from deactivating themselves
    if (userId === user._id) {
      alert("You cannot change your own status.");
      return;
    }

    try {
      const response = await axios.patch(
        `/api/users/${userId}`,
        { isActive: !currentStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update the users list with the updated user
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isActive: !currentStatus } : u
      ));
    } catch (err) {
      console.error('Error updating user status:', err);
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">
          <FaExclamationTriangle className="text-5xl" />
        </div>
        <h2 className="text-xl font-bold mb-2">Error Loading Users</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchUsers} 
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
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <button 
          className="btn-primary"
          onClick={handleAddUser}
        >
          <FaPlus className="mr-2" />
          Add User
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold">Users List</h2>
        </div>
        {users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No users found. Create your first user by clicking the "Add User" button.
          </div>
        ) : (
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
                      <button
                        onClick={() => handleToggleStatus(u._id, u.isActive)}
                        disabled={u._id === user._id}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        } ${u._id === user._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-primary hover:text-primary-dark mr-3"
                        onClick={() => handleEditUser(u._id)}
                        title="Edit user"
                      >
                        <FaEdit />
                      </button>
                      {u._id !== user._id && (
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteUser(u._id)}
                          title="Delete user"
                        >
                          <FaTrash />
                        </button>
                      )}
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

export default ManageUsers;