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
        console.error('Eroare incărcare parcuri:', error);
      }
    };

    fetchPlants();
  }, []);

  const handleUpload = async () => {
    if (!selectedPlantId || !file) {
      setMessage('Selectează și un fișier');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const response = await uploadPlantData(selectedPlantId, file);
      setMessage(`Succes: Încărcat cu succes`);
    } catch (error) {
      const errorMsg = 'Eroare încărcare. Încearcă mai târziu';
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
      <h2 className="text-2xl text-gray-600 font-bold mb-4">Încarcă un fișier CSV/JSON</h2>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Selectază parc:</label>
        <select
          value={selectedPlantId}
          onChange={(e) => setSelectedPlantId(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        >
          <option value="">-- Selectază un parc --</option>
          {plants.map((plantObj) => (
            <option key={plantObj.plant.id} value={plantObj.plant.id}>
              {plantObj.plant.plant_name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <label className="cursor-pointer bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition">
          Selectează fișierul CSV sau JSON
          <input
            type="file"
            accept=".csv,application/json"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className={`px-4 py-2 rounded transition 
            ${uploading || !file ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {uploading ? 'Se încarcă...' : 'Încarcă'}
        </button>
      </div>

      {message && (
        <p className="mt-4 text-sm">
          {message.startsWith('Succes') ? (
            <span className="text-green-600">{message}</span>
          ) : (
            <span className="text-red-600">{message}</span>
          )}
        </p>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Exemplu format JSON:</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(exampleJSON, null, 2)}
        </pre>

        <h3 className="text-lg font-semibold mt-6 mb-2">Exemplu format CSV:</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {exampleCSV}
        </pre>
        <h3 className="text-lg font-semibold mt-6 mb-2">Acess API:</h3>
        <p className="text-sm mb-2">
        Poți să faci cereri din propriul sistem urmând exemplul:
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
            <strong>Body:</strong> Structura fișierului:
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
        Cheia de API este unică per parc.
        </p>
    </div>
    </div>
  );
};

export default PlantIngestion;
