import React, { useState, useEffect } from 'react';
import { X, Banknote, CreditCard, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amountTendered?: number, change?: number, ref?: string) => void;
  total: number;
  method: 'cash' | 'card';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, onClose, onConfirm, total, method 
}) => {
  const [tendered, setTendered] = useState<string>('');
  const [refCode, setRefCode] = useState('');

  // Reiniciar campos al abrir
  useEffect(() => {
    if (isOpen) {
      setTendered(''); 
      setRefCode('');
      if (method === 'card') setTendered(total.toString());
    }
  }, [isOpen, total, method]);

  // --- ATAJO DE TECLADO PARA EXACTO (ESPACIO) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Tecla ESPACIO = Cobro Exacto
      if (e.code === 'Space' && method === 'cash') {
        e.preventDefault();
        handleExactCash();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, method, total]); // Dependencias importantes

  if (!isOpen) return null;

  const amountTendered = parseFloat(tendered) || 0;
  const change = amountTendered - total;
  
  // Validación con margen mínimo de error
  const isValid = method === 'cash' ? (amountTendered >= total - 0.001) : true;

  const handleQuickCash = (amount: number) => {
    setTendered(amount.toString());
  };

  const handleExactCash = () => {
    // Pone el total exacto (sin redondear)
    setTendered(total.toString());
  };

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(
        method === 'cash' ? amountTendered : undefined, 
        method === 'cash' ? change : undefined, 
        refCode
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in zoom-in-95">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className={`p-6 text-white flex justify-between items-start ${method === 'cash' ? 'bg-green-600' : 'bg-blue-600'}`}>
          <div>
            <h3 className="text-lg font-medium opacity-90 flex items-center gap-2">
              {method === 'cash' ? <Banknote size={20}/> : <CreditCard size={20}/>}
              {method === 'cash' ? 'Cobro en Efectivo' : 'Cobro con Tarjeta'}
            </h3>
            <p className="text-4xl font-bold mt-2">${total.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {method === 'cash' ? (
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
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && isValid) handleConfirm();
                    }}
                    className="w-full pl-8 pr-4 py-4 text-2xl font-bold text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Botones Rápidos de Efectivo */}
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 200, 500, 1000].map(val => (
                  val >= Math.floor(total) && (
                    <button 
                      key={val}
                      onClick={() => handleQuickCash(val)}
                      className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                    >
                      ${val}
                    </button>
                  )
                ))}
                
                {/* BOTÓN EXACTO (Atajo Espacio) */}
                <button 
                   onClick={handleExactCash}
                   className="py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors col-span-2 border border-indigo-100"
                   title="Atajo: Barra Espaciadora"
                >
                  Exacto [Espacio]
                </button>
              </div>

              {/* Cambio */}
              <div className={`p-4 rounded-xl flex justify-between items-center ${change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-500'}`}>
                <span className="font-medium">Cambio:</span>
                <span className="text-3xl font-bold">${Math.max(0, change).toFixed(2)}</span>
              </div>
            </>
          ) : (
            // Vista de Tarjeta
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Ref / Autorización (Opcional)</label>
              <input
                type="text"
                autoFocus
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirm();
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                placeholder="Ej. 123456"
              />
              <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex gap-3">
                <div className="shrink-0"><CreditCard size={20}/></div>
                <p>Confirme la transacción en la terminal bancaria antes de finalizar.</p>
              </div>
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2
              ${!isValid 
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : method === 'cash' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
          >
            <CheckCircle size={24} />
            Confirmar Cobro
          </button>
        </div>
      </div>
    </div>
  );
};