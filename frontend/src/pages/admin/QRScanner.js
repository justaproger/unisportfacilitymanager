import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'react-qr-scanner';
import axios from 'axios';
import {
  FaQrcode,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaClock,
  FaBarcode,
  FaSearch,
  FaArrowLeft
} from 'react-icons/fa';

const QRScanner = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useSelector(state => state.auth);
  const [isScannerEnabled, setIsScannerEnabled] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [booking, setBooking] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'valid', 'invalid', 'expired', 'used'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' for rear camera, 'user' for front
  
  const scannerRef = useRef(null);

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/admin/scanner',
          message: "Please log in to access the QR Scanner."
        }
      });
      return;
    }

    if (user && !['admin', 'super-admin'].includes(user.role)) {
      navigate('/dashboard', {
        state: {
          message: "You don't have permission to access the QR Scanner."
        }
      });
    }
  }, [isAuthenticated, user, navigate]);

  // Handle QR scanner error
  const handleError = (err) => {
    console.error('QR Scanner Error:', err);
    setErrorMsg('Error accessing camera. Please make sure you have granted camera permissions.');
  };

  // Handle successful QR code scan
  const handleScan = (data) => {
    if (data) {
      // Disable scanner to prevent multiple scans
      setIsScannerEnabled(false);
      
      // Parse QR code data
      try {
        const jsonData = JSON.parse(data.text);
        setScannedData(jsonData);
        // Look up booking based on scanned data
        verifyBooking(jsonData);
      } catch (error) {
        console.error('Invalid QR code data', error);
        setVerificationStatus('invalid');
        setErrorMsg('Invalid QR code format. Please try again.');
      }
    }
  };

  // Toggle scanner on/off
  const toggleScanner = () => {
    if (isScannerEnabled) {
      setIsScannerEnabled(false);
    } else {
      // Reset states before starting a new scan
      setScannedData(null);
      setBooking(null);
      setVerificationStatus(null);
      setErrorMsg('');
      setIsScannerEnabled(true);
    }
  };

  // Verify booking based on QR code or manual code
  const verifyBooking = async (data = null) => {
    setLoading(true);
    setErrorMsg('');
    
    try {
      // Use scanned data or manual code
      const bookingCode = data ? data.bookingCode : manualCode;
      
      if (!bookingCode) {
        setVerificationStatus('invalid');
        setErrorMsg('Booking code is required.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`/api/bookings/verify/${bookingCode}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Set booking data from response
      setBooking(response.data.booking);
      
      // Determine verification status based on booking data
      if (response.data.booking.checkedIn) {
        setVerificationStatus('used');
        setErrorMsg('This booking has already been checked in.');
      } else if (response.data.booking.status === 'cancelled') {
        setVerificationStatus('invalid');
        setErrorMsg('This booking has been cancelled.');
      } else if (response.data.booking.paymentStatus !== 'paid') {
        setVerificationStatus('invalid');
        setErrorMsg('Booking payment is pending. Cannot check in until payment is confirmed.');
      } else {
        // Check if booking date is in the past
        const bookingDate = new Date(response.data.booking.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (bookingDate < today) {
          setVerificationStatus('expired');
          setErrorMsg('Booking has expired. The date has already passed.');
        } else {
          setVerificationStatus('valid');
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error verifying booking:', error);
      setVerificationStatus('invalid');
      setErrorMsg(error.response?.data?.message || 'Error verifying booking. Please try again.');
      setLoading(false);
    }
  };

  // Handle manual code verification
  const handleManualVerify = (e) => {
    e.preventDefault();
    if (!manualCode) {
      setErrorMsg('Please enter a booking code');
      return;
    }
    verifyBooking();
  };

  // Handle check-in confirmation
  const handleCheckIn = async () => {
    if (!booking || !booking._id) {
      setErrorMsg('No valid booking to check in');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call API to check in booking
      const response = await axios.post(
        `/api/bookings/${booking._id}/checkin`, 
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update booking status to checked in
      setBooking(response.data);
      setVerificationStatus('checked-in');
      setLoading(false);
    } catch (error) {
      console.error('Error checking in booking:', error);
      setErrorMsg(error.response?.data?.message || 'Error checking in booking. Please try again.');
      setLoading(false);
    }
  };

  // Switch camera between front and rear
  const switchCamera = () => {
    setFacingMode(prevMode => 
      prevMode === 'environment' ? 'user' : 'environment'
    );
  };

  // Reset scanner and states
  const resetScanner = () => {
    setScannedData(null);
    setBooking(null);
    setVerificationStatus(null);
    setErrorMsg('');
    setManualCode('');
    setIsScannerEnabled(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold">QR Code Scanner</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold">Scan Booking QR Code</h2>
          </div>
          <div className="p-4">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <div className="flex">
                  <FaExclamationTriangle className="text-red-500 mt-1 mr-2" />
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-center mb-4">
              <button
                onClick={toggleScanner}
                className={`btn ${isScannerEnabled ? 'btn-danger' : 'btn-primary'}`}
              >
                <FaQrcode className="mr-2" />
                {isScannerEnabled ? 'Stop Scanner' : 'Start Scanner'}
              </button>
              {isScannerEnabled && (
                <button
                  onClick={switchCamera}
                  className="ml-4 btn-outline"
                >
                  Switch Camera
                </button>
              )}
            </div>
            
            {isScannerEnabled && (
              <div className="flex justify-center">
                <div className="relative w-full max-w-sm">
                  <QrScanner
                    ref={scannerRef}
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: '100%' }}
                    constraints={{
                      audio: false,
                      video: { facingMode }
                    }}
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-primary pointer-events-none"></div>
                </div>
              </div>
            )}
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-2">Or enter booking code manually</p>
              <form onSubmit={handleManualVerify} className="flex">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBarcode className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="form-input pl-10 w-full"
                    placeholder="Enter booking code"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  />
                </div>
                <button
                  type="submit"
                  className="ml-2 btn-primary"
                  disabled={loading}
                >
                  <FaSearch className="mr-2" />
                  Verify
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Booking Details Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold">Booking Details</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : booking ? (
              <div>
                {/* Verification Status */}
                <div className={`p-4 rounded-lg mb-6 ${
                  verificationStatus === 'valid' ? 'bg-green-50 border border-green-200' :
                  verificationStatus === 'checked-in' ? 'bg-green-50 border border-green-200' :
                  verificationStatus === 'invalid' ? 'bg-red-50 border border-red-200' :
                  verificationStatus === 'expired' ? 'bg-yellow-50 border border-yellow-200' :
                  verificationStatus === 'used' ? 'bg-blue-50 border border-blue-200' :
                  'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-center">
                    {verificationStatus === 'valid' && (
                      <>
                        <FaCheckCircle className="text-green-500 text-xl mr-3" />
                        <div>
                          <h3 className="font-bold text-green-800">Valid Booking</h3>
                          <p className="text-sm text-green-700">This booking is valid and ready for check-in.</p>
                        </div>
                      </>
                    )}
                    {verificationStatus === 'checked-in' && (
                      <>
                        <FaCheckCircle className="text-green-500 text-xl mr-3" />
                        <div>
                          <h3 className="font-bold text-green-800">Check-in Successful</h3>
                          <p className="text-sm text-green-700">This booking has been successfully checked in.</p>
                        </div>
                      </>
                    )}
                    {verificationStatus === 'invalid' && (
                      <>
                        <FaTimesCircle className="text-red-500 text-xl mr-3" />
                        <div>
                          <h3 className="font-bold text-red-800">Invalid Booking</h3>
                          <p className="text-sm text-red-700">{errorMsg || 'This booking cannot be checked in.'}</p>
                        </div>
                      </>
                    )}
                    {verificationStatus === 'expired' && (
                      <>
                        <FaExclamationTriangle className="text-yellow-500 text-xl mr-3" />
                        <div>
                          <h3 className="font-bold text-yellow-800">Expired Booking</h3>
                          <p className="text-sm text-yellow-700">{errorMsg || 'This booking has expired.'}</p>
                        </div>
                      </>
                    )}
                    {verificationStatus === 'used' && (
                      <>
                        <FaCheckCircle className="text-blue-500 text-xl mr-3" />
                        <div>
                          <h3 className="font-bold text-blue-800">Already Checked In</h3>
                          <p className="text-sm text-blue-700">{errorMsg || 'This booking has already been checked in.'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Booking Info */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaBuilding className="text-gray-400 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium">Facility</h3>
                      <p>{booking.facilityName}</p>
                      <p className="text-sm text-gray-500">{booking.universityName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaUser className="text-gray-400 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium">User</h3>
                      <p>{booking.user.name}</p>
                      <p className="text-sm text-gray-500">{booking.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaCalendarAlt className="text-gray-400 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium">Date & Time</h3>
                      <p>{booking.date}</p>
                      <p className="text-sm text-gray-500">
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaBarcode className="text-gray-400 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium">Booking Code</h3>
                      <p className="font-mono">{booking.bookingCode}</p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-8 flex justify-center">
                  {verificationStatus === 'valid' && (
                    <button
                      onClick={handleCheckIn}
                      className="btn-primary"
                      disabled={loading}
                    >
                      <FaCheckCircle className="mr-2" />
                      Confirm Check-in
                    </button>
                  )}
                  
                  {(verificationStatus === 'invalid' || 
                   verificationStatus === 'expired' || 
                   verificationStatus === 'used' ||
                   verificationStatus === 'checked-in') && (
                    <button
                      onClick={resetScanner}
                      className="btn-primary"
                    >
                      Scan Another Code
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FaQrcode className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No Booking Scanned</h3>
                <p className="mt-1 text-gray-500">
                  Scan a QR code or enter a booking code manually to see booking details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;