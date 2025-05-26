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
import { getPvEstimation } from '../services/api'; // adjust path

const initialInputs = {
  location: {
    latitude: 45.8,
    longitude: 16.0,
    elevation: 115,
  },
  meteo_data: {
    radiation_db: 'PVGIS-SARAH3',
    meteo_db: 'ERA5',
    year_min: 2005,
    year_max: 2023,
    use_horizon: true,
    horizon_db: 'DEM-calculated',
  },
  mounting_system: {
    fixed: {
      slope: 25,
      azimuth: 0,
      type: 'free-standing',
    },
  },
  pv_module: {
    technology: 'c-Si',
    peak_power: 10.0,
    system_loss: 12.0,
  },
  economic_data: {
    system_cost: '',
    interest: '',
    lifetime: '',
  },
};

export default function PvEstimation() {
  const [inputs, setInputs] = useState(initialInputs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState(null);

  // Handles nested changes with optional subfield (for 3-level deep)
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

  const monthlyData = output?.outputs?.monthly?.fixed || [];

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Photovoltaic Estimation</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-6">
        {/* Location */}
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-2">Location</legend>
          <label className="block mb-2">
            Latitude:
            <input
              type="number"
              step="0.0001"
              value={inputs.location.latitude}
              onChange={(e) =>
                handleChange('location', 'latitude', parseFloat(e.target.value))
              }
              className="ml-2 border rounded px-2 py-1"
              required
            />
          </label>
          <label className="block mb-2">
            Longitude:
            <input
              type="number"
              step="0.0001"
              value={inputs.location.longitude}
              onChange={(e) =>
                handleChange('location', 'longitude', parseFloat(e.target.value))
              }
              className="ml-2 border rounded px-2 py-1"
              required
            />
          </label>
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

        {/* Meteo Data */}
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-2">Meteo Data</legend>

          <label className="block mb-2">
            Radiation Database:
            <select
              value={inputs.meteo_data.radiation_db}
              onChange={(e) => handleChange('meteo_data', 'radiation_db', e.target.value)}
              className="ml-2 border rounded px-2 py-1"
              required
            >
              <option value="PVGIS-SARAH3">PVGIS-SARAH3</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="block mb-2">
            Meteo Database:
            <select
              value={inputs.meteo_data.meteo_db}
              onChange={(e) => handleChange('meteo_data', 'meteo_db', e.target.value)}
              className="ml-2 border rounded px-2 py-1"
              required
            >
              <option value="ERA5">ERA5</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="block mb-2">
            Year Min:
            <input
              type="number"
              value={inputs.meteo_data.year_min}
              onChange={(e) =>
                handleChange('meteo_data', 'year_min', parseInt(e.target.value))
              }
              className="ml-2 border rounded px-2 py-1"
              min="1990"
              max={inputs.meteo_data.year_max}
              required
            />
          </label>

          <label className="block mb-2">
            Year Max:
            <input
              type="number"
              value={inputs.meteo_data.year_max}
              onChange={(e) =>
                handleChange('meteo_data', 'year_max', parseInt(e.target.value))
              }
              className="ml-2 border rounded px-2 py-1"
              min={inputs.meteo_data.year_min}
              max={new Date().getFullYear()}
              required
            />
          </label>

          <label className="block mb-2">
            Use Horizon:
            <input
              type="checkbox"
              checked={inputs.meteo_data.use_horizon}
              onChange={(e) =>
                handleChange('meteo_data', 'use_horizon', e.target.checked)
              }
              className="ml-2"
            />
          </label>

          <label className="block mb-2">
            Horizon Database:
            <select
              value={inputs.meteo_data.horizon_db}
              onChange={(e) => handleChange('meteo_data', 'horizon_db', e.target.value)}
              className="ml-2 border rounded px-2 py-1"
              disabled={!inputs.meteo_data.use_horizon}
              required={inputs.meteo_data.use_horizon}
            >
              <option value="DEM-calculated">DEM-calculated</option>
              <option value="Other">Other</option>
            </select>
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
            Technology:
            <select
              value={inputs.pv_module.technology}
              onChange={(e) => handleChange('pv_module', 'technology', e.target.value)}
              className="ml-2 border rounded px-2 py-1"
              required
            >
              <option value="c-Si">c-Si</option>
              <option value="Other">Other</option>
            </select>
          </label>

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

        {/* Economic Data */}
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-2">Economic Data (Optional)</legend>

          <label className="block mb-2">
            System Cost:
            <input
              type="number"
              step="0.01"
              value={inputs.economic_data.system_cost}
              onChange={(e) =>
                handleChange('economic_data', 'system_cost', e.target.value)
              }
              className="ml-2 border rounded px-2 py-1"
            />
          </label>

          <label className="block mb-2">
            Interest Rate (%):
            <input
              type="number"
              step="0.01"
              value={inputs.economic_data.interest}
              onChange={(e) =>
                handleChange('economic_data', 'interest', e.target.value)
              }
              className="ml-2 border rounded px-2 py-1"
            />
          </label>

          <label className="block mb-2">
            Lifetime (years):
            <input
              type="number"
              value={inputs.economic_data.lifetime}
              onChange={(e) =>
                handleChange('economic_data', 'lifetime', e.target.value)
              }
              className="ml-2 border rounded px-2 py-1"
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

          {/* Monthly Energy Chart */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Monthly Energy Production (kWh)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyData.map((m, idx) => ({ month: idx + 1, E_m: m.E_m }))}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="E_m" stroke="#8884d8" name="Monthly Energy" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Irradiation Chart */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Monthly Irradiation (kWh/m²)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyData.map((m, idx) => ({ month: idx + 1, H_i_m: m['H(i)_m'] }))}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis label={{ value: 'kWh/m²', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="H_i_m"
                  stroke="#82ca9d"
                  name="Monthly Irradiation"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-100 p-4 rounded shadow">
              <h4 className="font-semibold">Annual Energy (kWh)</h4>
              <p>{output.outputs.annual?.E_y?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h4 className="font-semibold">Annual Irradiation (kWh/m²)</h4>
              <p>{output.outputs.annual?.['H(i)_y']?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h4 className="font-semibold">Total Losses (%)</h4>
              <p>{output.outputs.annual?.l_total?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h4 className="font-semibold">Std Dev</h4>
              <p>{output.outputs.annual?.SD_y?.toFixed(3) || '-'}</p>
            </div>
          </div>

          {/* Loss breakdown */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded border">
              <h5 className="font-semibold">AOI Loss (%)</h5>
              <p>{output.outputs.annual?.l_aoi?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border">
              <h5 className="font-semibold">Spectral Loss (%)</h5>
              <p>{output.outputs.annual?.l_spec?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border">
              <h5 className="font-semibold">Temperature Loss (%)</h5>
              <p>{output.outputs.annual?.l_tg?.toFixed(2) || '-'}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
