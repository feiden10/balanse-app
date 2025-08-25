// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // ← Desativado por enquanto

// Criação da raiz
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Service Worker desativado temporariamente para evitar erro de MIME
// Para ativar futuramente como PWA, reativar a linha abaixo com a configuração correta
// serviceWorkerRegistration.register();
