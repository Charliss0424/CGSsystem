// Archivo: src/components/CashCountModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, Calculator, Banknote, Coins, ArrowRight, CheckCircle } from 'lucide-react';

interface CashCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (totalCounted: number, details: Record<number, number>) => void;
}

const BILLETES = [1000, 500, 200, 100, 50, 20];
const MONEDAS = [20, 10, 5, 2, 1, 0.50];

export const CashCountModal: React.FC<CashCountModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [counts, setCounts] = useState<Record<string, string>>({});

  useEffect(() => { if (isOpen) setCounts({}); }, [isOpen]);

  const handleChange = (denom: number, value: string) => {
    setCounts(prev => ({ ...prev, [denom.toString()]: value.replace(/[^0-9]/g, '') }));
  };

  const { total, details } = useMemo(() => {
    let sum = 0; const det: Record<number, number> = {};
    [...BILLETES, ...MONEDAS].forEach(denom => {
      const qty = parseInt(counts[denom.toString()] || '0', 10);
      det[denom] = qty;
      sum += qty * denom;
    });
    return { total: sum, details: det };
  }, [counts]);

  if (!isOpen) return null;

  const money = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Calculator className="text-blue-400" /> Arqueo de Caja</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Banknote className="text-green-600"/> Billetes</h3>
              {BILLETES.map(denom => (
                <div key={denom} className="flex items-center gap-3 mb-2">
                  <div className="w-16 text-right font-bold text-green-700">${denom}</div>
                  <input type="text" inputMode="numeric" className="flex-1 text-center font-bold border rounded py-2 outline-none focus:ring-2 bg-green-50 focus:ring-green-500" placeholder="0" value={counts[denom.toString()] || ''} onChange={(e) => handleChange(denom, e.target.value)} onFocus={e => e.target.select()} />
                </div>
              ))}
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Coins className="text-amber-500"/> Monedas</h3>
              {MONEDAS.map(denom => (
                <div key={denom} className="flex items-center gap-3 mb-2">
                  <div className="w-16 text-right font-bold text-amber-700">${denom}</div>
                  <input type="text" inputMode="numeric" className="flex-1 text-center font-bold border rounded py-2 outline-none focus:ring-2 bg-amber-50 focus:ring-amber-500" placeholder="0" value={counts[denom.toString()] || ''} onChange={(e) => handleChange(denom, e.target.value)} onFocus={e => e.target.select()} />
                </div>
              ))}
            </div>
        </div>
        <div className="bg-white p-4 border-t border-slate-200 flex justify-between items-center">
          <div><p className="text-xs font-bold text-slate-500 uppercase">Total Declarado</p><p className="text-3xl font-bold text-slate-800">{money(total)}</p></div>
          <button onClick={() => onConfirm(total, details)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2">Confirmar <ArrowRight size={20}/></button>
        </div>
      </div>
    </div>
  );
};