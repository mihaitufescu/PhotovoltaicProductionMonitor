import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-green-900 mb-6">Dashboard</h1>

      {/* Overview Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Overview</h2>
        <div className="mt-4">
          <p className="text-lg">Number of Plants: <span className="font-bold">3</span></p>
          <p className="text-lg">Total Yield: <span className="font-bold">1200 kWh</span></p>
        </div>
      </div>

      {/* Solar Yield Button */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Today's Solar Yield</h2>
        <div className="mt-4">
          <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
            View Today's Yield
          </button>
        </div>
      </div>

      {/* Set Threshold Button */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Set Threshold</h2>
        <div className="mt-4">
          <button className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600">
            Set Yield Threshold
          </button>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">User Management</h2>
        <div className="mt-4">
          <Link
            to="/user-settings"
            className="text-green-600 hover:text-green-800 font-medium"
          >
            User Settings (Coming Soon)
          </Link>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Additional Info</h2>
        <div className="mt-4">
          <p className="text-lg">Placeholder for more information about the system.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
