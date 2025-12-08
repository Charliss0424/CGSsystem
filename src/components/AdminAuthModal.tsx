import React, { useState } from 'react';
import { ShieldAlert, X, Lock } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionTitle: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose, onSuccess, actionTitle }) => {
  const { login } = useDatabase(); // Reusamos la función de login para validar
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Aquí validamos contra el usuario "admin" o buscamos un rol de supervisor
    // Para este ejemplo, validamos si la contraseña coincide con el usuario admin actual
    // O puedes quemar una "Clave Maestra" aquí si prefieres: if (password === '9999')
    
    // Simulamos validación usando la función login del contexto
    // Nota: En un sistema real, deberías tener una función específica `verifyAdminPin(pin)`
    const isValid = await login('pin', password); // Asumimos que validamos por PIN

    if (isValid || password === '1234') { // '1234' es el PIN maestro de ejemplo
      onSuccess();
      onClose();
      setPassword('');
    } else {
      setError('Clave incorrecta o insuficientes permisos.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-red-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2"><ShieldAlert /> Requiere Autorización</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        
        <div className="p-6">
          <p className="text-slate-600 text-sm mb-4">
            La acción <strong>"{actionTitle}"</strong> está protegida. Ingrese clave de Supervisor:
          </p>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-center text-2xl font-bold tracking-widest"
                placeholder="PIN"
              />
            </div>
            
            {error && <p className="text-red-500 text-xs text-center mb-3 font-bold">{error}</p>}

            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">
              Autorizar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};