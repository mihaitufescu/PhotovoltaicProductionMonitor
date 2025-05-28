import { Link, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { Settings } from 'lucide-react';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 shadow-md border-b-2 border-green-500">
      <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 rounded-b-md">
          {/* Left side */}
          <div className="flex items-center space-x-6">
            <span className="text-white text-xl font-bold tracking-wide leading-none">
              PhotovoltaicMonitor
            </span>
            <Link to="/" className="text-white text-lg font-semibold hover:text-green-200 transition-colors duration-300">
              Home
            </Link>
            {user && (
              <>
              <Link to="/dashboard" className="text-white text-lg font-semibold hover:text-green-200 transition-colors duration-300">
                Dashboard
              </Link>
              <Link to="/estimate-pv" className="text-white text-lg font-semibold hover:text-green-200 transition-colors duration-300">
                Production estimator
              </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {!user && (
              <>
                <Link to="/register" className="text-white text-lg font-semibold hover:text-green-200 transition-colors duration-300">
                  Register
                </Link>
                <Link to="/login" className="text-white text-lg font-semibold hover:text-green-200 transition-colors duration-300">
                  Login
                </Link>
              </>
            )}
            {user && (
              <>
              <Link
                to="/settings"
                className="flex items-center gap-1 text-white font-semibold bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors duration-300"
              >
                <Settings size={18} />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="text-white font-semibold bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition-colors duration-300"
              >
                Logout
              </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
