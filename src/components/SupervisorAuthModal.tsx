import React, { useState, useEffect } from 'react';
import { X, Lock, KeyRound } from 'lucide-react';

interface SupervisorAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void; // Esta prop es clave, la usa Orders.tsx
    onSuccess?: () => void; // Alias opcional si en algún lado lo llamaste onSuccess
    title?: string;
    reason?: string; // Para mostrar el motivo (ej. "Autorizar retroceso")
}

export const SupervisorAuthModal: React.FC<SupervisorAuthModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm,
    onSuccess,
    title = "Autorización Requerida",
    reason
}) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    // Manejar alias de la prop (por si en Orders.tsx usaste onSuccess o onConfirm)
    const handleSuccess = onConfirm || onSuccess;

    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // --- VALIDACIÓN DEL PIN ---
        // Aquí puedes conectar con tu lista de usuarios o usar un PIN maestro
        // PIN Maestro temporal: 1234
        if (pin === '1234' || pin === 'admin') {
            if (handleSuccess) handleSuccess();
            onClose();
        } else {
            setError('PIN incorrecto o insuficientes permisos.');
            setPin('');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Lock size={18} className="text-red-500" />
                        {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 rounded-full hover:bg-slate-200"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                            <KeyRound size={32} className="text-red-500" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            {reason || "Esta acción requiere permisos de supervisor."}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Ingresa tu PIN de seguridad</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <input
                                autoFocus
                                type="password"
                                value={pin}
                                onChange={(e) => {
                                    setPin(e.target.value);
                                    if(error) setError('');
                                }}
                                className="w-full text-center text-3xl tracking-[0.5em] font-bold border-b-2 border-slate-200 focus:border-red-500 outline-none py-2 text-slate-800 placeholder-slate-200 transition-colors bg-transparent"
                                placeholder="••••"
                                maxLength={6}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-xs text-center font-bold p-2 rounded-lg animate-pulse border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={pin.length < 4}
                                className="flex-1 py-2.5 text-white font-bold bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200"
                            >
                                Autorizar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};