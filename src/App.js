// src/App.js
import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./Dashboard";
import PontoDeEquilibrio from "./PontoDeEquilibrio";
import IndicadoresExtras from "./IndicadoresExtras";

export default function App() {
  return (
    <HashRouter>
      {/* barra única do sistema */}
      <Navbar />

      {/* rotas principais */}
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ponto" element={<PontoDeEquilibrio />} />
        <Route path="/indicadores-extras" element={<IndicadoresExtras />} />

        {/* redirecionamentos seguros */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
