import React from 'react';
import { X, Calendar, DollarSign, FileText } from 'lucide-react';
import { Sale } from '../types';

interface TicketHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
}

export const TicketHistoryModal: React.FC<TicketHistoryModalProps> = ({ isOpen, onClose, sale }) => {
  if (!isOpen) return null;

  const history = sale.paymentHistory || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">Historial del Ticket</h3>
            <p className="text-xs text-indigo-600 font-mono">#{sale.id.slice(0, 8)}</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-red-500"/></button>
        </div>

        <div className="p-4">
          
          {/* Resumen del Ticket */}
          <div className="flex justify-between items-center mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Total Original</p>
                <p className="text-lg font-bold text-slate-700">${sale.total.toFixed(2)}</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-bold">Saldo Pendiente</p>
                <p className="text-lg font-bold text-red-500">
                    ${(sale.remainingBalance ?? (sale.total - (sale.amountTendered||0))).toFixed(2)}
                </p>
            </div>
          </div>

          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
            <History size={12}/> Movimientos Registrados
          </h4>

          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {history.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-sm">
                    No hay historial detallado disponible para este ticket.
                </div>
            ) : (
                history.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <DollarSign size={16}/>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Abono</p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Calendar size={10}/> {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                        <span className="font-bold text-green-600">+${item.amount.toFixed(2)}</span>
                    </div>
                ))
            )}
          </div>

          <button onClick={onClose} className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
import { History } from 'lucide-react'; // Icono necesario