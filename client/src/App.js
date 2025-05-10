import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HelloPage from "./HelloPage";
import RegisterPage from "./components/Auth/RegisterPage";
import LoginPage from "./components/Auth/LoginPage";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";
import ConfigurePlants from "./components/ConfigurePlants";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice';


function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hello" element={<HelloPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/configure-plants" element={<ConfigurePlants />} />
      </Routes>
    </Router>
  );
}

export default App;
