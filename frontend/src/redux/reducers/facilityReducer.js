// Initial state
const initialState = {
    facilities: [],
    facility: null,
    loading: true,
    error: null
  };
  
  // Action types
  const GET_FACILITIES = 'GET_FACILITIES';
  const GET_FACILITY = 'GET_FACILITY';
  const FACILITY_ERROR = 'FACILITY_ERROR';
  const FACILITY_LOADING = 'FACILITY_LOADING';
  const CLEAR_FACILITY = 'CLEAR_FACILITY';
  
  // Reducer function
  const facilityReducer = (state = initialState, action) => {
    const { type, payload } = action;
  
    switch (type) {
      case FACILITY_LOADING:
        return {
          ...state,
          loading: true
        };
      case GET_FACILITIES:
        return {
          ...state,
          facilities: payload,
          loading: false
        };
      case GET_FACILITY:
        return {
          ...state,
          facility: payload,
          loading: false
        };
      case FACILITY_ERROR:
        return {
          ...state,
          error: payload,
          loading: false
        };
      case CLEAR_FACILITY:
        return {
          ...state,
          facility: null
        };
      default:
        return state;
    }
  };
  
  export default facilityReducer;