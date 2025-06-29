import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
        setError('Eroare încărcare date de sistem.');
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, []);

  const exportToPDF = () => {
    if (!availability) return;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Raport disponibilitate sistem', 14, 20);

    autoTable(doc, {
      startY: 28,
      head: [['Nume parc', 'Sistem functional', 'Anomalie sistem', 'Zile totale', 'Disonibilitate %']],
      body: availability.plants.map((plant) => [
        plant.plant_name,
        plant.ok_count,
        plant.triggered_count,
        plant.total_days,
        `${plant.availability_percent}%`,
      ]),
    });

    doc.save('system_availability_report.pdf');
  };

  if (loading) return <div className="p-6">încărcare disponibilitate sistem...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow mt-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Disponibilitate sistem</h1>
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Descarcă
        </button>
      </div>

      <div className="mb-6 text-lg">
        <strong>Disponibilitate generală:</strong>{' '}
        {typeof availability.system_availability_percent === 'number'
          ? `${availability.system_availability_percent}%`
          : availability.system_availability_percent === 'No data'
            ? 'Nu există date'
            : availability.system_availability_percent}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Nume parc</th>
              <th className="px-4 py-2 border">Sistem funcțional</th>
              <th className="px-4 py-2 border">Anomalie sistem</th>
              <th className="px-4 py-2 border">Zile totale</th>
              <th className="px-4 py-2 border">Disonibilitate %</th>
            </tr>
          </thead>
          <tbody>
            {availability.plants.map((plant) => (
              <tr key={plant.plant_id} className="text-center hover:bg-gray-50">
                <td className="px-4 py-2 border">{plant.plant_name}</td>
                <td className="px-4 py-2 border">{plant.ok_count}</td>
                <td className="px-4 py-2 border">{plant.triggered_count}</td>
                <td className="px-4 py-2 border">{plant.total_days}</td>
                <td className="px-4 py-2 border">
                  {typeof plant.availability_percent === 'number'
                    ? `${plant.availability_percent.toFixed(2)}%`
                    : 'Nu există date'}
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
