import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { 
  FaUniversity, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaGlobe, 
  FaBuilding,
  FaFilter,
  FaSearch,
  FaSwimmingPool,
  FaFootballBall,
  FaBasketballBall,
  FaTableTennis,
  FaDumbbell
} from 'react-icons/fa';

const UniversityDetail = () => {
  const { id } = useParams();
  const [university, setUniversity] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [filteredFacilities, setFilteredFacilities] = useState([]);

  useEffect(() => {
    const fetchUniversityData = async () => {
      try {
        // In a real app, these would be actual API calls
        // For demo purposes, we'll simulate with static data
        
        setTimeout(() => {
          // Mock university data
          const mockUniversity = {
            _id: id,
            name: 'Moscow State University',
            address: {
              street: 'Leninskiye Gory, 1',
              city: 'Moscow',
              state: 'Moscow',
              zipCode: '119991',
              country: 'Russia'
            },
            contact: {
              email: 'info@msu.ru',
              phone: '+7 (495) 939-10-00',
              website: 'https://www.msu.ru'
            },
            logo: 'https://via.placeholder.com/200',
            description: 'Lomonosov Moscow State University is one of Russia\'s oldest and largest universities, offering world-class education and research facilities. The sports complex at MSU provides a wide range of facilities for students and staff.'
          };
          
          // Mock facilities data
          const mockFacilities = [
            {
              _id: '1',
              name: 'Main Football Field',
              type: 'football_field',
              description: 'Professional football field with natural grass and seating for spectators.',
              images: ['https://via.placeholder.com/300x200'],
              pricePerHour: 5000,
              currency: 'RUB',
              capacity: 22,
              amenities: ['Changing rooms', 'Showers', 'Floodlights', 'Equipment rental']
            },
            {
              _id: '2',
              name: 'Olympic Swimming Pool',
              type: 'swimming_pool',
              description: 'Indoor 50-meter pool with 8 lanes, suitable for competitions and training.',
              images: ['https://via.placeholder.com/300x200'],
              pricePerHour: 3000,
              currency: 'RUB',
              capacity: 40,
              amenities: ['Changing rooms', 'Showers', 'Lockers', 'Lifeguards']
            },
            {
              _id: '3',
              name: 'Basketball Court A',
              type: 'basketball_court',
              description: 'Indoor basketball court with professional flooring and equipment.',
              images: ['https://via.placeholder.com/300x200'],
              pricePerHour: 2000,
              currency: 'RUB',
              capacity: 10,
              amenities: ['Changing rooms', 'Showers', 'Equipment rental']
            },
            {
              _id: '4',
              name: 'Tennis Court Complex',
              type: 'tennis_court',
              description: 'Four outdoor clay tennis courts with lighting for evening play.',
              images: ['https://via.placeholder.com/300x200'],
              pricePerHour: 1500,
              currency: 'RUB',
              capacity: 4,
              amenities: ['Changing rooms', 'Equipment rental', 'Coaching available']
            },
            {
              _id: '5',
              name: 'University Gym',
              type: 'gym',
              description: 'Modern fitness center with cardio and weight training equipment.',
              images: ['https://via.placeholder.com/300x200'],
              pricePerHour: 500,
              currency: 'RUB',
              capacity: 50,
              amenities: ['Personal trainers', 'Locker rooms', 'Showers', 'Towel service']
            }
          ];
          
          setUniversity(mockUniversity);
          setFacilities(mockFacilities);
          setFilteredFacilities(mockFacilities);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching university data:', error);
        setLoading(false);
      }
    };
    
    fetchUniversityData();
  }, [id]);

  // Apply filters when search term or type changes
  useEffect(() => {
    if (facilities.length === 0) return;
    
    let results = [...facilities];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(facility => 
        facility.name.toLowerCase().includes(term) || 
        facility.description.toLowerCase().includes(term)
      );
    }
    
    // Apply facility type filter
    if (typeFilter) {
      results = results.filter(facility => facility.type === typeFilter);
    }
    
    setFilteredFacilities(results);
  }, [searchTerm, typeFilter, facilities]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
  };

  // Helper function to get icon for facility type
  const getFacilityTypeIcon = (type) => {
    switch (type) {
      case 'football_field':
        return <FaFootballBall />;
      case 'basketball_court':
        return <FaBasketballBall />;
      case 'tennis_court':
        return <FaTableTennis />;
      case 'swimming_pool':
        return <FaSwimmingPool />;
      case 'gym':
        return <FaDumbbell />;
      default:
        return <FaBuilding />;
    }
  };

  // Helper function to get display name for facility type
  const getFacilityTypeName = (type) => {
    const typeMap = {
      football_field: 'Football Field',
      basketball_court: 'Basketball Court',
      tennis_court: 'Tennis Court',
      swimming_pool: 'Swimming Pool',
      gym: 'Gym',
      track_field: 'Track & Field',
      volleyball_court: 'Volleyball Court',
      other: 'Other'
    };
    return typeMap[type] || type;
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    const currencySymbols = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    
    return `${amount} ${currencySymbols[currency] || currency}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!university) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <FaUniversity className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-2 text-lg font-medium text-gray-900">University not found</h2>
              <p className="mt-1 text-sm text-gray-500">
                The university you're looking for does not exist or has been removed.
              </p>
              <div className="mt-6">
                <Link
                  to="/universities"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Back to Universities
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        {/* University Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                <img
                  src={university.logo}
                  alt={university.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900">{university.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center mt-3">
                  <div className="flex items-center justify-center sm:justify-start mb-2 sm:mb-0 sm:mr-6">
                    <FaMapMarkerAlt className="text-gray-500 mr-1" />
                    <span className="text-gray-600">
                      {university.address.city}, {university.address.country}
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <FaBuilding className="text-gray-500 mr-1" />
                    <span className="text-gray-600">
                      {facilities.length} facilities available
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center sm:justify-start">
                  {university.contact.phone && (
                    <div className="flex items-center mb-2 sm:mb-0 sm:mr-6">
                      <FaPhone className="text-gray-500 mr-1" />
                      <a href={`tel:${university.contact.phone}`} className="text-primary hover:text-primary-dark">
                        {university.contact.phone}
                      </a>
                    </div>
                  )}
                  {university.contact.email && (
                    <div className="flex items-center mb-2 sm:mb-0 sm:mr-6">
                      <FaEnvelope className="text-gray-500 mr-1" />
                      <a href={`mailto:${university.contact.email}`} className="text-primary hover:text-primary-dark">
                        {university.contact.email}
                      </a>
                    </div>
                  )}
                  {university.contact.website && (
                    <div className="flex items-center">
                      <FaGlobe className="text-gray-500 mr-1" />
                      <a href={university.contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* University Description */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">About {university.name}</h2>
            <p className="text-gray-600">{university.description}</p>
          </div>
          
          {/* Facilities Section */}
          <h2 className="text-2xl font-bold mb-6">Available Facilities</h2>
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-8 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="form-input pl-10"
                    placeholder="Search facilities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Facility type filter */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Type
                </label>
                <select
                  id="type"
                  className="form-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="football_field">Football Field</option>
                  <option value="basketball_court">Basketball Court</option>
                  <option value="tennis_court">Tennis Court</option>
                  <option value="swimming_pool">Swimming Pool</option>
                  <option value="gym">Gym</option>
                  <option value="track_field">Track & Field</option>
                  <option value="volleyball_court">Volleyball Court</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              {/* Reset filters */}
              <div className="flex items-end">
                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={resetFilters}
                >
                  <FaFilter className="mr-2" />
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
          
          {/* Facilities List */}
          {filteredFacilities.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <FaBuilding className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No facilities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={resetFilters}
                >
                  Reset all filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map(facility => (
                <div
                  key={facility._id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gray-200 relative">
                    {facility.images && facility.images.length > 0 ? (
                      <img
                        src={facility.images[0]}
                        alt={facility.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-300">
                        <FaBuilding className="text-gray-500 text-4xl" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getFacilityTypeIcon(facility.type)}
                        <span className="ml-1">{getFacilityTypeName(facility.type)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{facility.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {facility.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(facility.pricePerHour, facility.currency)} / hour
                      </div>
                      <Link
                        to={`/facilities/${facility._id}/book`}
                        className="btn-primary"
                      >
                        Book Now
                      </Link>
                    </div>
                    <div className="mt-4">
                      <Link
                        to={`/facilities/${facility._id}`}
                        className="text-primary text-sm hover:text-primary-dark"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UniversityDetail;