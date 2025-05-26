import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
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

const NoDataFallback = () => {
  const navigate = useNavigate();

  return (
    <div className="col-span-full flex flex-col items-center justify-center bg-white shadow rounded-2xl p-6 text-center">
      <FilePlus className="w-12 h-12 text-gray-400 mb-2" />
      <p className="text-gray-600 mb-4">
        No data available for this plant. Please upload data for your meters.
      </p>
      <button
        onClick={() => navigate('/plants-ingestion')}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Go to Data Ingestion
      </button>
    </div>
  );
};

const deviceIcons = {
  inverter: <Cpu className="w-5 h-5 text-sky-600" />,
  meter: <Gauge className="w-5 h-5 text-yellow-600" />,
  sensor: <ActivitySquare className="w-5 h-5 text-green-600" />,
};

const PlantDashboard = ({ plantId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
        const dashboard = await getPlantDashboardData(plantId);
        setData(dashboard);
        } catch (error) {
        console.error('Dashboard fetch failed:', error);
        } finally {
        setLoading(false);
        }
    };

    fetchData();
    }, [plantId]);

  if (loading) return <div className="p-4">Loading Dashboard...</div>;
  if (!data) return <div className="p-4 text-red-600">Failed to load data.</div>;
  const { plant_name } = data;
  // Combine into chart-ready array
  const chartData = data.histogram_data.dates.map((date, index) => ({
    date,
    yield_kwh: data.histogram_data.yield_kwh[index],
    specific_energy: data.histogram_data.specific_energy[index],
    peak_ac_power_kw: data.histogram_data.peak_ac_power_kw[index],
    grid_connection_duration_h: data.histogram_data.grid_connection_duration_h[index],
  }));
  const hasChartData = chartData.length > 0 && chartData.some(item =>
    Object.values(item).some(value => value !== null && value !== 0)
  );
  const { summary, device_summary } = data;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">{plant_name}</h1>
      <h2 className="text-2xl font-bold mb-4">Plant Performance Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <DashboardCard label="Total Yield (kWh)" value={summary.total_yield_kwh?.toFixed(2)} />
        <DashboardCard label="Avg Specific Energy" value={summary.avg_specific_energy?.toFixed(2)} />
        <DashboardCard label="Max Peak AC Power (kW)" value={summary.max_peak_power?.toFixed(2)} />
        <DashboardCard label="Grid Duration (h)" value={summary.total_grid_duration?.toFixed(2)} />
      </div>

    {/* Devices Summary */}
    <div className="mb-6">
    <h3 className="text-xl font-semibold mb-4">Installed Devices</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(device_summary).map(([type, count]) => (
        <div
            key={type}
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

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasChartData ? (
            <>
            <ChartCard title="Yield Over Time">
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="yield_kwh" fill="#38bdf8" />
                </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Specific Energy Over Time">
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="specific_energy" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Peak AC Power Over Time">
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="peak_ac_power_kw" stroke="#facc15" strokeWidth={2} />
                </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Grid Connection Duration Over Time">
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
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
