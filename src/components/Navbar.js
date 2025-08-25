// src/components/Navbar.js
import React from "react";
import { NavLink } from "react-router-dom";
import "./navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__brand">Balanse • Painel</div>

      <nav className="navbar__menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            "navlink" + (isActive ? " navlink--active" : "")
          }
        >
          DRE
        </NavLink>

        <NavLink
          to="/ponto"
          className={({ isActive }) =>
            "navlink" + (isActive ? " navlink--active" : "")
          }
        >
          Ponto de Equilíbrio
        </NavLink>

        <NavLink
          to="/indicadores-extras"
          className={({ isActive }) =>
            "navlink" + (isActive ? " navlink--active" : "")
          }
        >
          Indicadores
        </NavLink>
      </nav>
    </header>
  );
}
