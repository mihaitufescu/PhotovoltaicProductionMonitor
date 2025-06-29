import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { RefreshCw } from 'lucide-react';

const generateRandomDemoData = () => {
  const days = 14;
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - i));
    const formattedDate = date.toISOString().split('T')[0];

    return {
      date: formattedDate,
      yield_kwh: parseFloat((Math.random() * 80 + 20).toFixed(2)),
      specific_energy: parseFloat((Math.random() * 5 + 2).toFixed(2)),
      peak_ac_power_kw: parseFloat((Math.random() * 10 + 5).toFixed(2)),
      grid_connection_duration_h: parseFloat((Math.random() * 24).toFixed(2)),
    };
  });
};

const DemoDashboard = () => {
  const [demoData, setDemoData] = useState(generateRandomDemoData());

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-gray-600 font-bold mb-1">Demo panou de Control</h1>
          <p className="text-gray-600">Vizualizează date simulate și explorează funcționalitatea panoului de analize de date.</p>
        </div>
        <button
          onClick={() => setDemoData(generateRandomDemoData())}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Generează valori noi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Producție energie (kWh)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="yield_kwh" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Energie specifică (kWh/kWp)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="specific_energy" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Putere maximă instantanee (kW)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="peak_ac_power_kw" stroke="#facc15" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Durată conexiune la rețea (ore)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="grid_connection_duration_h" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

const ChartCard = ({ title, children }) => (
  <div className="bg-white shadow rounded-2xl p-4">
    <h4 className="text-lg font-semibold mb-2">{title}</h4>
    {children}
  </div>
);

export default DemoDashboard;
