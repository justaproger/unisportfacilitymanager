import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUniversity, 
  FaBuilding, 
  FaCalendarAlt, 
  FaUsers, 
  FaChartBar, 
  FaQrcode, 
  FaUser, 
  FaCog, 
  FaAngleLeft,
  FaAngleRight
} from 'react-icons/fa';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const userMenuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <FaTachometerAlt />
    },
    {
      path: '/my-bookings',
      name: 'My Bookings',
      icon: <FaCalendarAlt />
    },
    {
      path: '/profile',
      name: 'Profile',
      icon: <FaUser />
    }
  ];

  const adminMenuItems = [
    {
      path: '/admin',
      name: 'Admin Dashboard',
      icon: <FaTachometerAlt />
    },
    {
      path: '/admin/universities',
      name: 'Universities',
      icon: <FaUniversity />,
      allowedRoles: ['super-admin']
    },
    {
      path: '/admin/facilities',
      name: 'Facilities',
      icon: <FaBuilding />
    },
    {
      path: '/admin/bookings',
      name: 'Bookings',
      icon: <FaCalendarAlt />
    },
    {
      path: '/admin/users',
      name: 'Users',
      icon: <FaUsers />
    },
    {
      path: '/admin/statistics',
      name: 'Statistics',
      icon: <FaChartBar />
    },
    {
      path: '/admin/scanner',
      name: 'QR Scanner',
      icon: <FaQrcode />
    },
    {
      path: '/profile',
      name: 'Profile',
      icon: <FaCog />
    }
  ];

  const menuItems = ['admin', 'super-admin'].includes(role) ? adminMenuItems : userMenuItems;

  return (
    <aside className={`bg-gray-800 text-white ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Link to="/" className="flex items-center">
            {!collapsed && (
              <span className="text-lg font-bold ml-2">UniSportManager</span>
            )}
            {collapsed && (
              <span className="text-lg font-bold">USM</span>
            )}
          </Link>
          <button
            className="p-1 rounded-full hover:bg-gray-700 focus:outline-none"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <FaAngleRight /> : <FaAngleLeft />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-2 px-2">
            {menuItems.map((item, index) => {
              // Skip items not allowed for current role
              if (item.allowedRoles && !item.allowedRoles.includes(role)) {
                return null;
              }

              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-md ${
                      isActive(item.path) 
                        ? 'bg-primary text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    } transition-colors duration-200`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {!collapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            {!collapsed && (
              <>
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src="https://via.placeholder.com/100"
                    alt="User avatar"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{role === 'admin' ? 'Administrator' : role === 'super-admin' ? 'Super Admin' : 'User'}</p>
                </div>
              </>
            )}
            {collapsed && (
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src="https://via.placeholder.com/100"
                  alt="User avatar"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;