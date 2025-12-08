import { createRoot } from 'react-dom/client';
import React from 'react';

export const printElement = (component: React.ReactNode) => {
  // 1. Crear un iframe oculto
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  // Lo mandamos fuera de la pantalla
  iframe.style.left = '-10000px'; 
  document.body.appendChild(iframe);

  // 2. Obtener el documento del iframe
  const doc = iframe.contentWindow?.document;
  if (!doc) {
    console.error("No se pudo iniciar el servicio de impresión.");
    return;
  }

  // 3. Escribir la estructura básica HTML
  doc.open();
  doc.write('<html><head><title>Print</title>');
  // Estilos básicos para ticket
  doc.write(`
    <style>
      body { margin: 0; padding: 0; font-family: "Courier New", Courier, monospace; } 
      @page { margin: 0; size: auto; }
    </style>
  `);
  doc.write('</head><body><div id="print-root"></div></body></html>');
  doc.close();

  // 4. Renderizar el componente React (el Ticket) dentro del iframe
  const rootElement = doc.getElementById('print-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(component);

    // 5. Esperar a que renderice y mandar imprimir
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // 6. Limpieza: Borrar el iframe después de imprimir
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 500); 
  }
};