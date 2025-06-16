// src/serviceWorker.js

// Este service worker foi configurado para ativar o modo PWA básico.
// Para que funcione, chame registerServiceWorker() no seu index.js

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch(error => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    });
  }
}
