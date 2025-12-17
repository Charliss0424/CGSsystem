import React, { useState } from 'react';
import { X, Printer, List, PieChart, DollarSign, Calendar } from 'lucide-react';
import { ShiftReport } from '../types';
import { printElement } from '../utils/printHelper';
import { ShiftReportTicket } from './ShiftReportTicket';

interface ShiftReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ShiftReport;
  cashierName: string;
  type: 'X' | 'Z';
  onConfirmCloseShift?: () => void; // Solo para Z
}

export const ShiftReportModal: React.FC<ShiftReportModalProps> = ({ 
  isOpen, onClose, report, cashierName, type, onConfirmCloseShift 
}) => {
  const [viewMode, setViewMode] = useState<'global' | 'detailed'>('global');

  if (!isOpen) return null;

  // Lógica de impresión
  const handlePrint = (detailed: boolean) => {
    const Ticket = (
        <ShiftReportTicket 
            report={report} 
            cashierName={cashierName} 
            type={type} 
            detailed={detailed} 
        />
    );
    printElement(Ticket);
    
    // Si es corte Z, ejecutamos el cierre real después de mandar imprimir
    if (type === 'Z' && onConfirmCloseShift) {
        onConfirmCloseShift();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-6 text-white flex justify-between items-center ${type === 'Z' ? 'bg-red-600' : 'bg-purple-600'}`}>
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    {type === 'Z' ? 'Corte Final (Z)' : 'Corte Parcial (X)'}
                </h2>
                <p className="opacity-80 flex items-center gap-2 text-sm mt-1">
                    <Calendar size={14}/> {new Date(report.generatedAt).toLocaleString()}
                </p>
            </div>
            <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"><X size={24}/></button>
        </div>

        {/* Tabs de Vista */}
        <div className="flex border-b border-slate-200">
            <button 
                onClick={() => setViewMode('global')}
                className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${viewMode === 'global' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <PieChart size={20}/> Resumen Global
            </button>
            <button 
                onClick={() => setViewMode('detailed')}
                className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${viewMode === 'detailed' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <List size={20}/> Detalle de Productos
            </button>
        </div>

        {/* Contenido Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            
            {/* VISTA GLOBAL */}
            {viewMode === 'global' && (
                <div className="space-y-6">
                    {/* Tarjetas de Resumen */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Ventas Totales</p>
                            <p className="text-3xl font-bold text-slate-800">${report.totalSales.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Dinero en Caja</p>
                            <p className="text-3xl font-bold text-green-600">${report.expectedCashInDrawer.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Desglose */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-600 text-sm">Desglose de Ingresos</div>
                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex justify-between"><span>Ventas Efectivo</span><span className="font-bold">${report.cashSales.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Ventas Tarjeta</span><span className="font-bold">${report.cardSales.toFixed(2)}</span></div>
                            <div className="flex justify-between text-slate-400"><span>Crédito (No ingresa dinero)</span><span>${(report.totalSales - report.cashSales - report.cardSales).toFixed(2)}</span></div>
                            <div className="border-t border-dashed border-slate-200 my-2"></div>
                            <div className="flex justify-between text-green-600"><span>(+) Fondo Inicial / Entradas</span><span>${(report.initialFund + report.cashIn).toFixed(2)}</span></div>
                            <div className="flex justify-between text-red-500"><span>(-) Gastos / Retiros</span><span>-${report.cashOut.toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>
            )}

            {/* VISTA DETALLADA */}
            {viewMode === 'detailed' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-3">Cant.</th>
                                <th className="p-3">Producto</th>
                                <th className="p-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {report.soldProducts && report.soldProducts.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="p-3 text-center font-bold text-slate-600">{p.quantity}</td>
                                    <td className="p-3">{p.name}</td>
                                    <td className="p-3 text-right font-mono text-indigo-600">${p.total.toFixed(2)}</td>
                                </tr>
                            ))}
                            {(!report.soldProducts || report.soldProducts.length === 0) && (
                                <tr><td colSpan={3} className="p-8 text-center text-slate-400">No hay ventas registradas en este turno.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* Footer con Botones de Acción */}
        <div className="p-6 bg-white border-t border-slate-200 flex gap-4">
            <button 
                onClick={() => handlePrint(false)} 
                className="flex-1 py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
            >
                <Printer size={20}/> Imprimir Resumen
            </button>
            
            <button 
                onClick={() => handlePrint(true)} 
                className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95
                    ${type === 'Z' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'}`}
            >
                <Printer size={20}/> Imprimir Detallado
            </button>
        </div>
      </div>
    </div>
  );
};