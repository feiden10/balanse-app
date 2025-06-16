// src/App.js

import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Indicadores from './Indicadores';
import PainelAdmin from './PainelAdmin';

function App() {
  const usuario = localStorage.getItem('usuario');
  const admin = localStorage.getItem('admin') === 'true';

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={usuario ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/indicadores"
          element={usuario ? <Indicadores /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={admin ? <PainelAdmin /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
