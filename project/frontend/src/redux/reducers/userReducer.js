// Initial state
const initialState = {
    users: [],
    user: null,
    loading: true,
    error: null
  };
  
  // Action types
  const GET_USERS = 'GET_USERS';
  const GET_USER = 'GET_USER';
  const USER_ERROR = 'USER_ERROR';
  const USER_LOADING = 'USER_LOADING';
  const CLEAR_USER = 'CLEAR_USER';
  
  // Reducer function
  const userReducer = (state = initialState, action) => {
    const { type, payload } = action;
  
    switch (type) {
      case USER_LOADING:
        return {
          ...state,
          loading: true
        };
      case GET_USERS:
        return {
          ...state,
          users: payload,
          loading: false
        };
      case GET_USER:
        return {
          ...state,
          user: payload,
          loading: false
        };
      case USER_ERROR:
        return {
          ...state,
          error: payload,
          loading: false
        };
      case CLEAR_USER:
        return {
          ...state,
          user: null
        };
      default:
        return state;
    }
  };
  
  export default userReducer;