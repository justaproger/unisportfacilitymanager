import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, changePassword } from '../../redux/actions/authActions';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaSave,
  FaExclamationTriangle
} from 'react-icons/fa';

// Validation schemas
const ProfileSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9+\-\s()]{7,}$/, 'Invalid phone number format')
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, loading, profileLoading } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  // Reset success messages when switching tabs
  useEffect(() => {
    setProfileUpdateSuccess(false);
    setPasswordUpdateSuccess(false);
  }, [activeTab]);

  const handleProfileSubmit = (values, { setSubmitting }) => {
    dispatch(updateProfile(user._id, values));
    setProfileUpdateSuccess(true);
    setSubmitting(false);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setProfileUpdateSuccess(false);
    }, 3000);
  };

  const handlePasswordSubmit = (values, { setSubmitting, resetForm }) => {
    dispatch(changePassword(user._id, {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword
    }));
    
    setPasswordUpdateSuccess(true);
    setSubmitting(false);
    resetForm();
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setPasswordUpdateSuccess(false);
    }, 3000);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'password'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-medium mb-4">Profile Information</h2>
              
              {profileUpdateSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  <div className="flex">
                    <div className="py-1">
                      <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p>Your profile has been updated successfully!</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Formik
                initialValues={{
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  email: user.email || '',
                  phone: user.phone || ''
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleProfileSubmit}
              >
                {({ isSubmitting, touched, errors }) => (
                  <Form>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="h-4 w-4 text-gray-400" />
                          </div>
                          <Field
                            id="firstName"
                            name="firstName"
                            type="text"
                            className={`form-input pl-10 block w-full ${
                              touched.firstName && errors.firstName ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUser className="h-4 w-4 text-gray-400" />
                          </div>
                          <Field
                            id="lastName"
                            name="lastName"
                            type="text"
                            className={`form-input pl-10 block w-full ${
                              touched.lastName && errors.lastName ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="h-4 w-4 text-gray-400" />
                          </div>
                          <Field
                            id="email"
                            name="email"
                            type="email"
                            className={`form-input pl-10 block w-full ${
                              touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaPhone className="h-4 w-4 text-gray-400" />
                          </div>
                          <Field
                            id="phone"
                            name="phone"
                            type="tel"
                            className={`form-input pl-10 block w-full ${
                              touched.phone && errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting || profileLoading}
                      >
                        <FaSave className="mr-2" />
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}
          
          {activeTab === 'password' && (
            <div>
              <h2 className="text-lg font-medium mb-4">Change Password</h2>
              
              {passwordUpdateSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  <div className="flex">
                    <div className="py-1">
                      <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p>Your password has been changed successfully!</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Formik
                initialValues={{
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                }}
                validationSchema={PasswordSchema}
                onSubmit={handlePasswordSubmit}
              >
                {({ isSubmitting, touched, errors }) => (
                  <Form>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="h-4 w-4 text-gray-400" />
                          </div>
                          <Field
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            className={`form-input pl-10 block w-full ${
                              touched.currentPassword && errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        <ErrorMessage name="currentPassword" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="h-4 w-4 text-gray-400" />
                          </div>
                          <Field
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            className={`form-input pl-10 block w-full ${
                              touched.newPassword && errors.newPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        <ErrorMessage name="newPassword" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="h-4 w-4 text-gray-400" />
                          </div>
                          <Field
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className={`form-input pl-10 block w-full ${
                              touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center">
                      <div className="flex-shrink-0">
                        <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-700">
                          Make sure your new password is at least 6 characters and includes a mix of letters, numbers, and symbols for better security.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting || profileLoading}
                      >
                        <FaSave className="mr-2" />
                        {profileLoading ? 'Saving...' : 'Change Password'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;