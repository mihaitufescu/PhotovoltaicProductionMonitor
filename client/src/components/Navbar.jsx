import { Link, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 rounded-b-md">
          {/* Left side */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-white text-lg font-semibold hover:text-green-200 transition-colors duration-300">
              Home
            </Link>
            <Link to="/about" className="text-white text-lg font-semibold hover:text-green-200 transition-colors duration-300">
              About
            </Link>
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
              <button
                onClick={handleLogout}
                className="text-white font-semibold bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition-colors duration-300"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
