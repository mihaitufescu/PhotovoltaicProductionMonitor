import React, { useState } from "react";
import { createPlant } from "../services/api";

const ConfigurePlants = () => {
  const [plantName, setPlantName] = useState("");
  const [ingestionType, setIngestionType] = useState("API");
  const [threshold, setThreshold] = useState("");
  const [metricType, setMetricType] = useState("yield");
  const [devices, setDevices] = useState([
    { name: "", device_type: "inverter", serial_number: "" },
  ]);
  const [awsSettings, setAwsSettings] = useState({
    bucket_name: "",
    region: "",
    access_key: "",
    secret_key: "",
  });
  const [api_key, setApiKey] = useState("");
  const [message, setMessage] = useState("");

  const handleDeviceChange = (index, field, value) => {
    const updatedDevices = [...devices];
    updatedDevices[index][field] = value;
    setDevices(updatedDevices);
  };

  const addDeviceField = () => {
    setDevices([...devices, { name: "", device_type: "inverter", serial_number: "" }]);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
      plant_name: plantName,
      ingestion_type: ingestionType.toUpperCase(),
      devices: devices.filter(
        (d) => d.name && d.device_type && d.serial_number
      ),
      alarm: {},
    };

    if (threshold) {
      payload.alarm.threshold_value = parseFloat(threshold);
    }

    if (metricType) {
      payload.alarm.metric_type = metricType;
    }

    if (ingestionType === "s3") {
      payload.aws_settings = awsSettings;
    }

    try {
      const response = await createPlant(payload);
      console.log(response)

      if (response.api_key) {
        setApiKey(response.api_key);
        setMessage("Plant created successfully!");
      } else {
        setMessage("Failed to create plant.");
      }

      // Reset form
      setPlantName("");
      setThreshold("");
      setMetricType("yield");
      setDevices([{ name: "", device_type: "inverter", serial_number: "" }]);
      setAwsSettings({ bucket_name: "", region: "", access_key: "", secret_key: "" });
    } catch (err) {
      console.error(err);
      setMessage("Failed to create plant.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold text-purple-700 mb-4">Add New Plant</h1>

      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
      {api_key && (
        <div className="mb-4 p-3 bg-purple-100 border rounded">
          <p className="font-semibold">Your API Key (save it securely):</p>
          <code className="text-sm text-purple-800 break-all">{api_key}</code>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Plant Name */}
        <div>
          <label className="block font-medium">Plant Name</label>
          <input
            type="text"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        {/* Threshold */}
        <div>
          <label className="block font-medium">Alert Threshold (%)</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="e.g. 85"
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        {/* Metric Type (For alarm) */}
        <div>
          <label className="block font-medium">Metric Type</label>
          <select
            value={metricType}
            onChange={(e) => setMetricType(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="yield">Yield (kWh)</option>
            <option value="power">Peak AC Power (kW)</option>
            <option value="specific_energy">Specific Energy (kWh/kWp)</option>
          </select>
        </div>

        {/* Ingestion Type */}
        <div>
          <label className="block font-medium">Ingestion Type</label>
          <select
            value={ingestionType}
            onChange={(e) => setIngestionType(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="API">API Key</option>
            <option value="s3">AWS S3</option>
          </select>
        </div>

        {/* AWS Settings */}
        {ingestionType === "s3" && (
          <div className="p-4 bg-yellow-50 rounded border">
            <h3 className="font-semibold mb-2">AWS S3 Settings</h3>
            {["bucket_name", "region", "access_key", "secret_key"].map((field) => (
              <div key={field} className="mb-2">
                <input
                  type="text"
                  placeholder={field.replace("_", " ")}
                  value={awsSettings[field]}
                  onChange={(e) =>
                    setAwsSettings({ ...awsSettings, [field]: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
              </div>
            ))}
          </div>
        )}

        {/* Devices */}
        <div>
          <label className="block font-medium mb-2">Devices</label>
          {devices.map((device, index) => (
            <div key={index} className="space-y-2">
              <input
                type="text"
                placeholder={`Device ${index + 1} Name`}
                value={device.name}
                onChange={(e) => handleDeviceChange(index, "name", e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              />
              <select
                value={device.device_type}
                onChange={(e) => handleDeviceChange(index, "device_type", e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="inverter">Inverter</option>
                <option value="meter">Meter</option>
                <option value="sensor">Sensor</option>
              </select>
              <input
                type="text"
                placeholder={`Device ${index + 1} Serial Number`}
                value={device.serial_number}
                onChange={(e) => handleDeviceChange(index, "serial_number", e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addDeviceField}
            className="w-full mt-4 bg-blue-600 text-white p-2 rounded"
          >
            Add Another Device
          </button>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-2 rounded"
          >
            Create Plant
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigurePlants;