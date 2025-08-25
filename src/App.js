// src/App.js
import React, { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

import Login from "./Login";
import Dashboard from "./Dashboard";
import PainelAdmin from "./PainelAdmin";
import Navbar from "./components/Navbar";

// NOVOS componentes
import PontoDeEquilibrio from "./PontoDeEquilibrio";
import IndicadoresExtras from "./IndicadoresExtras";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <HashRouter>
      {user && (
        <Navbar userEmail={user.email} onLogout={handleLogout} />
      )}

      <Routes>
        {/* público */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />

        {/* admin (mantenha sua lógica de permissão se já tiver) */}
        <Route path="/admin" element={user ? <PainelAdmin /> : <Navigate to="/login" />} />

        {/* área do cliente */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/ponto" element={user ? <PontoDeEquilibrio /> : <Navigate to="/login" />} />
        <Route path="/indicadores" element={user ? <IndicadoresExtras /> : <Navigate to="/login" />} />

        {/* default */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </HashRouter>
  );
}
