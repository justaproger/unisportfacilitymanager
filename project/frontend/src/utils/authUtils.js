import axios from 'axios';
import jwt_decode from 'jwt-decode';

// Set auth token in axios headers
export const setAuthToken = token => {
  if (token) {
    // Apply to every request
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Delete auth header
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Check if token is valid (not expired)
export const isTokenValid = token => {
  if (!token) return false;
  
  try {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      localStorage.removeItem('token');
      return false;
    }
    
    return true;
  } catch (err) {
    localStorage.removeItem('token');
    return false;
  }
};

// Get user role from token
export const getUserRoleFromToken = token => {
  if (!token) return null;
  
  try {
    const decoded = jwt_decode(token);
    return decoded.role || null;
  } catch (err) {
    return null;
  }
};

// Format user name
export const formatUserName = user => {
  if (!user) return '';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  } else if (user.firstName) {
    return user.firstName;
  } else if (user.email) {
    return user.email.split('@')[0]; // Use part before @ in email
  }
  
  return 'User';
};

// Check if user has specific role
export const hasRole = (user, roles) => {
  if (!user || !user.role) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  
  return user.role === roles;
};