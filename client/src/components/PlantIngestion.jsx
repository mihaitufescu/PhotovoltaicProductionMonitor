import React, { useEffect, useState } from 'react';
import { getPlantOverview, uploadPlantData } from '../services/api';

const PlantIngestion = () => {
  const [plants, setPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const data = await getPlantOverview();
        setPlants(data);
      } catch (error) {
        console.error('Failed to load plants:', error);
      }
    };

    fetchPlants();
  }, []);

  const handleUpload = async () => {
    if (!selectedPlantId || !file) {
      setMessage('❌ Please select a plant and a file.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const response = await uploadPlantData(selectedPlantId, file);
      setMessage(`✅ ${response.message || 'Upload successful'}`);
    } catch (error) {
      const errorMsg = error.response?.data?.error || '❌ Upload failed. Try again.';
      setMessage(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const exampleJSON = {
      total_string_capacity_kwp: 120.5,
      yield_kwh: 360,
      total_yield_kwh: 8500,
      specific_energy_kwh_per_kwp: 4.2,
      peak_ac_power_kw: 78.3,
      grid_connection_duration_h: 23.5,
      read_date: '2025-05-23'
  };

  const exampleCSV = `total_string_capacity_kwp,yield_kwh,total_yield_kwh,specific_energy_kwh_per_kwp,peak_ac_power_kw,grid_connection_duration_h,read_date
120.5,360,8500,4.2,78.3,23.5,2025-05-23`;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload CSV/JSON to a Plant</h2>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Plant:</label>
        <select
          value={selectedPlantId}
          onChange={(e) => setSelectedPlantId(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        >
          <option value="">-- Select a plant --</option>
          {plants.map((plantObj) => (
            <option key={plantObj.plant.id} value={plantObj.plant.id}>
              {plantObj.plant.plant_name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Select File (CSV or JSON):</label>
        <input
          type="file"
          accept=".csv,application/json"
          onChange={(e) => setFile(e.target.files[0])}
          className="block"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {message && (
        <p className="mt-4 text-sm">
          {message.startsWith('✅') ? (
            <span className="text-green-600">{message}</span>
          ) : (
            <span className="text-red-600">{message}</span>
          )}
        </p>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">📄 Example JSON Format:</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(exampleJSON, null, 2)}
        </pre>

        <h3 className="text-lg font-semibold mt-6 mb-2">📄 Example CSV Format:</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {exampleCSV}
        </pre>
        <h3 className="text-lg font-semibold mt-6 mb-2">🔐 Custom API Access (Advanced):</h3>
        <p className="text-sm mb-2">
        You can also make ingestion requests manually using following properties:
        </p>
        <ul className="text-sm list-disc pl-6 mb-4">
        <li>
            <strong>Endpoint:</strong>{' '}
            <code>POST http://localhost:8000/api/plants/custom_ingest/</code>
        </li>
        <li>
            <strong>Header:</strong>{' '}
            <code>X-API-KEY: &lt;your-plant-api-key&gt;</code>
        </li>
        <li>
            <strong>Content-Type:</strong> <code>application/json</code>
        </li>
        <li>
            <strong>Body:</strong> JSON structure like this:
        </li>
        </ul>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {`{
            "data" : {
              "total_string_capacity_kwp": 120.5,
              "yield_kwh": 360,
              "total_yield_kwh": 8500,
              "specific_energy_kwh_per_kwp": 4.2,
              "peak_ac_power_kw": 78.3,
              "grid_connection_duration_h": 23.5,
              "read_date": "2025-05-23"
            }
      }`}
        </pre>
        <p className="text-xs mt-2 italic text-gray-500">
        Replace the values with your actual data. The API key is unique per plant and must be authorized on the server.
        </p>
    </div>
    </div>
  );
};

export default PlantIngestion;
