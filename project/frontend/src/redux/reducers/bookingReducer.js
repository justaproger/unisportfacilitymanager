// Initial state
const initialState = {
    bookings: [],
    booking: null,
    loading: true,
    error: null
  };
  
  // Action types
  const GET_BOOKINGS = 'GET_BOOKINGS';
  const GET_BOOKING = 'GET_BOOKING';
  const CREATE_BOOKING = 'CREATE_BOOKING';
  const UPDATE_BOOKING = 'UPDATE_BOOKING';
  const CANCEL_BOOKING = 'CANCEL_BOOKING';
  const BOOKING_ERROR = 'BOOKING_ERROR';
  const BOOKING_LOADING = 'BOOKING_LOADING';
  const CLEAR_BOOKING = 'CLEAR_BOOKING';
  
  // Reducer function
  const bookingReducer = (state = initialState, action) => {
    const { type, payload } = action;
  
    switch (type) {
      case BOOKING_LOADING:
        return {
          ...state,
          loading: true
        };
      case GET_BOOKINGS:
        return {
          ...state,
          bookings: payload,
          loading: false
        };
      case GET_BOOKING:
        return {
          ...state,
          booking: payload,
          loading: false
        };
      case CREATE_BOOKING:
        return {
          ...state,
          booking: payload,
          bookings: [payload, ...state.bookings],
          loading: false
        };
      case UPDATE_BOOKING:
      case CANCEL_BOOKING:
        return {
          ...state,
          booking: payload,
          bookings: state.bookings.map(booking =>
            booking._id === payload._id ? payload : booking
          ),
          loading: false
        };
      case BOOKING_ERROR:
        return {
          ...state,
          error: payload,
          loading: false
        };
      case CLEAR_BOOKING:
        return {
          ...state,
          booking: null
        };
      default:
        return state;
    }
  };
  
  export default bookingReducer;