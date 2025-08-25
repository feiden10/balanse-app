import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./navbar.css";

export default function Navbar({ onLogout }) {
  const { pathname } = useLocation();

  const isActive = (match) => {
    // marca ativo quando a URL atual contém o trecho informado
    return pathname.includes(match) ? "active" : "";
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="brand">
        Balanse • Painel
      </Link>

      <div className="links">
        <Link to="/dashboard" className={isActive("/dashboard")}>
          DRE
        </Link>

        <Link to="/ponto-de-equilibrio" className={isActive("/ponto-de-equilibrio")}>
          Ponto de Equilíbrio
        </Link>

        <Link to="/indicadores" className={isActive("/indicadores")}>
          Indicadores
        </Link>

        {onLogout && (
          <button className="logout-btn" onClick={onLogout}>
            Sair
          </button>
        )}
      </div>
    </nav>
  );
}
