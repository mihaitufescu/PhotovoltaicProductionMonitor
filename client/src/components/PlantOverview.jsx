import React, { useEffect, useState } from 'react';
import { deletePlant, getPlantOverview, updatePlant } from '../services/api';
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
    if (!window.confirm('Ești sigur că vrei să ștergi acest parc?')) return;

    try {
      await deletePlant(plantId);
      setPlants(plants.filter(p => p.plant.id !== plantId));
    } catch (error) {
      alert('Ștergerea a eșuat. Încearcă din nou.');
    }
  };

  const refreshPlants = async () => {
    setLoading(true);
    try {
      const data = await getPlantOverview();
      setPlants(data);
    } catch (error) {
      console.error('Eroare la reîncărcare:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPlants();
  }, []);

  if (loading) return <div className="text-center mt-10">Se încarcă...</div>;
  if (!loading && plants.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Nu există niciun parc fotovoltaic configurat.</h2>
        <p className="text-gray-600 mb-6">Te rugăm să configurezi un parc.</p>
        <button
          onClick={() => navigate('/configure-plants')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Configurează
        </button>
      </div>
    );
  }
  return (
    <div className="p-6">
      <h2 className="text-2xl text-gray-600 font-bold mb-4">Vizualizare Parcuri</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plants.map((plantObj, index) => (
          <div key={index} className="border rounded-2xl shadow p-4 bg-white flex flex-col justify-between">
            <div>
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
                          await refreshPlants();
                          setEditingPlantId(null);
                        } catch (err) {
                          alert('Eroare la salvarea numelui.');
                        }
                      }}
                      title="Salvează"
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
                      title="Editează numele"
                    >
                      <Pencil size={18} />
                    </button>
                  </>
                )}
              </h3>

              <p><strong>Tip ingestie:</strong> {plantObj.plant.ingestion_type}</p>

              <div className="mt-2">
                <strong>Dispozitive:</strong>
                {plantObj.devices.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {plantObj.devices.map((device) => (
                      <span
                        key={device.id}
                        className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full shadow-sm hover:bg-gray-200 transition"
                      >
                        <span className="font-medium">{device.name}</span>{' '}
                        <span className="text-xs text-gray-600">
                          ({device.device_type}) – Serie: {device.serial_number}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Fără dispozitive.</p>
                )}
              </div>

              <div className="mt-2">
                <strong>Setări alarme:</strong>
                {plantObj.alarm_settings ? (
                  <p>
                    Prag: {plantObj.alarm_settings.threshold_value}, Tip: {plantObj.alarm_settings.metric_type}
                  </p>
                ) : (
                  <p className="text-gray-500">Fără setări de alertare.</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleDeletePlant(plantObj.plant.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                Șterge parc
              </button>

              <button
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                onClick={() => navigate(`/plants-dashboard/${plantObj.plant.id}`)}
              >
                Analiză date
              </button>

              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                onClick={() => setSelectedPlantId(plantObj.plant.id)}
              >
                Administrează dispozitive
              </button>

              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm"
                onClick={() => navigate(`/alarm_settings`)}
              >
                Configurează alarme
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPlantId && (
        <DeviceManagerModal
          plantId={selectedPlantId}
          onClose={() => setSelectedPlantId(null)}
          onRefresh={refreshPlants}
        />
      )}
    </div>
  );
};

export default PlantOverview;
