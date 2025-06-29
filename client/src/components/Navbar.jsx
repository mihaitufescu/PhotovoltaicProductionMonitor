import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { Settings, Bell } from 'lucide-react';
import { fetchNotifications } from '../redux/slices/notificationsSlice';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { alerts } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
      const intervalId = setInterval(() => dispatch(fetchNotifications()), 15000);
      return () => clearInterval(intervalId);
    }
  }, [user, dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const unreadCount = alerts.filter((a) => a.unread).length;

  return (
    <nav className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 shadow-md border-b-2 border-green-500">
      <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 rounded-b-md">
          <div className="flex items-center space-x-6">
            <span className="text-white text-xl font-bold tracking-wide leading-none">
              Monitor fotovoltaic
            </span>
            <Link to="/" className="text-white text-lg font-semibold hover:text-green-200 transition-colors duration-300">
              Acasă
            </Link>
            <Link to="/estimate-pv" className="text-white text-lg font-semibold hover:text-green-200 transition-colors duration-300">
              Simulator producție
            </Link>
            {user && (
              <Link to="/dashboard" className="text-white text-lg font-semibold hover:text-green-200 transition-colors duration-300">
                Panou control
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/register" className="text-white text-lg font-semibold hover:text-green-200 transition-colors duration-300">
                  Înregistrare
                </Link>
                <Link to="/login" className="text-white text-lg font-semibold hover:text-green-200 transition-colors duration-300">
                  Autentificare
                </Link>
              </>
            ) : (
              <>
                <Link to="/notifications" className="relative flex items-center text-white font-semibold hover:text-green-200 transition duration-300">
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/user_settings" className="flex items-center gap-1 text-white font-semibold bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors duration-300">
                  <Settings size={18} />
                  Setări
                </Link>
                <button onClick={handleLogout} className="text-white font-semibold bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition-colors duration-300">
                  Deconectare
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
