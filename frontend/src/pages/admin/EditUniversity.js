// src/pages/admin/EditUniversity.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaArrowLeft, FaUniversity, FaSpinner, FaUpload, FaUserPlus, FaTrash } from 'react-icons/fa';

const EditUniversity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);
  
  // State variables
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableAdmins, setAvailableAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
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
    administrators: [],
    isActive: true
  });
  
  // Fetch university details and available admin users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        setError(null);
        
        // Fetch university details
        const universityResponse = await axios.get(`/api/universities/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const universityData = universityResponse.data.data || universityResponse.data;
        
        // Set university data to state
        setFormData({
          name: universityData.name || '',
          address: {
            street: universityData.address?.street || '',
            city: universityData.address?.city || '',
            state: universityData.address?.state || '',
            zipCode: universityData.address?.zipCode || '',
            country: universityData.address?.country || ''
          },
          contact: {
            email: universityData.contact?.email || '',
            phone: universityData.contact?.phone || '',
            website: universityData.contact?.website || ''
          },
          administrators: universityData.administrators || [],
          isActive: universityData.isActive !== undefined ? universityData.isActive : true
        });
        
        // Set logo preview if exists
        if (universityData.logo) {
          setLogoPreview(universityData.logo);
        }
        
        // Fetch available admin users
        const adminResponse = await axios.get('/api/users?role=admin', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const adminUsers = adminResponse.data.data || adminResponse.data;
        setAvailableAdmins(adminUsers);
        
        setFetchLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch university details');
        setFetchLoading(false);
      }
    };

    if (id && token) {
      fetchData();
    }
  }, [id, token]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value
        }
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  // Handle adding an administrator
  const handleAddAdmin = () => {
    if (selectedAdmin && !formData.administrators.includes(selectedAdmin)) {
      setFormData({
        ...formData,
        administrators: [...formData.administrators, selectedAdmin]
      });
      setSelectedAdmin('');
    }
  };

  // Handle removing an administrator
  const handleRemoveAdmin = (adminId) => {
    setFormData({
      ...formData,
      administrators: formData.administrators.filter(id => id !== adminId)
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create FormData for multipart/form-data (for file upload)
      const formDataToSend = new FormData();
      
      // Add basic information
      formDataToSend.append('name', formData.name);
      formDataToSend.append('isActive', formData.isActive);
      
      // Add address fields
      formDataToSend.append('address[street]', formData.address.street);
      formDataToSend.append('address[city]', formData.address.city);
      formDataToSend.append('address[state]', formData.address.state);
      formDataToSend.append('address[zipCode]', formData.address.zipCode);
      formDataToSend.append('address[country]', formData.address.country);
      
      // Add contact fields
      formDataToSend.append('contact[email]', formData.contact.email);
      formDataToSend.append('contact[phone]', formData.contact.phone);
      
      if (formData.contact.website) {
        formDataToSend.append('contact[website]', formData.contact.website);
      }
      
      // Add administrators
      formData.administrators.forEach(adminId => {
        formDataToSend.append('administrators[]', adminId);
      });
      
      // Add logo file if selected
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      
      // Send PUT request to update university
      await axios.put(`/api/universities/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setLoading(false);
      navigate('/admin/universities', { 
        state: { message: 'University updated successfully' }
      });
    } catch (err) {
      setLoading(false);
      console.error('Error updating university:', err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to update university');
    }
  };

  // Loading state
  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate('/admin/universities')}
          >
            Back to Universities
          </button>
        </div>
      </div>
    );
  }

  // Find admin details by ID
  const getAdminDetails = (adminId) => {
    return availableAdmins.find(admin => admin._id === adminId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/admin/universities')}
          className="flex items-center text-primary hover:text-primary-dark"
        >
          <FaArrowLeft className="mr-2" />
          Back to Universities
        </button>
      </div>
      
      {/* Main form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <FaUniversity className="text-3xl text-primary mr-4" />
          <h1 className="text-2xl font-bold">Edit University</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 pb-2 border-b">Basic Information</h2>
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
              
              {/* Active status checkbox */}
              <div className="mb-4">
                <label className="flex items-center text-gray-700 text-sm font-bold mt-6">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4"
                  />
                  Active
                </label>
              </div>
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
                    <span>Change Logo</span>
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
          
          {/* Address Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 pb-2 border-b">Address</h2>
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
          
          {/* Contact Information Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 pb-2 border-b">Contact Information</h2>
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
          
          {/* Administrators Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 pb-2 border-b">University Administrators</h2>
            
            {/* Admin Selection */}
            <div className="mb-4">
              <div className="flex space-x-2">
                <select
                  className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-grow"
                  value={selectedAdmin}
                  onChange={(e) => setSelectedAdmin(e.target.value)}
                >
                  <option value="">Select an administrator</option>
                  {availableAdmins.map(admin => (
                    <option 
                      key={admin._id} 
                      value={admin._id}
                      disabled={formData.administrators.includes(admin._id)}
                    >
                      {admin.firstName} {admin.lastName} ({admin.email})
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
            
            {/* List of assigned administrators */}
            {formData.administrators.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-semibold mb-2">Assigned Administrators:</h3>
                <ul className="divide-y divide-gray-200">
                  {formData.administrators.map(adminId => {
                    const admin = getAdminDetails(adminId);
                    return (
                      <li key={adminId} className="py-2 flex justify-between items-center">
                        <div>
                          {admin ? (
                            <>
                              <span className="font-medium">{admin.firstName} {admin.lastName}</span>
                              <span className="text-sm text-gray-500 ml-2">({admin.email})</span>
                            </>
                          ) : (
                            <span className="italic text-gray-500">Unknown Admin (ID: {adminId.substring(0, 8)}...)</span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveAdmin(adminId)}
                        >
                          <FaTrash />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded border border-yellow-100 text-yellow-800">
                <p>No administrators assigned. Consider adding at least one administrator to manage this university.</p>
              </div>
            )}
          </div>
          
          {/* Submit/Cancel Buttons */}
          <div className="flex justify-end mt-8">
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              onClick={() => navigate('/admin/universities')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update University'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUniversity;