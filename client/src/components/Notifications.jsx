import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationRead } from '../redux/slices/notificationsSlice';

const Notifications = () => {
  const dispatch = useDispatch();
  const { alerts, loading, error } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => dispatch(fetchNotifications()), 15000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const markAsRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-GB');
  };

  const formatNum = (num) => {
    if (num === -1) return 'Nu sunt puncte suficiente de citire';
    return Number(num).toFixed(2);
  };

  const translateMetric = (metric) => {
    switch (metric) {
      case 'yield':
        return 'Energie produsă';
      case 'power':
        return 'Putere de vârf';
      case 'specific_energy':
        return 'Energie specifică';
      default:
        return metric;
    }
  }; 

  if (loading) return <div className="p-4">Încărcare...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (alerts.length === 0) return <div className="p-4">Nu sunt notificări.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Notificări</h1>
      <ul className="space-y-4">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className={`p-4 rounded-md border shadow-sm ${
              alert.unread ? 'bg-green-50 border-green-400' : 'bg-white border-gray-300'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">
                {alert.plant_name} inserat cu statusul: <span className="capitalize">{alert.status}</span>
              </h2>
              {alert.unread ? (
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  New
                </span>
              ) : (
                <span className="text-xs text-gray-500">Citit</span>
              )}
            </div>

            <p className="mb-1"><strong>Metrică:</strong> {translateMetric(alert.metric_type)}</p>
            <p className="mb-1"><strong>Valuare medie:</strong> {formatNum(alert.avg_value)}</p>
            <p className="mb-1"><strong>Valoare citită:</strong> {formatNum(alert.actual_value)}</p>
            <p className="mb-1"><strong>Prag alertare:</strong> {formatNum(alert.threshold_value)}</p>

            {alert.read_date && (
              <p className="mb-1">Date preluate la: {formatDate(alert.read_date)}</p>
            )}

            {alert.unread && (
              <button
                onClick={() => markAsRead(alert.id)}
                className="mt-3 text-sm font-medium text-blue-600 hover:underline"
              >
                Marchează ca văzut
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
