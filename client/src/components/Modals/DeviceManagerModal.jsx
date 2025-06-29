import React, { useEffect, useState } from 'react';
import {
  getDevicesByPlant,
  addDevice,
  updateDevice,
  deleteDevice,
} from '../../services/api';

import { X, Pencil, Trash } from 'lucide-react';

const DeviceManagerModal = ({ plantId, onClose, onRefresh }) => {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({
    name: '',
    device_type: '',
    serial_number: '',
    is_active: true,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      if (!plantId) return;
      try {
        const data = await getDevicesByPlant(plantId);
        setDevices(data);
      } catch (err) {
        console.error('Eroare la încărcarea dispozitivelor:', err);
      }
    };

    fetchDevices();
  }, [plantId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateDevice(editingId, { ...form, plant: plantId });
      } else {
        await addDevice({ ...form, plant: plantId });
      }

      if (onRefresh) onRefresh();

      const updated = await getDevicesByPlant(plantId);
      setDevices(updated);
      setForm({ name: '', device_type: '', serial_number: '', is_active: true });
      setEditingId(null);
    } catch (err) {
      alert('Eroare la salvare.');
    }
  };

  const handleEdit = (device) => {
    setForm(device);
    setEditingId(device.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Ștergi dispozitivul?')) {
      try {
        await deleteDevice(id);
        if (onRefresh) onRefresh();
        setDevices(devices.filter((d) => d.id !== id));
      } catch (err) {
        alert('Eroare la ștergere.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start z-50 pt-10">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          aria-label="Închide"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4">Administrează dispozitive</h2>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Nume dispozitiv"
            value={form.name}
            onChange={handleChange}
            className="border rounded p-2"
          />
          <select
            name="device_type"
            value={form.device_type}
            onChange={handleChange}
            className="border rounded p-2"
            required
          >
            <option value="">Selectează tipul dispozitivului</option>
            <option value="meter">Contor</option>
            <option value="sensor">Senzor</option>
            <option value="inverter">Invertor</option>
          </select>
          <input
            name="serial_number"
            placeholder="Serie"
            value={form.serial_number}
            onChange={handleChange}
            className="border rounded p-2"
          />
          <select
            name="is_active"
            value={form.is_active}
            onChange={(e) =>
              setForm({ ...form, is_active: e.target.value === 'true' })
            }
            className="border rounded p-2"
          >
            <option value="true">Activ</option>
            <option value="false">Inactiv</option>
          </select>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editingId ? 'Actualizează' : 'Adaugă'} dispozitiv
          </button>
          {editingId && (
            <button
              onClick={() => {
                setForm({ name: '', device_type: '', serial_number: '', is_active: true });
                setEditingId(null);
              }}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Anulează
            </button>
          )}
        </div>

        <ul>
          {devices.map((device) => (
            <li
              key={device.id}
              className="border-t py-2 flex justify-between items-center"
            >
              <span>
                {device.name} ({device.device_type}) - Serie: {device.serial_number}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(device)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editează"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(device.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Șterge"
                >
                  <Trash size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DeviceManagerModal;
