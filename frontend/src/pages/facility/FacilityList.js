import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { FaBuilding, FaFilter, FaSearch, FaMapMarkerAlt, FaUniversity } from 'react-icons/fa';

const FacilityList = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacilitiesAndUniversities = async () => {
      try {
        setLoading(true);
        // Fetch facilities with populated university data
        const facilitiesResponse = await axios.get('/api/facilities');
        
        // Ensure we have an array of facilities
        const facilitiesData = Array.isArray(facilitiesResponse.data) 
          ? facilitiesResponse.data 
          : [];
          
        setFacilities(facilitiesData);
        setFilteredFacilities(facilitiesData);
        
        // Extract unique universities for filter dropdown
        const universityIds = new Set();
        const universityList = [];
        
        facilitiesData.forEach(facility => {
          if (!facility.university) return;
          
          // Check if university data is an object with _id or just an id reference
          const universityId = facility.university._id || facility.university;
          
          if (!universityIds.has(universityId)) {
            universityIds.add(universityId);
            
            // If university data is already populated
            if (facility.university._id) {
              universityList.push({
                _id: facility.university._id,
                name: facility.university.name
              });
            } else {
              // If we only have the ID, we need to fetch university data
              // This is optional and depends on your API structure
              universityList.push({
                _id: facility.university,
                name: 'Loading...' // Placeholder until we fetch the name
              });
            }
          }
        });

        // If universities are not populated in facility data, fetch them
        if (universityList.some(uni => uni.name === 'Loading...')) {
          try {
            const universityResponse = await axios.get('/api/universities');
            
            // Ensure we have an array of universities
            const universitiesData = Array.isArray(universityResponse.data) 
              ? universityResponse.data 
              : [];
            
            // Update university names in our list
            const updatedUniversityList = universityList.map(uni => {
              if (uni.name === 'Loading...') {
                const foundUniversity = universitiesData.find(u => u._id === uni._id);
                return {
                  _id: uni._id,
                  name: foundUniversity ? foundUniversity.name : 'Unknown University'
                };
              }
              return uni;
            });
            
            setUniversities(updatedUniversityList);
          } catch (error) {
            console.error('Error fetching universities:', error);
            setUniversities(universityList);
          }
        } else {
          setUniversities(universityList);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load facilities. Please try again later.');
        setFacilities([]);
        setFilteredFacilities([]);
        setLoading(false);
      }
    };
    
    fetchFacilitiesAndUniversities();
  }, []);

  // Apply filters when search term, type, or university changes
  useEffect(() => {
    if (facilities.length === 0) return;
    
    let results = [...facilities];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(facility => 
        (facility.name && facility.name.toLowerCase().includes(term)) || 
        (facility.description && facility.description.toLowerCase().includes(term)) ||
        (facility.university && facility.university.name && facility.university.name.toLowerCase().includes(term))
      );
    }
    
    // Apply facility type filter
    if (typeFilter) {
      results = results.filter(facility => facility.type === typeFilter);
    }
    
    // Apply university filter
    if (universityFilter) {
      results = results.filter(facility => {
        if (!facility.university) return false;
        
        // Check if university is an object with _id or just an id reference
        const universityId = facility.university._id || facility.university;
        return universityId === universityFilter;
      });
    }
    
    setFilteredFacilities(results);
  }, [searchTerm, typeFilter, universityFilter, facilities]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setUniversityFilter('');
  };

  // Helper function to get facility type display name
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
    return typeMap[type] || type || 'Unknown';
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    const currencySymbols = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    
    if (!amount) return 'Price not available';
    return `${amount} ${currencySymbols[currency] || currency || ''}`;
  };

  // Helper to safely access nested properties
  const getUniversityName = (facility) => {
    if (!facility || !facility.university) return 'Unknown University';
    return facility.university.name || 'Unknown University';
  };

  const getUniversityLocation = (facility) => {
    if (!facility || !facility.university || !facility.university.address) {
      return 'Location not specified';
    }
    
    const { city, country } = facility.university.address;
    return `${city || ''}, ${country || ''}`.trim() || 'Location not specified';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sports Facilities</h1>
            <p className="text-gray-600 mt-2">
              Browse and find sports facilities available for booking
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
              
              {/* University filter */}
              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                  University
                </label>
                <select
                  id="university"
                  className="form-select"
                  value={universityFilter}
                  onChange={(e) => setUniversityFilter(e.target.value)}
                >
                  <option value="">All Universities</option>
                  {universities.map(university => (
                    <option key={university._id} value={university._id}>
                      {university.name}
                    </option>
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
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {/* Facilities List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : !Array.isArray(filteredFacilities) || filteredFacilities.length === 0 ? (
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
                        {getFacilityTypeName(facility.type)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{facility.name || 'Unnamed Facility'}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <FaUniversity className="mr-1" />
                      <span>{getUniversityName(facility)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{getUniversityLocation(facility)}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {facility.description || 'No description available'}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(facility.pricePerHour, facility.currency)} / hour
                      </div>
                      <Link
                        to={`/facilities/${facility._id}`}
                        className="btn-primary"
                      >
                        View Details
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

export default FacilityList;