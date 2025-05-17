// components/DeviceManagerModal.jsx

import React, { useEffect, useState } from 'react';
import {
  getDevicesByPlant,
  addDevice,
  updateDevice,
  deleteDevice,
} from '../../services/api';

import { X, Pencil, Trash } from 'lucide-react'; // Lucide icons

const DeviceManagerModal = ({ plantId, onClose }) => {
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
      const data = await getDevicesByPlant(plantId);
      setDevices(data);
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
      const updated = await getDevicesByPlant(plantId);
      setDevices(updated);
      setForm({ name: '', device_type: '', serial_number: '', is_active: true });
      setEditingId(null);
    } catch (err) {
      alert('Device operation failed.');
    }
  };

  const handleEdit = (device) => {
    setForm(device);
    setEditingId(device.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this device?')) {
      await deleteDevice(id);
      setDevices(devices.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-start z-50 pt-10">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4">Manage Devices</h2>

        {/* Form */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Device Name"
            value={form.name}
            onChange={handleChange}
            className="border rounded p-2"
          />
          <input
            name="device_type"
            placeholder="Device Type"
            value={form.device_type}
            onChange={handleChange}
            className="border rounded p-2"
          />
          <input
            name="serial_number"
            placeholder="Serial Number"
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
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editingId ? 'Update' : 'Add'} Device
          </button>
          {editingId && (
            <button
                onClick={() => {
                    setForm({ name: '', device_type: '', serial_number: '', is_active: true });
                    setEditingId(null);
                }}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                Cancel
                </button>
            )}
        </div>

        {/* Device List */}
        <ul>
          {devices.map((device) => (
            <li
              key={device.id}
              className="border-t py-2 flex justify-between items-center"
            >
              <span>
                {device.name} ({device.device_type}) — SN: {device.serial_number}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(device)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(device.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete"
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
