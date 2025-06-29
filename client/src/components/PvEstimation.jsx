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
import dayjs from 'dayjs';
import 'dayjs/locale/ro';
import L from 'leaflet';

const initialInputs = {
  location: {
    latitude: 44.4,
    longitude: 26.1,
    elevation: 20,
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
      <h1 className="text-2xl font-bold mb-4 text-gray-700">Estimare producție fotovoltaică</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-6">
        {/* Location */}
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-4">Locație (Click pe hartă pentru a seta)</legend>

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
            Altitudine (m):
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
          <legend className="font-semibold mb-2">Sistem de montaj - Fix</legend>

          <label className="block mb-2">
            Înclinație (grade):
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
            Azimut (grade):
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
            Tip:
            <select
              value={inputs.mounting_system.fixed.type}
              onChange={(e) =>
                handleChange('mounting_system', 'fixed', e.target.value, 'type')
              }
              className="ml-2 border rounded px-2 py-1"
              required
            >
              <option value="free-standing">Structură proprie</option>
              <option value="roof-mounted">Montat pe acoperiș</option>
              <option value="other">Alt tip</option>
            </select>
          </label>
        </fieldset>

        {/* PV Module */}
        <fieldset className="border p-4 rounded">
          <legend className="font-semibold mb-2">Modul fotovoltaic</legend>

          <label className="block mb-2">
            Putere maximă instantanee (kW):
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
            Pierderi sistem (%):
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
          {loading ? 'Simulează...' : 'Simulează'}
        </button>

        {error && <p className="text-red-600 mt-2">Eroare: {error}</p>}
      </form>

      {output && (
        <>
          <h2 className="text-xl font-semibold mb-4">Rezultate</h2>

          <div className="mb-8">
            <h3 className="font-semibold mb-2">Producție lunară de energie</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyData.map((m, idx) => ({
                  month: idx + 1,
                  energy: m.E_m
                }))}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Luna', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: 'Energie (kWh)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} kWh`, 'Energie']} />
                <Legend />
                <Line type="monotone" dataKey="energy" name="Energie (kWh)" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-2">Radiație solară lunară</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyData.map((m, idx) => ({
                  month: idx + 1,
                  irradiation: m["H(i)_m"]
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Luna', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: 'Radiație (kWh/m²)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} kWh/m²`, 'Radiație solară']} />
                <Legend />
                <Line type="monotone" dataKey="irradiation" name="Radiație (kWh/m²)" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-gray-100 p-4 rounded shadow">
              <h4 className="font-semibold">Energie anuală (kWh)</h4>
              <p>{totalData.E_y?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h4 className="font-semibold">Radiație solară anuală (kWh/m²)</h4>
              <p>{totalData["H(i)_y"]?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <h4 className="font-semibold">Pierderi totale (%)</h4>
              <p>{totalData.l_total?.toFixed(2) || '-'}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded border">
              <h5 className="font-semibold">Pierdere de convergență spectrală (%)</h5>
              <p>{parseFloat(totalData.l_spec)?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border">
              <h5 className="font-semibold">Pierdere de temperatură (%)</h5>
              <p>{totalData.l_tg?.toFixed(2) || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded border">
              <h5 className="font-semibold">Preț pentru ziua urmatoare (PZU) al perioadei: {dayjs(marketPrice.month_year).locale('ro').format('MMMM YYYY')}</h5>
              <p>{marketPrice.price_lei_per_MWh.toFixed(2)} RON/mWh</p>
              <p>Câștig estimat: {((marketPrice.price_lei_per_MWh / 1000) * (totalData.E_y ?? 0)).toFixed(2)} RON</p>
            </div>
          </div>

        </>
      )}
    </div>
  );
}
