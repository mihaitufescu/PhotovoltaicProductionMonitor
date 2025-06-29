import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-gray-600 mb-6">Panou de control</h1>
      {/* Configure plants Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Configureză ingestia de date</h2>
        <div className="mt-4">
          <p className="text-gray-600 mb-4">
            Setează parcul tau si obtine o cheie de API pentru procese automate de încărcare de date.
          </p>
          <Link
            to="/configure-plants"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Setează
          </Link>
        </div>
      </div>

      {/* Plants Overview Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Ansamblu general de parcuri</h2>
        <div className="mt-4">
          <p className="text-gray-600 mb-4">
            Vizualizează parcurile existente, dispozitivele asociate și setările de alertare.
          </p>
          <Link
            to="/plants-overview"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Vizualizează
          </Link>
        </div>
      </div>

      {/* Plants Ingestion Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Încarcă date asociate parcurilor</h2>
        <div className="mt-4">
          <p className="text-gray-600 mb-4">
            Selectează un parc și încarcă date sau informează-te despre cum poți să automtizezi procesul de ingestie de date.
          </p>
          <Link
            to="/plants-ingestion"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Încarcă
          </Link>
        </div>
      </div>

      {/* Solar Yield Button */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Vezi raporte de producție</h2>
        <div className="mt-4">
           <p className="text-gray-600 mb-4">
            Vezi raporte de producție sau descarcă.
          </p>
          <Link
            to="/aggregated_report"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Vizualizează
          </Link>
        </div>
      </div>

      {/* Set Threshold Button */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Setează praguri de alertare</h2>
        <div className="mt-4">
           <p className="text-gray-600 mb-4">
            Setează praguri de alertare sau modifică proprietățile existente.
          </p>
          <Link
            to="/alarm_settings"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Setează
          </Link>
        </div>
      </div>

      {/* Set System Availability Button */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">Vezi gradul de disponibilitate al sistemului</h2>
        <div className="mt-4">
          <Link
            to="/system_availability"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Vizualizează
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
