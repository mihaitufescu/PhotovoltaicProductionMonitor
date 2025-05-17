import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { deletePlant } from '../services/api';
import { getPlantOverview } from '../services/api';

const PlantOverview = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDeletePlant = async (plantId) => {
    if (!window.confirm('Are you sure you want to delete this plant?')) return;

    try {
        await deletePlant(plantId);
        setPlants(plants.filter(p => p.plant.id !== plantId));
    } catch (error) {
        alert('Failed to delete plant. Try again.');
    }
  };

  useEffect(() => {
    const fetchPlants = async () => {
        try {
        const data = await getPlantOverview();
        setPlants(data);
        } catch (error) {
        console.error('Error fetching plant overview:', error);
        } finally {
        setLoading(false);
        }
    };

        fetchPlants();
    }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Plants Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plants.map((plantObj, index) => (
          <div key={index} className="border rounded-2xl shadow p-4 bg-white">
            <h3 className="text-xl font-semibold mb-2">
              {plantObj.plant.plant_name}
            </h3>
            <p><strong>ID:</strong> {plantObj.plant.id}</p>
            <p><strong>Ingestion Type:</strong> {plantObj.plant.ingestion_type}</p>
            <p><strong>Devices Count:</strong> {plantObj.plant.devices_count}</p>

            <div className="mt-2">
              <strong>Devices:</strong>
              {plantObj.devices.length > 0 ? (
                <ul className="list-disc ml-5">
                  {plantObj.devices.map((device) => (
                    <li key={device.id}>
                      {device.name} ({device.device_type}) — SN: {device.serial_number}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No devices.</p>
              )}
            </div>

            <div className="mt-2">
              <strong>Alarm Settings:</strong>
              {plantObj.alarm_settings ? (
                <p>
                  Threshold: {plantObj.alarm_settings.threshold_value}, Type: {plantObj.alarm_settings.metric_type}
                </p>
              ) : (
                <p className="text-gray-500">No alarm settings.</p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                    onClick={() => handleDeletePlant(plantObj.plant.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                    Delete Plant
                </button>

                <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-lg text-sm"
                    disabled
                >
                    Data Analytics (Coming Soon)
                </button>

                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
                    Manage Devices
                </button>

                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm">
                    Configure Alarm
                </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default PlantOverview;
