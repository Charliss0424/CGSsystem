import React, { useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, Printer, Save } from 'lucide-react';

interface CashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'IN' | 'OUT';
  // Actualizamos para recibir el booleano 'shouldPrint'
  onConfirm: (amount: number, reason: string, shouldPrint: boolean) => void; 
}

export const CashFlowModal: React.FC<CashFlowModalProps> = ({ isOpen, onClose, type, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (shouldPrint: boolean) => {
    const val = parseFloat(amount);
    
    if (!amount || val <= 0) return alert("Ingrese un monto válido");

    const finalReason = reason || (type === 'IN' ? 'Ingreso vario' : 'Gasto vario');
    
    // Enviamos la decisión de imprimir al padre
    onConfirm(val, finalReason, shouldPrint);
    
    setAmount('');
    setReason('');
    onClose();
  };

  const isIncome = type === 'IN';
  const bgClass = isIncome ? 'bg-emerald-600' : 'bg-red-600';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className={`p-4 text-white flex justify-between items-center ${bgClass}`}>
          <h3 className="font-bold text-lg flex items-center gap-2">
            {isIncome ? <ArrowUpCircle /> : <ArrowDownCircle />}
            {isIncome ? 'Entrada de Dinero' : 'Salida / Gasto'}
          </h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-1">Monto ($)</label>
            <input 
              type="number" 
              autoFocus
              className="w-full text-4xl font-bold text-slate-800 border-b-2 border-slate-200 outline-none pb-2 focus:border-slate-400 transition-colors"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-1">Motivo / Razón</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 rounded-lg outline-none border border-slate-200 focus:ring-2 focus:ring-slate-200 transition-all"
              placeholder={isIncome ? "Ej. Cambio inicial..." : "Ej. Pago proveedor..."}
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-3">
            {/* Botón 1: Solo Guardar (Ecológico) */}
            <button 
                onClick={() => handleSubmit(false)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 flex justify-center items-center gap-2 transition-colors"
            >
                <Save size={18}/> Solo Guardar
            </button>

            {/* Botón 2: Guardar e Imprimir */}
            <button 
                onClick={() => handleSubmit(true)}
                className={`flex-1 py-3 rounded-xl font-bold text-white flex justify-center items-center gap-2 shadow-lg transition-transform active:scale-95 ${isIncome ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
                <Printer size={18}/> Imprimir Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};