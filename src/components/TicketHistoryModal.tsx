import React from 'react';
import { X, Calendar, DollarSign, History, Printer } from 'lucide-react';
import { Sale } from '../types';
import { printElement } from '../utils/printHelper';

interface TicketHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const STORE_NAME = "ABARROTES EL PUNTO";

export const TicketHistoryModal: React.FC<TicketHistoryModalProps> = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  const history = sale.paymentHistory || [];
  const pending = sale.remainingBalance ?? (sale.total - (sale.amountTendered || 0));

  const handlePrintHistory = () => {
    const HistoryPrint = (
        <div style={{width: '72mm', fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase', padding: '5px'}}>
            <div style={{textAlign: 'center', marginBottom: '10px'}}>
                <div style={{fontSize: '14px', fontWeight: 'bold'}}>{STORE_NAME}</div>
                <div>HISTORIAL DE PAGOS</div>
            </div>
            <div>FECHA VENTA: {new Date(sale.date).toLocaleDateString()}</div>
            <div>TICKET: #{sale.id.slice(0,8)}</div>
            <div style={{marginBottom: '5px'}}>CLIENTE: {sale.customerName}</div>
            
            <div style={{borderBottom: '1px dashed black', margin: '5px 0'}}></div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
                <span>TOTAL ORIGINAL:</span>
                <span>${sale.total.toFixed(2)}</span>
            </div>
            <div style={{borderBottom: '1px dashed black', margin: '5px 0'}}></div>

            <div style={{textAlign: 'center', marginBottom: '5px', fontWeight: 'bold'}}>MOVIMIENTOS</div>
            {history.length === 0 ? (
                <div style={{textAlign: 'center'}}>SIN ABONOS REGISTRADOS</div>
            ) : (
                history.map((h, i) => (
                    <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2px'}}>
                        <span>{new Date(h.date).toLocaleDateString()}</span>
                        <span>ABONO: ${h.amount.toFixed(2)}</span>
                    </div>
                ))
            )}

            <div style={{borderBottom: '1px dashed black', margin: '5px 0'}}></div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px'}}>
                <span>SALDO PENDIENTE:</span>
                <span>${pending.toFixed(2)}</span>
            </div>
        </div>
    );
    printElement(HistoryPrint);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header con botón de Impresión */}
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <History size={18} className="text-blue-600"/>
                Trazabilidad de Pagos
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">Ticket: #{sale.id.slice(0, 8)}</p>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
                onClick={handlePrintHistory}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Imprimir Historial"
            >
                <Printer size={20}/>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <X size={20}/>
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Resumen */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-bold uppercase">Total Original</p>
                <p className="text-lg font-bold text-slate-700">${sale.total.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-bold uppercase">Saldo Pendiente</p>
                <p className={`text-lg font-bold ${pending > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    ${pending.toFixed(2)}
                </p>
            </div>
          </div>

          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 pl-1">Movimientos Registrados</h4>

          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 mb-4">
            {history.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                    No hay abonos registrados en el historial.<br/>
                    <span className="text-xs">(Probablemente se pagó en una sola exhibición o es una venta antigua)</span>
                </div>
            ) : (
                history.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <DollarSign size={16}/>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Abono Recibido</p>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                    <Calendar size={10}/> 
                                    {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                        <span className="font-bold text-green-600 text-lg">+${item.amount.toFixed(2)}</span>
                    </div>
                ))
            )}
          </div>

          {/* Botón único de cerrar */}
          <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-slate-200">
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};