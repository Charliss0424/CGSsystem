import React, { useState, useEffect, useRef } from 'react';
import { X, Banknote, CreditCard, CheckCircle, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Cambiamos el nombre para que coincida con PosTerminal
  onFinishSale: (amountTendered?: number, change?: number, ref?: string) => Promise<void> | void;
  total: number;
  // Cambiamos el nombre para que coincida con PosTerminal
  paymentMethod: 'cash' | 'card';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onFinishSale, // Antes onConfirm
  total, 
  paymentMethod // Antes method
}) => {
  const [tendered, setTendered] = useState<string>('');
  const [refCode, setRefCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Reiniciar campos al abrir
  useEffect(() => {
    if (isOpen) {
      setTendered(''); 
      setRefCode('');
      setIsProcessing(false);
      // Auto-focus al abrir
      setTimeout(() => inputRef.current?.focus(), 50);
      
      if (paymentMethod === 'card') {
        setTendered(total.toString());
      }
    }
  }, [isOpen, total, paymentMethod]);

  // --- ATAJO DE TECLADO PARA EXACTO (ESPACIO) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Tecla ESPACIO = Cobro Exacto (Solo efectivo)
      if (e.code === 'Space' && paymentMethod === 'cash') {
        e.preventDefault();
        handleExactCash();
      }
      // Escape = Cerrar
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, paymentMethod, total]);

  if (!isOpen) return null;

  const amountTendered = parseFloat(tendered) || 0;
  const change = amountTendered - total;
  
  // Validación: en efectivo no puede faltar dinero (margen de error pequeño por decimales)
  const isValid = paymentMethod === 'cash' ? (amountTendered >= total - 0.01) : true;

  const handleQuickCash = (amount: number) => {
    setTendered(amount.toString());
    inputRef.current?.focus();
  };

  const handleExactCash = () => {
    setTendered(total.toString());
  };

  const handleConfirm = async () => {
    if (isValid && !isProcessing) {
      setIsProcessing(true);
      await onFinishSale(
        paymentMethod === 'cash' ? amountTendered : undefined, 
        paymentMethod === 'cash' ? change : undefined, 
        refCode
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in zoom-in-95 duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Dinámico */}
        <div className={`p-6 text-white flex justify-between items-start ${paymentMethod === 'cash' ? 'bg-green-600' : 'bg-blue-600'}`}>
          <div>
            <h3 className="text-lg font-medium opacity-90 flex items-center gap-2">
              {paymentMethod === 'cash' ? <Banknote size={20}/> : <CreditCard size={20}/>}
              {paymentMethod === 'cash' ? 'Cobro en Efectivo' : 'Cobro con Tarjeta'}
            </h3>
            <p className="text-4xl font-bold mt-2">${total.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {paymentMethod === 'cash' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Monto Recibido</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">$</span>
                  <input
                    ref={inputRef}
                    type="number"
                    step="0.50"
                    value={tendered}
                    onChange={(e) => setTendered(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && isValid) handleConfirm();
                    }}
                    className="w-full pl-8 pr-4 py-4 text-2xl font-bold text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none transition-all placeholder:text-slate-300"
                    placeholder={total.toFixed(2)}
                  />
                </div>
              </div>

              {/* Botones Rápidos de Efectivo */}
              <div className="grid grid-cols-4 gap-2">
                {[20, 50, 100, 200, 500, 1000].map(val => (
                  // Solo mostrar billetes mayores o cercanos al total
                  (val >= total || val * 2 >= total) && (
                    <button 
                      key={val}
                      onClick={() => handleQuickCash(val)}
                      className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors border border-slate-200"
                    >
                      ${val}
                    </button>
                  )
                )).slice(0, 6)} {/* Limitar a los primeros que coincidan para no saturar */}
                
                {/* BOTÓN EXACTO (Atajo Espacio) */}
                <button 
                   onClick={handleExactCash}
                   className="py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors col-span-2 border border-indigo-100 flex items-center justify-center gap-1"
                   title="Atajo: Barra Espaciadora"
                >
                  Exacto <span className="text-[10px] opacity-60 font-normal border border-indigo-300 px-1 rounded">ESPACIO</span>
                </button>
              </div>

              {/* Cambio */}
              <div className={`p-4 rounded-xl flex justify-between items-center transition-colors duration-200 border ${
                amountTendered >= total 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-500'
              }`}>
                <span className="font-bold">{amountTendered >= total ? 'SU CAMBIO:' : 'FALTANTE:'}</span>
                <span className="text-3xl font-bold">${Math.abs(change).toFixed(2)}</span>
              </div>
            </>
          ) : (
            // Vista de Tarjeta
            <div className="space-y-4">
               <div className="p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl text-sm flex gap-3 items-center">
                <div className="shrink-0 p-2 bg-white rounded-full"><CreditCard size={20} className="text-blue-600"/></div>
                <p>Por favor, procese el cobro de <strong>${total.toFixed(2)}</strong> en la terminal bancaria antes de confirmar.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Ref / Autorización (Opcional)</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirm();
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej. 123456"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={!isValid || isProcessing}
            className={`w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex justify-center items-center gap-2
              ${!isValid || isProcessing
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : paymentMethod === 'cash' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
          >
            {isProcessing ? <Loader2 className="animate-spin"/> : <CheckCircle size={24} />}
            {isProcessing ? 'Procesando...' : 'Confirmar Cobro'}
          </button>
        </div>
      </div>
    </div>
  );
};