import { useEffect, useState } from 'react';
import { getUserNotifications, markAlertAsViewed } from '../services/api';

const Notifications = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await getUserNotifications();
        setAlerts(response.alerts || []);
      } catch (err) {
        setError('Failed to load notifications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (index, id) => {
    try {
      await markAlertAsViewed(id);
      setAlerts((prev) =>
        prev.map((alert, i) =>
          i === index
            ? {
                ...alert,
                unread: false,
                read_date: new Date().toISOString(),
              }
            : alert
        )
      );
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const formatNum = (num) => {
    return Number(num).toFixed(2);
  };

  if (loading) return <div className="p-4">Loading notifications...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (alerts.length === 0) return <div className="p-4">No notifications found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <ul className="space-y-4">
        {alerts.map((alert, idx) => (
          <li
            key={idx}
            className={`p-4 rounded-md border shadow-sm ${
              alert.unread ? 'bg-green-50 border-green-400' : 'bg-white border-gray-300'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">
                {alert.plant_name} inserted data with status: <span className="capitalize">{alert.status}</span>
              </h2>
              {alert.unread ? (
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  New
                </span>
              ) : (
                <span className="text-xs text-gray-500">Read</span>
              )}
            </div>

            <p className="mb-1">
              <strong>Metric:</strong> {alert.metric_type}
            </p>
            <p className="mb-1">
              <strong>Average Value:</strong> {formatNum(alert.avg_value)}
            </p>
            <p className="mb-1">
              <strong>Actual Value:</strong> {formatNum(alert.actual_value)}
            </p>
            <p className="mb-1">
              <strong>Threshold:</strong> {formatNum(alert.threshold_value)}
            </p>

            {alert.read_date && (
              <p className="mb-1">
                Data ingested on: {formatDate(alert.read_date)}
              </p>
            )}

            {alert.unread && (
              <button
                onClick={() => markAsRead(idx, alert.id)}
                className="mt-3 text-sm font-medium text-blue-600 hover:underline"
              >
                Mark as read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
