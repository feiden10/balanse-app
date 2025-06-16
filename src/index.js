import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // ← novo import

// Criação da raiz
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Ativa o Service Worker para funcionamento offline e app instalável
serviceWorkerRegistration.register();
