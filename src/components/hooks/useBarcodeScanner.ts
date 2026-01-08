import { useEffect, useState } from 'react';

export const useBarcodeScanner = (onScan: (code: string) => void) => {
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Si el foco está en un input normal, no interceptamos (para dejar escribir usuario/pass)
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.key === 'Enter') {
        if (barcode) {
          onScan(barcode);
          setBarcode('');
        }
      } else if (e.key.length === 1) {
        // Acumulamos caracteres
        setBarcode((prev) => prev + e.key);

        // Los lectores son rápidos (<50ms entre teclas). Si tarda más, es un humano escribiendo.
        clearTimeout(timeout);
        timeout = setTimeout(() => setBarcode(''), 100); 
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [barcode, onScan]);
};