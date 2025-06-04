import React, { useEffect, useState } from 'react';
import { fetchSystemAvailability } from '../services/api';

const SystemAvailability = () => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const data = await fetchSystemAvailability();
        setAvailability(data);
      } catch (err) {
        setError('Failed to load system availability.');
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, []);

  if (loading) return <p>Loading system availability...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">System Availability</h2>
      <p className="mb-4 text-lg">
        <strong>Overall Availability:</strong>{' '}
        {typeof availability.system_availability_percent === 'number'
          ? `${availability.system_availability_percent.toFixed(2)}%`
          : availability.system_availability_percent}
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Plant Name</th>
              <th className="px-4 py-2 border">OK Count</th>
              <th className="px-4 py-2 border">Triggered Count</th>
              <th className="px-4 py-2 border">Total Days</th>
              <th className="px-4 py-2 border">Availability %</th>
            </tr>
          </thead>
          <tbody>
            {availability.plants.map((plant) => (
              <tr key={plant.plant_id} className="text-center">
                <td className="px-4 py-2 border">{plant.plant_name}</td>
                <td className="px-4 py-2 border">{plant.ok_count}</td>
                <td className="px-4 py-2 border">{plant.triggered_count}</td>
                <td className="px-4 py-2 border">{plant.total_days}</td>
                <td className="px-4 py-2 border">
                  {typeof plant.availability_percent === 'number'
                    ? `${plant.availability_percent.toFixed(2)}%`
                    : plant.availability_percent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemAvailability;