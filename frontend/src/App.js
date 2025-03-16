import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './redux/actions/authActions';
import CreateUniversity from './pages/admin/CreateUniversity';
import EditUniversity from './pages/admin/EditUniversity';
// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Page Components
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import UniversityList from './pages/university/UniversityList';
import UniversityDetail from './pages/university/UniversityDetail';
import FacilityList from './pages/facility/FacilityList';
import FacilityDetail from './pages/facility/FacilityDetail';
import BookingCalendar from './pages/booking/BookingCalendar';
import BookingDetail from './pages/booking/BookingDetail';
import UserProfile from './pages/user/UserProfile';
import UserBookings from './pages/user/UserBookings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUniversities from './pages/admin/ManageUniversities';
import ManageFacilities from './pages/admin/ManageFacilities';
import ManageBookings from './pages/admin/ManageBookings';
import ManageUsers from './pages/admin/ManageUsers';
import Statistics from './pages/admin/Statistics';
import QRScanner from './pages/admin/QRScanner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = ['user', 'admin', 'super-admin'] }) => {
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Admin Layout Component
const AdminLayout = ({ children }) => {
  const { user } = useSelector(state => state.auth);
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role={user?.role || 'user'} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  
  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(loadUser());
    }
  }, [dispatch]);
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/universities" element={<UniversityList />} />
      <Route path="/universities/:id" element={<UniversityDetail />} />
      <Route path="/facilities" element={<FacilityList />} />
      <Route path="/facilities/:id" element={<FacilityDetail />} />
      
      {/* Protected User Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AdminLayout>
            <UserProfile />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/my-bookings" element={
        <ProtectedRoute>
          <AdminLayout>
            <UserBookings />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/booking/:id" element={
        <ProtectedRoute>
          <AdminLayout>
            <BookingDetail />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/facilities/:id/book" element={
        <ProtectedRoute>
          <AdminLayout>
            <BookingCalendar />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/universities" element={
        <ProtectedRoute allowedRoles={['super-admin']}>
          <AdminLayout>
            <ManageUniversities />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/universities/create" element={
        <ProtectedRoute allowedRoles={['super-admin']}>
          <AdminLayout>
            <CreateUniversity />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/universities/:id/edit" element={
        <ProtectedRoute allowedRoles={['super-admin']}>
          <AdminLayout>
            <EditUniversity />
          </AdminLayout>
      </ProtectedRoute>
      } />
      <Route path="/admin/facilities" element={
        <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
          <AdminLayout>
            <ManageFacilities />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/bookings" element={
        <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
          <AdminLayout>
            <ManageBookings />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
          <AdminLayout>
            <ManageUsers />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/statistics" element={
        <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
          <AdminLayout>
            <Statistics />
          </AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/scanner" element={
        <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
          <AdminLayout>
            <QRScanner />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;