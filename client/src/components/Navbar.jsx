import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-green-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Links */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white text-lg font-semibold hover:text-green-200 transition">
              Home
            </Link>
            <Link to="/register" className="text-white text-lg font-semibold hover:text-green-200 transition">
              Register
            </Link>
            <Link to="/login" className="text-white text-lg font-semibold hover:text-green-200 transition">
              Login
            </Link>
            <Link to="/about" className="text-white text-lg font-semibold hover:text-green-200 transition">
              About
            </Link>
          </div>

          {/* Right side (future space for buttons, profile, etc.) */}
          <div>
            {/* Placeholder for future logged-in user controls */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
