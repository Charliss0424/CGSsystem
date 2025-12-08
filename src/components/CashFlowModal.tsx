import React, { useState, useEffect } from 'react';
import { X, ArrowRightCircle, ArrowLeftCircle, Check } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

interface CashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'IN' | 'OUT'; // IN = Ingreso, OUT = Retiro
}

export const CashFlowModal: React.FC<CashFlowModalProps> = ({ isOpen, onClose, type }) => {
  const { registerCashMovement } = useDatabase();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  // Enfocar el input al abrir
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !reason) return;

    const success = await registerCashMovement(type, parseFloat(amount), reason);
    if (success) {
      alert(type === 'IN' ? 'Dinero ingresado correctamente.' : 'Retiro registrado correctamente.');
      onClose();
    }
  };

  const isIngreso = type === 'IN';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className={`p-4 flex justify-between items-center text-white ${isIngreso ? 'bg-green-600' : 'bg-red-600'}`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            {isIngreso ? <ArrowLeftCircle /> : <ArrowRightCircle />}
            {isIngreso ? 'Ingreso de Efectivo' : 'Retiro de Efectivo'}
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Monto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
              <input 
                type="number" 
                autoFocus
                required
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 p-3 border border-slate-300 rounded-lg text-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Motivo / Concepto</label>
            <textarea 
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={isIngreso ? "Ej. Fondo de caja inicial" : "Ej. Pago a proveedor de refrescos"}
            />
          </div>

          <button 
            type="submit"
            className={`w-full py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95
              ${isIngreso ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}
            `}
          >
            <Check size={20} />
            {isIngreso ? 'Registrar Ingreso' : 'Registrar Retiro'}
          </button>
        </form>
      </div>
    </div>
  );
};