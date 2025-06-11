import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getPvEstimation } from '../services/api';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';

const initialInputs = {
  location: {
    latitude: 45.8,
    longitude: 16.0,
    elevation: 115,
  },
  mounting_system: {
    fixed: {
      slope: 25,
      azimuth: 0,
      type: 'free-standing',
    },
  },
  pv_module: {
    peak_power: 10.0,
    system_loss: 12.0,
  }
};

export default function PvEstimation() {
  const [inputs, setInputs] = useState(initialInputs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState(null);

  const handleChange = (section, field, value, subfield = null) => {
    setInputs((prev) => {
      if (subfield) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: {
              ...prev[section][field],
              [subfield]: value,
            },
          },
        };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const payload = { inputs };
      const data = await getPvEstimation(payload);
      setOutput(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

const monthlyData = output?.pvgisData?.outputs?.monthly?.fixed || [];
const totalData = output?.pvgisData?.outputs?.totals?.fixed || {};
const marketPrice = output?.marketPrice || {};

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  function LocationMarker({ position, setPosition }) {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition(lat, lng);
      },
    });

    return <Marker position={[position.latitude, position.longitude]} />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Photovoltaic Estimation</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-6">
        {/* Location */}
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-4">Location (Click map to set)</legend>

          <div className="h-64 mb-4">
            <MapContainer
              center={[inputs.location.latitude, inputs.location.longitude]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <LocationMarker
                position={inputs.location}
                setPosition={(lat, lng) => {
                  handleChange('location', 'latitude', lat);
                  handleChange('location', 'longitude', lng);
                }}
              />
            </MapContainer>
          </div>

          <input
            type="hidden"
            value={inputs.location.latitude}
          />
          <input
            type="hidden"
            value={inputs.location.longitude}
          />

          <label className="block mb-2">
            Elevation (m):
            <input
              type="number"
              value={inputs.location.elevation}
              onChange={(e) =>
                handleChange('location', 'elevation', parseInt(e.target.value))
              }
              className="ml-2 border rounded px-2 py-1"
              required
            />
          </label>
        </fieldset>

        {/* Mounting System */}
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-2">Mounting System - Fixed</legend>

          <label className="block mb-2">
            Slope (degrees):
            <input
              type="number"
              value={inputs.mounting_system.fixed.slope}
              onChange={(e) =>
                handleChange('mounting_system', 'fixed', parseInt(e.target.value), 'slope')
              }
              className="ml-2 border rounded px-2 py-1"
              min={0}
              max={90}
              required
            />
          </label>

          <label className="block mb-2">
            Azimuth (degrees):
            <input
              type="number"
              value={inputs.mounting_system.fixed.azimuth}
              onChange={(e) =>
                handleChange('mounting_system', 'fixed', parseInt(e.target.value), 'azimuth')
              }
              className="ml-2 border rounded px-2 py-1"
              min={-180}
              max={180}
              required
            />
          </label>

          <label className="block mb-2">
            Type:
            <select
              value={inputs.mounting_system.fixed.type}
              onChange={(e) =>
                handleChange('mounting_system', 'fixed', e.target.value, 'type')
              }
              className="ml-2 border rounded px-2 py-1"
              required
            >
              <option value="free-standing">Free-standing</option>
              <option value="roof-mounted">Roof-mounted</option>
              <option value="other">Other</option>
            </select>
          </label>
        </fieldset>

        {/* PV Module */}
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-2">PV Module</legend>

          <label className="block mb-2">
            Peak Power (kW):
            <input
              type="number"
              step="0.1"
              value={inputs.pv_module.peak_power}
              onChange={(e) =>
                handleChange('pv_module', 'peak_power', parseFloat(e.target.value))
              }
              className="ml-2 border rounded px-2 py-1"
              required
              min={0.1}
            />
          </label>

          <label className="block mb-2">
            System Loss (%):
            <input
              type="number"
              step="0.1"
              value={inputs.pv_module.system_loss}
              onChange={(e) =>
                handleChange('pv_module', 'system_loss', parseFloat(e.target.value))
              }
              className="ml-2 border rounded px-2 py-1"
              required
              min={0}
              max={100}
            />
          </label>
        </fieldset>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </button>

        {error && <p className="text-red-600 mt-2">Error: {error}</p>}
      </form>

      {output && (
        <>
          <h2 className="text-xl font-semibold mb-4">Results</h2>

          <div className="mb-8">
            <h3 className="font-semibold mb-2">Monthly Energy Production</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyData.map((m, idx) => ({
                  month: idx + 1,
                  energy: m.E_m
                }))}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} kWh`, 'Energy']} />
                <Legend />
                <Line type="monotone" dataKey="energy" name="Energy (kWh)" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-2">Monthly Solar Irradiation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyData.map((m, idx) => ({
                  month: idx + 1,
                  irradiation: m["H(i)_m"]
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: 'Irradiation (kWh/m²)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} kWh/m²`, 'Irradiation']} />
                <Legend />
                <Line type="monotone" dataKey="irradiation" name="Irradiation (kWh/m²)" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-100 p-4 rounded shadow">
              <h4 className="font-semibold">Annual Energy (kWh)</h4>
              <p>{totalData.E_y?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h4 className="font-semibold">Annual Irradiation (kWh/m²)</h4>
              <p>{totalData["H(i)_y"]?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h4 className="font-semibold">Total Losses (%)</h4>
              <p>{totalData.l_total?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h4 className="font-semibold">Std Dev</h4>
              <p>{totalData.SD_y?.toFixed(3) || '-'}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded border">
              <h5 className="font-semibold">AOI Loss (%)</h5>
              <p>{totalData.l_aoi?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border">
              <h5 className="font-semibold">Spectral Loss (%)</h5>
              <p>{parseFloat(totalData.l_spec)?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border">
              <h5 className="font-semibold">Temperature Loss (%)</h5>
              <p>{totalData.l_tg?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border">
              <h5 className="font-semibold">PZU price for {marketPrice.month_year}</h5>
              <p>{marketPrice.price_lei_per_MWh.toFixed(2)} RON/mWh</p>
              <p>Estimated: {((marketPrice.price_lei_per_MWh / 1000) * (totalData.E_y ?? 0)).toFixed(2)} RON</p>
            </div>
          </div>

        </>
      )}
    </div>
  );
}
