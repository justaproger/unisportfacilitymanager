// Initial state
const initialState = {
    universities: [],
    university: null,
    loading: true,
    error: null
  };
  
  // Action types
  const GET_UNIVERSITIES = 'GET_UNIVERSITIES';
  const GET_UNIVERSITY = 'GET_UNIVERSITY';
  const UNIVERSITY_ERROR = 'UNIVERSITY_ERROR';
  const UNIVERSITY_LOADING = 'UNIVERSITY_LOADING';
  const CLEAR_UNIVERSITY = 'CLEAR_UNIVERSITY';
  
  // Reducer function
  const universityReducer = (state = initialState, action) => {
    const { type, payload } = action;
  
    switch (type) {
      case UNIVERSITY_LOADING:
        return {
          ...state,
          loading: true
        };
      case GET_UNIVERSITIES:
        return {
          ...state,
          universities: payload,
          loading: false
        };
      case GET_UNIVERSITY:
        return {
          ...state,
          university: payload,
          loading: false
        };
      case UNIVERSITY_ERROR:
        return {
          ...state,
          error: payload,
          loading: false
        };
      case CLEAR_UNIVERSITY:
        return {
          ...state,
          university: null
        };
      default:
        return state;
    }
  };
  
  export default universityReducer;