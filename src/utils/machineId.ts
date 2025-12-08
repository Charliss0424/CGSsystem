import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Variable para guardar el ID en memoria y no recalcularlo cada vez
let cachedMachineId: string | null = null;

/**
 * Genera un identificador único para este dispositivo/navegador.
 * Basado en: Hardware gráfico, SO, Fuentes instaladas, etc.
 */
export const getMachineId = async (): Promise<string> => {
  if (cachedMachineId) {
    return cachedMachineId;
  }

  try {
    // Cargamos el agente
    const fpPromise = FingerprintJS.load();
    const fp = await fpPromise;
    const result = await fp.get();

    // El visitorId es el hash único de esta máquina
    cachedMachineId = result.visitorId;
    
    console.log("🔒 Machine ID generado:", cachedMachineId);
    return cachedMachineId;
  } catch (error) {
    console.error("Error generando Machine ID:", error);
    // Fallback: Si falla, generamos uno aleatorio y lo guardamos en localStorage
    // Esto es menos seguro pero evita que la app truene.
    let fallbackId = localStorage.getItem('fallback_device_id');
    if (!fallbackId) {
        fallbackId = crypto.randomUUID();
        localStorage.setItem('fallback_device_id', fallbackId);
    }
    return fallbackId;
  }
};