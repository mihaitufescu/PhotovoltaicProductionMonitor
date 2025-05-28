import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getPlantAggregates } from "../services/api";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const Section = ({ title, data }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="overflow-x-auto">
      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Period</th>
            <th className="px-4 py-2 border">Total Yield (kWh)</th>
            <th className="px-4 py-2 border">Avg. Specific Energy (kWh/kWp)</th>
            <th className="px-4 py-2 border">Peak AC Power (kW)</th>
            <th className="px-4 py-2 border">Grid Duration (h)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, i) => (
            <tr key={i} className="text-center">
              <td className="px-4 py-2 border">{formatDate(entry.period)}</td>
              <td className="px-4 py-2 border">{entry.total_yield_kwh?.toFixed(2)}</td>
              <td className="px-4 py-2 border">{entry.avg_specific_energy?.toFixed(2)}</td>
              <td className="px-4 py-2 border">{entry.max_peak_ac_power?.toFixed(2)}</td>
              <td className="px-4 py-2 border">{entry.total_grid_connection?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PlantAggregateReport = () => {
  const [aggregates, setAggregates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('weekly');

  useEffect(() => {
    const fetchAggregates = async () => {
      try {
        const data = await getPlantAggregates();
        setAggregates(data);
      } catch (error) {
        console.error("Failed to fetch plant aggregates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAggregates();
  }, []);

  const exportSectionToPDF = (section) => {
    if (!aggregates?.[section]) return;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`${section.charAt(0).toUpperCase() + section.slice(1)} Summary`, 14, 20);

    autoTable(doc, {
      startY: 28,
      head: [['Period', 'Total Yield (kWh)', 'Avg. Specific Energy', 'Peak AC Power', 'Grid Duration (h)']],
      body: aggregates[section].map((row) => [
        formatDate(row.period),
        row.total_yield_kwh?.toFixed(2),
        row.avg_specific_energy?.toFixed(2),
        row.max_peak_ac_power?.toFixed(2),
        row.total_grid_connection?.toFixed(2),
      ]),
    });

    doc.save(`${section}_report.pdf`);
  };

  if (loading) return <div className="p-6">Loading report...</div>;
  if (!aggregates) return <div className="p-6">No data available.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-6">Plant Performance Report</h1>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button
          onClick={() => exportSectionToPDF(selectedSection)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Download {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} PDF
        </button>
      </div>

      <Section title="Weekly Summary" data={aggregates.weekly} />
      <Section title="Monthly Summary" data={aggregates.monthly} />
      <Section title="Yearly Summary" data={aggregates.yearly} />

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">All Time Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-4 rounded shadow text-center">
            <div className="text-sm text-gray-500">Total Yield (kWh)</div>
            <div className="text-lg font-bold">{aggregates.all_time.total_yield_kwh?.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded shadow text-center">
            <div className="text-sm text-gray-500">Avg. Specific Energy</div>
            <div className="text-lg font-bold">{aggregates.all_time.avg_specific_energy?.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded shadow text-center">
            <div className="text-sm text-gray-500">Peak AC Power</div>
            <div className="text-lg font-bold">{aggregates.all_time.max_peak_ac_power?.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded shadow text-center">
            <div className="text-sm text-gray-500">Grid Duration (h)</div>
            <div className="text-lg font-bold">{aggregates.all_time.total_grid_connection?.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantAggregateReport;
