import React, { useEffect, useState } from "react";
import { getPlantOverview } from "../services/api";  // Assuming the API call is imported
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [overview, setOverview] = useState({
    total_plants: 0,
    active: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlantOverview = async () => {
      try {
        const response = await getPlantOverview();
        console.log(response);
        setOverview(response); // Assuming the response has { total_plants, active, inactive }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch plant overview.");
        setLoading(false);
      }
    };

    fetchPlantOverview();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-green-900 mb-6">Dashboard</h1>

      {/* Overview Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Overview</h2>
        {overview && (
          <div className="mt-4">
            <p className="text-lg">Number of Plants: <span className="font-bold">{overview.total_plants}</span></p>
            <p className="text-lg">Active Plants: <span className="font-bold">{overview.active}</span></p>
            <p className="text-lg">Inactive Plants: <span className="font-bold">{overview.inactive}</span></p>
          </div>
        )}
      </div>
      
      {/* Configure plants Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Configure plants data ingestion</h2>
        <div className="mt-4">
        <p className="text-gray-600 mb-4">
        Go to the configuration page to manage API access and infrastructure settings.
        </p>
        <Link
          to="/configure-plants"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
        >
        Go to Configuration
        </Link>
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
