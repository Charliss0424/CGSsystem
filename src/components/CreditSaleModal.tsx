import React from 'react';
import { X, CheckCircle, Wallet } from 'lucide-react';
import { Client } from '../types';

interface CreditSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
  client: Client | null;
}

export const CreditSaleModal: React.FC<CreditSaleModalProps> = ({ 
  isOpen, onClose, onConfirm, total, client 
}) => {
  if (!isOpen) return null;

  const currentDebt = client?.currentBalance || 0; 
  const newBalance = currentDebt + total;
  const creditLimit = client?.creditLimit || 0;
  const isOverLimit = newBalance > creditLimit;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in zoom-in-95">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-purple-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Wallet size={24} className="text-purple-200"/>
              <h2 className="text-lg font-bold">Venta a Crédito</h2>
            </div>
            <button onClick={onClose} className="text-purple-200 hover:text-white"><X size={24}/></button>
          </div>
          <div className="mt-4">
            <p className="text-purple-200 text-xs uppercase font-bold">Total a Fiar</p>
            <p className="text-4xl font-bold">${total.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {client ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h3 className="font-bold text-slate-800 text-lg mb-1">{client.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{client.phone || 'Sin teléfono'}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="block text-slate-400">Saldo Actual</span><span className="font-bold text-red-500">${currentDebt.toFixed(2)}</span></div>
                <div><span className="block text-slate-400">Límite Crédito</span><span className="font-bold text-slate-700">${creditLimit.toFixed(2)}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Nuevo Saldo:</span>
                <span className={`text-xl font-bold ${isOverLimit ? 'text-red-600' : 'text-purple-600'}`}>${newBalance.toFixed(2)}</span>
              </div>
              {isOverLimit && <p className="text-xs text-red-500 mt-2 font-bold text-center bg-red-50 p-2 rounded">⚠️ Excede el límite de crédito</p>}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center"><p className="font-bold">⚠️ Error: No hay cliente asignado</p></div>
          )}
          <button onClick={onConfirm} disabled={!client} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 flex justify-center items-center gap-2 disabled:opacity-50 transition-all active:scale-95"><CheckCircle size={20} /> Autorizar Crédito</button>
        </div>
      </div>
    </div>
  );
};