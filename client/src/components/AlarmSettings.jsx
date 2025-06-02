import React, { useEffect, useState } from 'react';
import { getPlantOverview, updateAlarmSettings } from '../services/api';

const AlarmSettings = () => {
  const [plants, setPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [metricType, setMetricType] = useState('yield');
  const [thresholdValue, setThresholdValue] = useState('');
  const [updating, setUpdating] = useState(false);
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

  const handleUpdate = async () => {
    if (!selectedPlantId || !metricType || thresholdValue === '') {
      setMessage('Please select all fields.');
      return;
    }

    setUpdating(true);
    setMessage('');

    try {
      const response = await updateAlarmSettings(selectedPlantId, {
        metric_type: metricType,
        threshold_value: parseFloat(thresholdValue),
      });
      setMessage(`${response.message || 'Succesfull: Alarm updated successfully'}`);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Update failed. Try again.';
      setMessage(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Update Alarm Threshold</h2>

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
              {plantObj.plant.plant_name} (ID: {plantObj.plant.id})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Metric Type:</label>
        <select
          value={metricType}
          onChange={(e) => setMetricType(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        >
          <option value="yield">Yield</option>
          <option value="power">Power</option>
          <option value="specific_energy">Specific Energy</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Threshold (%):</label>
        <input
          type="number"
          value={thresholdValue}
          onChange={(e) => setThresholdValue(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
          min="0"
          max="100"
        />
      </div>

      <button
        onClick={handleUpdate}
        disabled={updating}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {updating ? 'Updating...' : 'Update Alarm'}
      </button>

      {message && (
        <p className="mt-4 text-sm">
          {message.startsWith('Succesfull') ? (
            <span className="text-green-600">{message}</span>
          ) : (
            <span className="text-red-600">{message}</span>
          )}
        </p>
      )}
    </div>
  );
};

export default AlarmSettings;
