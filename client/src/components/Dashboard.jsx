import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-900 mb-6">Dashboard</h1>
      {/* Configure plants Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Configure plants data ingestion</h2>
        <div className="mt-4">
          <p className="text-gray-600 mb-4">
            Go to the configuration page to manage API access and infrastructure settings.
          </p>
          <Link
            to="/configure-plants"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Go to Configuration
          </Link>
        </div>
      </div>

      {/* Plants Overview Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Plants Overview</h2>
        <div className="mt-4">
          <p className="text-gray-600 mb-4">
            View all your plants, devices, and alarm settings in a single place.
          </p>
          <Link
            to="/plants-overview"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Go to Overview
          </Link>
        </div>
      </div>

      {/* Plants Ingestion Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Ingest data for plants</h2>
        <div className="mt-4">
          <p className="text-gray-600 mb-4">
            View all your plants and upload availble data.
          </p>
          <Link
            to="/plants-ingestion"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Go to plant ingestion
          </Link>
        </div>
      </div>

      {/* Solar Yield Button */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">View reports for all plants</h2>
        <div className="mt-4">
           <p className="text-gray-600 mb-4">
            View or download reports for all installed plants.
          </p>
          <Link
            to="/aggregated_report"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            View reports
          </Link>
        </div>
      </div>

      {/* Set Threshold Button */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Configure alarms thresholds</h2>
        <div className="mt-4">
           <p className="text-gray-600 mb-4">
            Configure or modify alarms thresholds.
          </p>
          <Link
            to="/alarm_settings"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            View reports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
