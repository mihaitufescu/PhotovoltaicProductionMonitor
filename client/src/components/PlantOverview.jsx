import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { deletePlant } from '../services/api';
import { getPlantOverview, updatePlant } from '../services/api';
import DeviceManagerModal from './Modals/DeviceManagerModal';
import { Pencil, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlantOverview = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [editingPlantId, setEditingPlantId] = useState(null);
  const [newPlantName, setNewPlantName] = useState('');
  const navigate = useNavigate();

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
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                {editingPlantId === plantObj.plant.id ? (
                    <>
                    <input
                        type="text"
                        value={newPlantName}
                        onChange={(e) => setNewPlantName(e.target.value)}
                        className="border p-1 rounded text-sm"
                    />
                    <button
                        onClick={async () => {
                        try {
                            await updatePlant(plantObj.plant.id, { plant_name: newPlantName });
                            const updated = await getPlantOverview();
                            setPlants(updated);
                            setEditingPlantId(null);
                        } catch (err) {
                            alert('Failed to update plant name.');
                        }
                        }}
                        title="Save"
                        className="text-green-600 hover:text-green-800"
                    >
                        <Check size={18} />
                    </button>
                    </>
                ) : (
                    <>
                    {plantObj.plant.plant_name}
                    <button
                        onClick={() => {
                        setEditingPlantId(plantObj.plant.id);
                        setNewPlantName(plantObj.plant.plant_name);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Name"
                    >
                        <Pencil size={18} />
                    </button>
                    </>
                )}
            </h3>
            {/* <p><strong>ID:</strong> {plantObj.plant.id}</p> */}
            <p><strong>Ingestion Type:</strong> {plantObj.plant.ingestion_type}</p>
            {/* <p><strong>Devices Count:</strong> {plantObj.plant.devices_count}</p> */}

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
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm"
                  onClick={() => navigate(`/plants-dashboard/${plantObj.plant.id}`)}
                >
                  Data Analytics
                </button>

                <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                    onClick={() => setSelectedPlantId(plantObj.plant.id)}
                >
                    Manage Devices
                </button>

                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm">
                    Configure Alarm
                </button>
            </div>

          </div>
        ))}
      </div>
      {selectedPlantId && (
        <DeviceManagerModal
            plantId={selectedPlantId}
            onClose={() => setSelectedPlantId(null)}
        />
      )}
    </div>
  );
};

export default PlantOverview;
