import { supabase } from './supabase';
import { getMachineId } from '../utils/machineId';

export interface LicenseStatus {
  isValid: boolean;
  plan?: 'ESSENTIAL' | 'BUSINESS' | 'ENTERPRISE';
  message?: string;
  clientName?: string;
}

export const validateLicense = async (licenseKey: string): Promise<LicenseStatus> => {
  try {
    // 1. Obtener el ID de esta máquina
    const currentMachineId = await getMachineId();

    // 2. Buscar la licencia en la base de datos
    const { data: license, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .single();

    if (error || !license) {
      return { isValid: false, message: 'Licencia no encontrada.' };
    }

    // 3. Verificar si está activa por el administrador
    if (!license.is_active) {
      return { isValid: false, message: 'Esta licencia ha sido suspendida por el administrador.' };
    }

    // 4. Verificar fecha de expiración
    const now = new Date();
    const expiration = new Date(license.expiration_date);
    if (now > expiration) {
      return { isValid: false, message: 'Tu licencia ha caducado. Por favor renueva tu plan.' };
    }

    // 5. LÓGICA DE CANDADO (Device Lock)
    
    // CASO A: Primera vez que se usa (Activación)
    if (license.machine_id === null) {
      // "Casamos" la licencia con esta máquina para siempre
      const { error: updateError } = await supabase
        .from('licenses')
        .update({ 
            machine_id: currentMachineId,
            last_check_in: new Date().toISOString()
        })
        .eq('id', license.id);

      if (updateError) {
        return { isValid: false, message: 'Error al activar la licencia en este dispositivo.' };
      }

      return { 
        isValid: true, 
        plan: license.plan, 
        clientName: license.client_name,
        message: 'Licencia activada exitosamente en este equipo.' 
      };
    }

    // CASO B: Ya fue activada antes (Verificación)
    if (license.machine_id !== currentMachineId) {
      return { 
        isValid: false, 
        message: `Esta licencia ya fue activada en otro equipo. ID Esperado: ...${license.machine_id.slice(-4)}` 
      };
    }

    // SI TODO ESTÁ BIEN: Actualizamos el "Check-in" (visto por última vez)
    await supabase.from('licenses').update({ last_check_in: new Date().toISOString() }).eq('id', license.id);

    return { 
        isValid: true, 
        plan: license.plan, 
        clientName: license.client_name 
    };

  } catch (error) {
    console.error("Error validando licencia:", error);
    return { isValid: false, message: 'Error de conexión al validar licencia.' };
  }
};