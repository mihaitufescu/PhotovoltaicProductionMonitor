import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HelloPage from "./HelloPage";
import RegisterPage from "./components/Auth/RegisterPage";
import LoginPage from "./components/Auth/LoginPage";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";
import PlantOverview from './components/PlantOverview';
import ConfigurePlants from "./components/ConfigurePlants";
import PlantIngestion from "./components/PlantIngestion";
import PlantDashboardWrapper from './components/PlantDashboardWrapper';
import PvEstimation from './components/PvEstimation';
import PlantAggregateReport from './components/PlantAggregateReport';
import Notifications from './components/Notifications';
import AlarmSettings from './components/AlarmSettings';
import UserSettings from './components/UserSettings';
import ConfirmEmailPage from './components/ConfirmEmailPage';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice';
import { useSelector } from 'react-redux';


function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user === null) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hello" element={<HelloPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/estimate-pv" element={<PvEstimation />} />
        <Route path="/configure-plants" element={<ConfigurePlants />} />
        <Route path="/plants-overview" element={<PlantOverview />} />
        <Route path="/plants-ingestion" element={<PlantIngestion />} />
        <Route path="/plants-dashboard/:plantId" element={<PlantDashboardWrapper />} />
        <Route path="/aggregated_report" element={<PlantAggregateReport />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/alarm_settings" element={<AlarmSettings />} />
        <Route path="/user_settings" element={<UserSettings />} />
        <Route path="/confirm-email/:uidb64/:token" element={<ConfirmEmailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
