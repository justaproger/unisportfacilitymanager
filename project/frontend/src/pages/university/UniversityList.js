import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { FaUniversity, FaBuilding, FaSearch, FaFilter, FaMapMarkerAlt } from 'react-icons/fa';

const UniversityList = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchUniversities = async () => {
      // In a real app, this would be an actual API call
      // For demo purposes, we'll simulate with static data
      
      setTimeout(() => {
        const mockUniversities = [
          {
            _id: '1',
            name: 'Moscow State University',
            address: { city: 'Moscow', country: 'Russia' },
            contact: { email: 'info@msu.ru', phone: '+7 123 456 7890', website: 'https://www.msu.ru' },
            logo: 'https://via.placeholder.com/150',
            facilitiesCount: 12
          },
          {
            _id: '2',
            name: 'Saint Petersburg University',
            address: { city: 'Saint Petersburg', country: 'Russia' },
            contact: { email: 'info@spbu.ru', phone: '+7 123 456 7891', website: 'https://www.spbu.ru' },
            logo: 'https://via.placeholder.com/150',
            facilitiesCount: 8
          },
          {
            _id: '3',
            name: 'Novosibirsk State University',
            address: { city: 'Novosibirsk', country: 'Russia' },
            contact: { email: 'info@nsu.ru', phone: '+7 123 456 7892', website: 'https://www.nsu.ru' },
            logo: 'https://via.placeholder.com/150',
            facilitiesCount: 5
          },
          {
            _id: '4',
            name: 'Kazan Federal University',
            address: { city: 'Kazan', country: 'Russia' },
            contact: { email: 'info@kfu.ru', phone: '+7 123 456 7893', website: 'https://www.kfu.ru' },
            logo: 'https://via.placeholder.com/150',
            facilitiesCount: 7
          },
          {
            _id: '5',
            name: 'Far Eastern Federal University',
            address: { city: 'Vladivostok', country: 'Russia' },
            contact: { email: 'info@fefu.ru', phone: '+7 123 456 7894', website: 'https://www.fefu.ru' },
            logo: 'https://via.placeholder.com/150',
            facilitiesCount: 6
          },
          {
            _id: '6',
            name: 'Ural Federal University',
            address: { city: 'Yekaterinburg', country: 'Russia' },
            contact: { email: 'info@urfu.ru', phone: '+7 123 456 7895', website: 'https://www.urfu.ru' },
            logo: 'https://via.placeholder.com/150',
            facilitiesCount: 9
          }
        ];
        
        setUniversities(mockUniversities);
        setFilteredUniversities(mockUniversities);
        
        // Extract unique countries and cities for filters
        const uniqueCountries = [...new Set(mockUniversities.map(uni => uni.address.country))];
        setCountries(uniqueCountries);
        
        const uniqueCities = [...new Set(mockUniversities.map(uni => uni.address.city))];
        setCities(uniqueCities);
        
        setLoading(false);
      }, 1000);
    };
    
    fetchUniversities();
  }, []);

  // Apply filters when search term, country, or city changes
  useEffect(() => {
    if (universities.length === 0) return;
    
    let results = [...universities];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(uni => 
        uni.name.toLowerCase().includes(term) || 
        uni.address.city.toLowerCase().includes(term) ||
        uni.address.country.toLowerCase().includes(term)
      );
    }
    
    // Apply country filter
    if (countryFilter) {
      results = results.filter(uni => uni.address.country === countryFilter);
    }
    
    // Apply city filter
    if (cityFilter) {
      results = results.filter(uni => uni.address.city === cityFilter);
    }
    
    setFilteredUniversities(results);
  }, [searchTerm, countryFilter, cityFilter, universities]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setCountryFilter('');
    setCityFilter('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Universities</h1>
            <p className="text-gray-600 mt-2">
              Browse and find universities with sports facilities available for booking
            </p>
          </div>
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-8 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    placeholder="Search universities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Country filter */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  className="form-select"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                >
                  <option value="">All Countries</option>
                  {countries.map((country, index) => (
                    <option key={index} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              
              {/* City filter */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <select
                  id="city"
                  className="form-select"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {cities.map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
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
          
          {/* University List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredUniversities.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <FaUniversity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No universities found</h3>
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
              {filteredUniversities.map(university => (
                <Link
                  key={university._id}
                  to={`/universities/${university._id}`}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
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
                    <div className="flex items-center text-gray-600 mt-2">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{university.address.city}, {university.address.country}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mt-2">
                      <FaBuilding className="mr-1" />
                      <span>{university.facilitiesCount} facilities available</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UniversityList;