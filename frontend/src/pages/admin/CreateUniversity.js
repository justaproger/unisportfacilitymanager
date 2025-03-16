// src/pages/admin/CreateUniversity.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaArrowLeft, FaUniversity, FaUpload, FaUserPlus, FaTrash } from 'react-icons/fa';

const CreateUniversity = () => {
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]); // For admin selection dropdown
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    contact: {
      email: '',
      phone: '',
      website: ''
    },
    administrators: [] // Array to store admin IDs
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState('');

  // Fetch users with admin role for admin selection
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get('/api/users?role=admin', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const adminUsers = response.data.data || response.data;
        setUsers(adminUsers);
      } catch (err) {
        console.error('Error fetching admin users:', err);
      }
    };

    if (token) {
      fetchAdmins();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleAdminSelect = (e) => {
    setSelectedAdmin(e.target.value);
  };

  const handleAddAdmin = () => {
    if (selectedAdmin && !formData.administrators.includes(selectedAdmin)) {
      setFormData({
        ...formData,
        administrators: [...formData.administrators, selectedAdmin]
      });
      setSelectedAdmin('');
    }
  };

  const handleRemoveAdmin = (adminId) => {
    setFormData({
      ...formData,
      administrators: formData.administrators.filter(id => id !== adminId)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create FormData for multipart/form-data (for file upload)
      const uploadData = new FormData();
      
      // Add all form fields
      uploadData.append('name', formData.name);
      uploadData.append('address[street]', formData.address.street);
      uploadData.append('address[city]', formData.address.city);
      uploadData.append('address[state]', formData.address.state);
      uploadData.append('address[zipCode]', formData.address.zipCode);
      uploadData.append('address[country]', formData.address.country);
      uploadData.append('contact[email]', formData.contact.email);
      uploadData.append('contact[phone]', formData.contact.phone);
      
      if (formData.contact.website) {
        uploadData.append('contact[website]', formData.contact.website);
      }
      
      // Add admin IDs
      formData.administrators.forEach(adminId => {
        uploadData.append('administrators[]', adminId);
      });
      
      // Add logo file if selected
      if (logoFile) {
        uploadData.append('logo', logoFile);
      }
      
      await axios.post('/api/universities', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setLoading(false);
      navigate('/admin/universities', { 
        state: { message: 'University created successfully' }
      });
    } catch (err) {
      setLoading(false);
      console.error('Error creating university:', err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to create university');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/admin/universities')}
          className="flex items-center text-primary hover:text-primary-dark"
        >
          <FaArrowLeft className="mr-2" />
          Back to Universities
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <FaUniversity className="text-3xl text-primary mr-4" />
          <h1 className="text-2xl font-bold">Create New University</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  University Name*
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Logo Upload Section */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  University Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 border rounded flex items-center justify-center overflow-hidden bg-gray-100">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                    ) : (
                      <FaUniversity className="text-gray-400 text-3xl" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded cursor-pointer flex items-center">
                      <FaUpload className="mr-2" />
                      <span>Upload Logo</span>
                      <input 
                        type="file" 
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                    </label>
                    <span className="text-xs text-gray-500 mt-1">
                      Recommended: 200x200px, PNG or JPG
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="street">
                  Street Address*
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="street"
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
                  City*
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="city"
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="state">
                  State/Province*
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="state"
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="zipCode">
                  Zip/Postal Code*
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="zipCode"
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="country">
                  Country*
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="country"
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email*
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  Phone*
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="phone"
                  type="text"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="website">
                  Website
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="website"
                  type="url"
                  name="contact.website"
                  value={formData.contact.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
          
          {/* University Administrators Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">University Administrators</h2>
            <div className="mb-4">
              <div className="flex space-x-2">
                <select
                  className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-grow"
                  value={selectedAdmin}
                  onChange={handleAdminSelect}
                >
                  <option value="">Select an administrator</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded flex items-center"
                  onClick={handleAddAdmin}
                  disabled={!selectedAdmin}
                >
                  <FaUserPlus className="mr-2" />
                  Add
                </button>
              </div>
            </div>
            
            {/* List of selected administrators */}
            {formData.administrators.length > 0 && (
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-semibold mb-2">Selected Administrators:</h3>
                <ul className="divide-y divide-gray-200">
                  {formData.administrators.map(adminId => {
                    const admin = users.find(user => user._id === adminId);
                    return admin ? (
                      <li key={adminId} className="py-2 flex justify-between items-center">
                        <div>
                          <span className="font-medium">{admin.firstName} {admin.lastName}</span>
                          <span className="text-sm text-gray-500 ml-2">({admin.email})</span>
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveAdmin(adminId)}
                        >
                          <FaTrash />
                        </button>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              onClick={() => navigate('/admin/universities')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create University'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUniversity;