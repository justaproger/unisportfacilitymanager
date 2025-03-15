import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';

// Import reducers
import authReducer from './reducers/authReducer';
import universityReducer from './reducers/universityReducer';
import facilityReducer from './reducers/facilityReducer';
import bookingReducer from './reducers/bookingReducer';
import userReducer from './reducers/userReducer';
import alertReducer from './reducers/alertReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  universities: universityReducer,
  facilities: facilityReducer,
  bookings: bookingReducer,
  users: userReducer,
  alert: alertReducer
});

// Add Redux DevTools Extension support
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

export default store;