import axios from 'axios';
import { toast } from 'react-toastify';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  AUTH_LOADING,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,
  PROFILE_LOADING,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAIL
} from '../types/authTypes';
import { setAuthToken } from '../../utils/authUtils';

// Load User
export const loadUser = () => async dispatch => {
  // Set loading
  dispatch({ type: AUTH_LOADING });

  // Set token in headers if it exists in localStorage
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get('/api/auth/me');

    dispatch({
      type: USER_LOADED,
      payload: res.data.data
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR
    });
  }
};

// Register User
export const register = formData => async dispatch => {
  dispatch({ type: AUTH_LOADING });

  try {
    const res = await axios.post('/api/auth/register', formData);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data
    });

    // Load user immediately after registration
    dispatch(loadUser());

    toast.success('Registration successful!');
  } catch (err) {
    const errors = err.response?.data?.errors || [];
    const errorMessage = err.response?.data?.error || 'Registration failed';

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error.msg || error.message));
    } else {
      toast.error(errorMessage);
    }

    dispatch({
      type: REGISTER_FAIL
    });
  }
};

// Login User
export const login = (email, password) => async dispatch => {
  dispatch({ type: AUTH_LOADING });

  try {
    const res = await axios.post('/api/auth/login', { email, password });

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data
    });

    // Load user immediately after login
    dispatch(loadUser());

    toast.success('Login successful!');
  } catch (err) {
    const errorMessage = err.response?.data?.error || 'Login failed';
    toast.error(errorMessage);

    dispatch({
      type: LOGIN_FAIL
    });
  }
};

// Logout
export const logout = () => dispatch => {
  dispatch({ type: LOGOUT });
  toast.info('You have been logged out');
};

// Update Profile
export const updateProfile = (userId, profileData) => async dispatch => {
  dispatch({ type: PROFILE_LOADING });

  try {
    const res = await axios.put(`/api/users/${userId}`, profileData);

    dispatch({
      type: UPDATE_PROFILE_SUCCESS,
      payload: res.data.data
    });

    toast.success('Profile updated successfully!');
  } catch (err) {
    const errors = err.response?.data?.errors || [];
    const errorMessage = err.response?.data?.error || 'Failed to update profile';

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error.msg || error.message));
    } else {
      toast.error(errorMessage);
    }

    dispatch({
      type: UPDATE_PROFILE_FAIL
    });
  }
};

// Change Password
export const changePassword = (userId, passwordData) => async dispatch => {
  dispatch({ type: PROFILE_LOADING });

  try {
    await axios.put(`/api/users/${userId}/password`, passwordData);

    dispatch({
      type: CHANGE_PASSWORD_SUCCESS
    });

    toast.success('Password changed successfully!');
  } catch (err) {
    const errorMessage = err.response?.data?.error || 'Failed to change password';
    toast.error(errorMessage);

    dispatch({
      type: CHANGE_PASSWORD_FAIL
    });
  }
};