import React, { useState, useEffect } from 'react';
import { X, Banknote, CreditCard, CheckCircle, Wallet, AlertTriangle } from 'lucide-react';
import { Client } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amountTendered?: number, change?: number, ref?: string) => void;
  total: number;
  method: 'cash' | 'card' | 'credit';
  client?: Client | null; // Nuevo prop: Cliente seleccionado
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, onClose, onConfirm, total, method, client 
}) => {
  const [tendered, setTendered] = useState<string>('');
  const [refCode, setRefCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTendered(''); 
      setRefCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Cálculos
  const amountTendered = parseFloat(tendered) || 0;
  const change = amountTendered - total;
  
  // Validaciones
  let isValid = false;
  let creditError = '';

  if (method === 'cash') {
    isValid = amountTendered >= total;
  } else if (method === 'card') {
    isValid = true; // Podrías validar longitud de referencia si quisieras
  } else if (method === 'credit') {
    if (!client) {
        creditError = 'Se requiere asignar un cliente para venta a crédito.';
        isValid = false;
    } else {
        const available = client.creditLimit - client.currentBalance;
        if (total > available) {
            creditError = `Límite excedido. Disponible: $${available.toFixed(2)}`;
            isValid = false;
        } else {
            isValid = true;
        }
    }
  }

  const handleQuickCash = (amount: number) => {
    setTendered(amount.toString());
  };

  // Renderizado dinámico según método
  const renderContent = () => {
    switch (method) {
        case 'cash':
            return (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Monto Recibido</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">$</span>
                      <input
                        type="number"
                        autoFocus
                        value={tendered}
                        onChange={(e) => setTendered(e.target.value)}
                        className="w-full pl-8 pr-4 py-4 text-3xl font-bold text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[20, 50, 100, 200, 500, 1000].map(val => (
                      val >= total && (
                        <button key={val} onClick={() => handleQuickCash(val)} className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">${val}</button>
                      )
                    ))}
                    <button onClick={() => handleQuickCash(Math.ceil(total))} className="py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg col-span-2">Exacto</button>
                  </div>
                  <div className={`p-4 rounded-xl flex justify-between items-center ${change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <span className="font-medium">Cambio:</span>
                    <span className="text-3xl font-bold">${Math.max(0, change).toFixed(2)}</span>
                  </div>
                </>
            );
        case 'card':
            return (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Referencia / Autorización (Opcional)</label>
                  <input
                    type="text"
                    autoFocus
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-lg"
                    placeholder="Ej. 123456"
                  />
                  <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex gap-3 items-center">
                    <CreditCard size={24}/>
                    <p>Confirme la transacción en la terminal bancaria.</p>
                  </div>
                </div>
            );
        case 'credit':
            return (
                <div className="space-y-4">
                    {client ? (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 text-lg mb-2">{client.name}</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-slate-500">Saldo Actual:</span>
                                    <span className="font-bold text-red-500">${client.currentBalance.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500">Límite Crédito:</span>
                                    <span className="font-bold text-slate-700">${client.creditLimit.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Nuevo Saldo:</span>
                                    <span className="text-xl font-bold text-indigo-600">${(client.currentBalance + total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
                            <AlertTriangle />
                            <p>No se ha seleccionado ningún cliente.</p>
                        </div>
                    )}
                    
                    {creditError && (
                        <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm font-bold text-center">
                            {creditError}
                        </div>
                    )}
                </div>
            );
    }
  };

  const getHeaderColor = () => {
      if (method === 'cash') return 'bg-green-600';
      if (method === 'card') return 'bg-blue-600';
      return 'bg-purple-600'; // Crédito
  };

  const getTitle = () => {
      if (method === 'cash') return 'Cobro en Efectivo';
      if (method === 'card') return 'Cobro con Tarjeta';
      return 'Venta a Crédito (Fiado)';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className={`p-6 text-white flex justify-between items-start ${getHeaderColor()}`}>
          <div>
            <h3 className="text-lg font-medium opacity-90 flex items-center gap-2">
              {method === 'cash' ? <Banknote size={20}/> : method === 'card' ? <CreditCard size={20}/> : <Wallet size={20}/>}
              {getTitle()}
            </h3>
            <p className="text-4xl font-bold mt-2">${total.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {renderContent()}

          {/* Botón de Acción */}
          <button
            onClick={() => onConfirm(method === 'cash' ? amountTendered : total, method === 'cash' ? change : 0, refCode)}
            disabled={!isValid}
            className={`w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2
              ${!isValid ? 'bg-slate-300 cursor-not-allowed shadow-none' : getHeaderColor()}
            `}
          >
            <CheckCircle size={24} />
            {method === 'credit' ? 'Autorizar Crédito' : 'Confirmar Cobro'}
          </button>
        </div>
      </div>
    </div>
  );
};