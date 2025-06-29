import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Cpu,
  Gauge,
  ActivitySquare,
  HelpCircle,
  FilePlus 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPlantDashboardData } from '../../services/api';
import dayjs from 'dayjs';

const NoDataFallback = () => {
  const navigate = useNavigate();

  return (
    <div className="col-span-full flex flex-col items-center justify-center bg-white shadow rounded-2xl p-6 text-center">
      <FilePlus className="w-12 h-12 text-gray-400 mb-2" />
      <p className="text-gray-600 mb-4">
        Nu sunt date disponibile. Încarcă date pentru acest parc.
      </p>
      <button
        onClick={() => navigate('/plants-ingestion')}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Încarcă date
      </button>
    </div>
  );
};

const deviceIcons = {
  inverter: <Cpu className="w-5 h-5 text-sky-600" />,
  meter: <Gauge className="w-5 h-5 text-yellow-600" />,
  sensor: <ActivitySquare className="w-5 h-5 text-green-600" />,
};

const deviceLabels = {
  inverter: 'Invertor',
  meter: 'Contor',
  sensor: 'Senzor',
};

const PlantDashboard = ({ plantId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('365d');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboard = await getPlantDashboardData(plantId);
        setData(dashboard);
      } catch (error) {
        console.error('Eroare panou de control:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [plantId]);

  if (loading) return <div className="p-4">Incarcare panou de control...</div>;
  if (!data) return <div className="p-4 text-red-600">Eroare in incarcarea datelor.</div>;

  const { plant_name, summary, device_summary } = data;

  const filterChartData = () => {
    if (!data.histogram_data) return [];

    const fullData = data.histogram_data.dates.map((date, index) => ({
      date,
      yield_kwh: data.histogram_data.yield_kwh[index],
      specific_energy: data.histogram_data.specific_energy[index],
      peak_ac_power_kw: data.histogram_data.peak_ac_power_kw[index],
      grid_connection_duration_h: data.histogram_data.grid_connection_duration_h[index],
    }));

    if (timeRange === 'all') return fullData;

    const days = parseInt(timeRange);
    const cutoff = dayjs().subtract(days, 'day');

    return fullData.filter((d) => dayjs(d.date).isAfter(cutoff));
  };

  const chartData = filterChartData();

  const hasChartData = chartData.length > 0 && chartData.some(item =>
    Object.values(item).some(value => value !== null && value !== 0)
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl text-gray-600 font-bold mb-2">{plant_name}</h1>
      <h2 className="text-2xl text-gray-800 mb-4">Reprezentarea performanței parcului</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <DashboardCard label="Energie produsă totală (kWh)" value={summary.total_yield_kwh?.toFixed(2)} />
        <DashboardCard label="Energie specifică medie" value={summary.avg_specific_energy?.toFixed(2)} />
        <DashboardCard label="Puere maximă instantanee (kW)" value={summary.max_peak_power?.toFixed(2)} />
        <DashboardCard label="Conexiune rețea (h)" value={summary.total_grid_duration?.toFixed(2)} />
      </div>

      {/* Devices Summary */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Dispozitive instalate</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(device_summary).map(([type, count]) => (
            <div
              key={deviceLabels[type] || type}
              className="flex items-center bg-white shadow rounded-2xl p-4 space-x-4"
            >
              <div className="bg-gray-100 p-2 rounded-full">
                {deviceIcons[type] || <HelpCircle className="w-5 h-5 text-gray-400" />}
              </div>
              <div>
                <div className="text-sm text-gray-500 capitalize">{type}</div>
                <div className="text-lg font-semibold">{count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <label className="font-semibold mr-2">Interval de timp:</label>
        <select
          className="border rounded px-2 py-1"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7d">Ultima săptămână</option>
          <option value="30d">Ultima lună</option>
          <option value="365d">Ultimul an</option>
          <option value="all">Total</option>
        </select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasChartData ? (
          <>
            <ChartCard title="Producție energie">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    label={{ value: '(kWh)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Bar dataKey="yield_kwh" fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Energie specifică">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    label={{ value: '(kWh/kWp)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Line type="monotone" dataKey="specific_energy" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Putere maximă instantanee">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    label={{ value: '(kW)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Line type="monotone" dataKey="peak_ac_power_kw" stroke="#facc15" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Durată conexiune la rețea">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Ora', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="grid_connection_duration_h" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        ) : (
          <NoDataFallback />
        )}
      </div>
    </div>
  );
};

const DashboardCard = ({ label, value }) => (
  <div className="bg-white shadow rounded-2xl p-4 text-center">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-xl font-semibold">{value}</div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white shadow rounded-2xl p-4">
    <h4 className="text-lg font-semibold mb-2">{title}</h4>
    {children}
  </div>
);

export default PlantDashboard;
