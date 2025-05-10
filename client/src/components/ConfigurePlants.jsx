import React, { useState } from "react";

const ConfigurePlants = () => {
  const [ingestionType, setIngestionType] = useState("api");

  // Placeholder plants list
  const plants = [
    { id: 1, name: "Plant A", ingestion: "API Key", threshold: "90%" },
    { id: 2, name: "Plant B", ingestion: "AWS S3", threshold: "85%" },
    { id: 3, name: "Plant C", ingestion: "API Key", threshold: "88%" },
    { id: 4, name: "Plant D", ingestion: "AWS S3", threshold: "80%" },
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-purple-800 mb-6">Configure Plant</h1>

      {/* Scrollable Plant Cards */}
      <div className="overflow-x-auto mb-10">
        <div className="flex space-x-4 w-max">
          {plants.map((plant) => (
            <div
              key={plant.id}
              className="min-w-[300px] bg-white shadow-md rounded-lg p-4 border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-gray-800">{plant.name}</h3>
              <p className="text-sm text-gray-600">Ingestion: {plant.ingestion}</p>
              <p className="text-sm text-gray-600">Alert Threshold: {plant.threshold}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Plant Form */}
      <form className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-700">Add New Plant</h2>

        {/* Plant Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Plant Name</label>
          <input
            type="text"
            placeholder="e.g., Rooftop Solar Plant"
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        {/* Alert Threshold */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Alert Threshold (placeholder)</label>
          <input
            type="text"
            placeholder="e.g., 85%"
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        {/* Ingestion Type Selector */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Ingestion Type</label>
          <select
            value={ingestionType}
            onChange={(e) => setIngestionType(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="api">API Key</option>
            <option value="s3">AWS S3</option>
          </select>
        </div>

        {/* Conditional Form Sections */}
        {ingestionType === "api" && (
          <div className="border p-4 rounded bg-purple-50">
            <h3 className="font-semibold mb-2">API Key Settings</h3>
            <p className="text-sm text-gray-600">This is a placeholder. You will be able to generate and manage API keys.</p>
          </div>
        )}

        {ingestionType === "s3" && (
          <div className="border p-4 rounded bg-yellow-50">
            <h3 className="font-semibold mb-2">AWS S3 Settings</h3>
            <p className="text-sm text-gray-600">This is a placeholder. You will be able to set bucket name, region, access key, etc.</p>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
          >
            Save Plant
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigurePlants;
