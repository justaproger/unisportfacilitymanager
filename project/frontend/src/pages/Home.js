import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { FaCalendarAlt, FaUniversity, FaBuilding, FaUsers, FaArrowRight } from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [stats, setStats] = useState({
    universities: 0,
    facilities: 0,
    activeBookings: 0,
    users: 0
  });
  const [featuredUniversities, setFeaturedUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, this would be a single API call to get statistics
        // For demo purposes, we'll simulate with static data
        
        // Simulated API response delay
        setTimeout(() => {
          setStats({
            universities: 15,
            facilities: 128,
            activeBookings: 547,
            users: 2850
          });
          setLoading(false);
        }, 1000);
        
        // Get featured universities (would be real API call in production)
        const universities = [
          {
            _id: '1',
            name: 'Moscow State University',
            address: { city: 'Moscow', country: 'Russia' },
            logo: 'https://via.placeholder.com/150'
          },
          {
            _id: '2',
            name: 'Saint Petersburg University',
            address: { city: 'Saint Petersburg', country: 'Russia' },
            logo: 'https://via.placeholder.com/150'
          },
          {
            _id: '3',
            name: 'Novosibirsk State University',
            address: { city: 'Novosibirsk', country: 'Russia' },
            logo: 'https://via.placeholder.com/150'
          },
          {
            _id: '4',
            name: 'Kazan Federal University',
            address: { city: 'Kazan', country: 'Russia' },
            logo: 'https://via.placeholder.com/150'
          }
        ];
        
        setFeaturedUniversities(universities);
      } catch (error) {
        console.error('Error fetching home page data:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero section */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                Book university sports facilities with ease
              </h1>
              <p className="text-xl text-primary-light mb-8">
                UniSportManager makes it simple to find and book sports facilities at universities across the country. Join thousands of students and faculty enjoying hassle-free facility booking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/universities" className="btn bg-white text-primary hover:bg-gray-100">
                  Browse Universities
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="btn bg-secondary text-white hover:bg-secondary-dark">
                    Create Account
                  </Link>
                )}
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <img
                className="w-full rounded-lg shadow-xl"
                src="/images/hero-image.jpg"
                alt="Sports facility booking"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow">
              <FaUniversity className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.universities}</h3>
              <p className="text-gray-600">Universities</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow">
              <FaBuilding className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.facilities}</h3>
              <p className="text-gray-600">Facilities</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow">
              <FaCalendarAlt className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.activeBookings}</h3>
              <p className="text-gray-600">Active Bookings</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow">
              <FaUsers className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.users}</h3>
              <p className="text-gray-600">Users</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured universities */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Universities</h2>
            <p className="text-xl text-gray-600 mt-4">
              Discover top universities with excellent sports facilities
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredUniversities.map(university => (
              <Link
                key={university._id}
                to={`/universities/${university._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <img
                    src={university.logo}
                    alt={university.name}
                    className="h-32 w-32 object-contain"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{university.name}</h3>
                  <p className="text-gray-600 mt-2">{university.address.city}, {university.address.country}</p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/universities" className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
              View all universities
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* How it works */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600 mt-4">
              Book your preferred sports facility in just a few steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Choose a University</h3>
              <p className="text-gray-600">
                Browse our list of partner universities and select the one you want to visit.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Select a Facility</h3>
              <p className="text-gray-600">
                Explore available sports facilities and find the perfect one for your activity.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Book & Pay</h3>
              <p className="text-gray-600">
                Choose your time slot, make a payment, and receive your booking confirmation with QR code.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="btn-primary">
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Home;