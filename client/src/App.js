import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchCurrentUser } from "./redux/slices/authSlice";
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
import SystemAvailability from './components/SystemAvailability';
import ResetPassword from './components/Auth/ResetPassword';
import ProtectedRoute from "./ProtectedRoute";
import DemoDashboard from './components/Dashboards/DemoDashboard';


function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/hello" element={<HelloPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/confirm-email/:uidb64/:token" element={<ConfirmEmailPage />} />
        <Route path="/estimate-pv" element={<PvEstimation />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
        <Route path="/demo-dashboard" element={<DemoDashboard />} />


        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/configure-plants" element={
          <ProtectedRoute>
            <ConfigurePlants />
          </ProtectedRoute>
        } />
        <Route path="/plants-overview" element={
          <ProtectedRoute>
            <PlantOverview />
          </ProtectedRoute>
        } />
        <Route path="/plants-ingestion" element={
          <ProtectedRoute>
            <PlantIngestion />
          </ProtectedRoute>
        } />
        <Route path="/plants-dashboard/:plantId" element={
          <ProtectedRoute>
            <PlantDashboardWrapper />
          </ProtectedRoute>
        } />
        <Route path="/aggregated_report" element={
          <ProtectedRoute>
            <PlantAggregateReport />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/alarm_settings" element={
          <ProtectedRoute>
            <AlarmSettings />
          </ProtectedRoute>
        } />
        <Route path="/user_settings" element={
          <ProtectedRoute>
            <UserSettings />
          </ProtectedRoute>
        } />
        <Route path="/system_availability" element={
          <ProtectedRoute>
            <SystemAvailability />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
