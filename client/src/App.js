import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HelloPage from "./HelloPage";

function App() {
  return (
    <Router>
      <div>
        <h1>Welcome to React App!</h1>
        <Routes>
          <Route path="/hello" element={<HelloPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
