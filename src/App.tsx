import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import BuySell from './components/BuySell';
import Portfolio from './components/Portfolio';
import Reports from './components/Reports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
         <Route path="/buy" element={<BuySell />} />
        <Route path="/sell" element={<BuySell />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;