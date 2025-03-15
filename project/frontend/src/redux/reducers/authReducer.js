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

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: false,
  profileLoading: false,
  user: null,
  error: null
};

const authReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case AUTH_LOADING:
      return {
        ...state,
        loading: true
      };
    case PROFILE_LOADING:
      return {
        ...state,
        profileLoading: true
      };
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload
      };
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      localStorage.setItem('token', payload.token);
      return {
        ...state,
        token: payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        user: payload,
        profileLoading: false,
        error: null
      };
    case CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        profileLoading: false,
        error: null
      };
    case REGISTER_FAIL:
    case AUTH_ERROR:
    case LOGIN_FAIL:
    case LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: payload
      };
    case UPDATE_PROFILE_FAIL:
    case CHANGE_PASSWORD_FAIL:
      return {
        ...state,
        profileLoading: false,
        error: payload
      };
    default:
      return state;
  }
};

export default authReducer;