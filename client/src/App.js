import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HelloPage from "./HelloPage";
import RegisterPage from "./components/Auth/RegisterPage";
import Navbar from "./components/Navbar";

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold underline text-green-700">Welcome to React App!</h1>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} /> {/* 👈 Home component */}
        <Route path="/hello" element={<HelloPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
