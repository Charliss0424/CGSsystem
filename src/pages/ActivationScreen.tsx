import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, Server, AlertCircle, Loader2 } from 'lucide-react';
import { validateLicense } from '../services/licenseService';

interface ActivationScreenProps {
  onActivationSuccess: (plan: string) => void;
}

export const ActivationScreen: React.FC<ActivationScreenProps> = ({ onActivationSuccess }) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Llamamos al servicio que creamos antes
      const result = await validateLicense(licenseKey.trim());

      if (result.isValid && result.plan) {
        // 2. Éxito: Guardamos la llave localmente y notificamos al padre
        localStorage.setItem('CGSystem_license_key', licenseKey.trim());
        localStorage.setItem('CGSystem_plan', result.plan); // Guardamos el nivel (Essential/Business)
        onActivationSuccess(result.plan);
      } else {
        // 3. Error de validación (Caducada, otra máquina, etc.)
        setError(result.message || 'Licencia inválida.');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Visual */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-800 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <div className="absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full bg-white blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/10 p-4 rounded-full mb-4 backdrop-blur-sm border border-white/20">
              <ShieldCheck size={48} className="text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">CGSystem</h1>
            <p className="text-blue-200 text-sm mt-1">Activación de Software Empresarial</p>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-800">Bienvenido</h2>
            <p className="text-slate-500 text-sm mt-1">
              Este dispositivo no está registrado. Ingresa tu licencia para activar el sistema.
            </p>
          </div>

          <form onSubmit={handleActivate} className="space-y-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                Clave de Licencia
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  required
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-slate-700"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !licenseKey}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Verificando...
                </>
              ) : (
                <>
                  <Lock size={20} /> Activar Dispositivo
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Server size={12} />
              Conexión segura con servidor de licencias
            </p>
            <p className="text-[10px] text-slate-300 mt-2">ID de Hardware: Generando...</p>
          </div>
        </div>
      </div>
    </div>
  );
};