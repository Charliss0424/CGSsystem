import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'F2', label: 'Ventas Pendientes' },
    { key: 'F3', label: 'Devolución' },
    { key: 'F4', label: 'Reimprimir Ticket' },
    { key: 'F5', label: 'Calculadora' },
    { key: 'F6', label: 'Entrada de Dinero' },
    { key: 'F7', label: 'Salida de Dinero' },
    { key: 'F8', label: 'Corte Parcial (X)' },
    { key: 'F9', label: 'Corte Cierre (Z)' },
    { key: 'F10', label: 'Cobrar Efectivo' },
    { key: 'F11', label: 'Cobrar Tarjeta' },
    { key: 'F12', label: 'Cobrar Crédito' },
    { key: 'ESC', label: 'Cerrar / Cancelar' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in zoom-in-95">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Encabezado */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-2 rounded-lg">
                <Keyboard size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Atajos de Teclado</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Grid de Atajos */}
        <div className="p-6 bg-slate-50 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortcuts.map((item, index) => (
                    <div key={index} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-indigo-200 transition-colors">
                        <div className="bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-lg min-w-[50px] text-center text-sm shadow-sm border border-slate-200">
                            {item.key}
                        </div>
                        <span className="text-slate-600 font-medium text-sm">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white text-right">
            <button 
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-bold transition-colors text-sm"
            >
                Entendido
            </button>
        </div>

      </div>
    </div>
  );
};