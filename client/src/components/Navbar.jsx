import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 shadow-md border-b-2 border-green-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 rounded-b-md">
          {/* Left side - Links */}
          <div className="flex items-center space-x-6">
            {[
              { to: "/", label: "Home" },
              { to: "/register", label: "Register" },
              { to: "/login", label: "Login" },
              { to: "/about", label: "About" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="relative text-white text-lg font-semibold hover:text-green-200 transition-colors duration-300"
              >
                {label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-green-200 transition-all duration-300 hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Right side (future space for buttons, profile, etc.) */}
          <div>{/* Placeholder for future logged-in user controls */}</div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
