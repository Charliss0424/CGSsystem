import React from 'react';
import { X, Wallet, CheckCircle, AlertTriangle, User, Loader2, Ban } from 'lucide-react';

interface CreditSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  total: number;
  clientName: string;
  // NUEVAS PROPIEDADES NECESARIAS
  currentBalance: number;
  creditLimit: number;
}

export const CreditSaleModal: React.FC<CreditSaleModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  total, 
  clientName,
  currentBalance,
  creditLimit
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  if (!isOpen) return null;

  const hasClient = clientName && clientName.trim().length > 0;

  // --- CÁLCULOS DE CRÉDITO ---
  const availableCredit = creditLimit - currentBalance;
  const newBalancePrediction = currentBalance + total;
  const isOverLimit = newBalancePrediction > creditLimit;
  const excessAmount = newBalancePrediction - creditLimit;

  const handleConfirm = async () => {
    if (!hasClient || isOverLimit || isProcessing) return;
    
    setIsProcessing(true);
    await onConfirm();
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in zoom-in-95">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* HEADER: Cambia de color si hay error */}
        <div className={`p-6 text-white flex justify-between items-start transition-colors ${isOverLimit ? 'bg-red-600' : 'bg-purple-600'}`}>
          <div>
            <h3 className="text-lg font-medium opacity-90 flex items-center gap-2">
              {isOverLimit ? <Ban size={20}/> : <Wallet size={20} />}
              {isOverLimit ? 'Crédito Insuficiente' : 'Venta a Crédito'}
            </h3>
            <p className="text-sm opacity-80 mt-1">TOTAL DE ESTA VENTA</p>
            <p className="text-4xl font-bold">${total.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          
          {/* Información del Cliente */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Estado de Cuenta</label>
            {hasClient ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-700 text-base border-b border-slate-200 pb-2 mb-2">
                    <User size={18} className="text-purple-600"/> {clientName}
                </div>
                
                <div className="flex justify-between">
                    <span className="text-slate-500">Límite de Crédito:</span>
                    <span className="font-bold">${creditLimit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                    <span>Saldo Deudor Actual:</span>
                    <span>-${currentBalance.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between font-bold pt-1 ${availableCredit < total ? 'text-red-600' : 'text-green-600'}`}>
                    <span>Crédito Disponible:</span>
                    <span>${Math.max(0, availableCredit).toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
                <AlertTriangle size={24} />
                <p className="font-bold text-sm">Error: No hay cliente asignado.</p>
              </div>
            )}
          </div>

          {/* ALERTA DE LÍMITE EXCEDIDO */}
          {hasClient && isOverLimit && (
             <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
                <AlertTriangle className="text-red-500 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-red-700 text-sm">Límite Excedido</h4>
                    <p className="text-xs text-red-600 mt-1">
                        Esta venta haría que el saldo (${newBalancePrediction.toFixed(2)}) supere el límite permitido.
                    </p>
                    <p className="text-xs font-bold text-red-800 mt-2 bg-red-100/50 p-1 rounded inline-block">
                        Debe reducir la venta en: ${excessAmount.toFixed(2)}
                    </p>
                </div>
             </div>
          )}

          {/* Botón de Confirmación */}
          <button
            onClick={handleConfirm}
            disabled={!hasClient || isOverLimit || isProcessing}
            className={`w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all flex justify-center items-center gap-2
              ${!hasClient || isOverLimit || isProcessing
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200 active:scale-[0.98]'
              }`}
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : (isOverLimit ? <Ban size={24}/> : <CheckCircle size={24} />)}
            {isProcessing ? 'Procesando...' : (isOverLimit ? 'Crédito No Autorizado' : 'Autorizar Crédito')}
          </button>

          {isOverLimit && (
            <p className="text-xs text-center text-slate-400">
                Disminuya productos del carrito (Esc) para ajustar el monto.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};