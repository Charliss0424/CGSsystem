import React, { useState } from 'react';
import { X, Printer, List, PieChart, Calendar, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { ShiftReport } from '../types';
import { printElement } from '../utils/printHelper';
import { ShiftReportTicket } from './ShiftReportTicket';

interface ShiftReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ShiftReport & { cashCounted?: number; difference?: number }; // Extendemos para aceptar datos de arqueo
  cashierName: string;
  type: 'X' | 'Z';
  onConfirmCloseShift?: () => void;
}

export const ShiftReportModal: React.FC<ShiftReportModalProps> = ({ 
  isOpen, onClose, report, cashierName, type, onConfirmCloseShift 
}) => {
  const [viewMode, setViewMode] = useState<'global' | 'detailed'>('global');
  const [isConfirmed, setIsConfirmed] = useState(false); // Para obligar a marcar el checkbox en Z

  if (!isOpen) return null;

  const handlePrint = (detailed: boolean) => {
    // Validación de seguridad para Corte Z
    if (type === 'Z' && !isConfirmed) {
      alert("Por favor confirma que deseas cerrar el turno.");
      return;
    }

    const Ticket = (
        <ShiftReportTicket 
            report={report} 
            cashierName={cashierName} 
            type={type} 
            detailed={detailed} 
        />
    );
    printElement(Ticket);
    
    // Ejecutar el cierre real en BD solo si es Z y está confirmado
    if (type === 'Z' && onConfirmCloseShift) {
        onConfirmCloseShift();
    }
  };

  // Formateador de moneda
  const money = (amount: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in zoom-in-95">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER DIFERENCIADO POR TIPO */}
        <div className={`p-6 text-white flex justify-between items-center ${type === 'Z' ? 'bg-red-600' : 'bg-indigo-600'}`}>
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    {type === 'Z' ? <Lock size={24}/> : <PieChart size={24}/>}
                    {type === 'Z' ? 'Corte Final (Z)' : 'Corte Parcial (X)'}
                </h2>
                <p className="opacity-80 flex items-center gap-2 text-xs mt-1 font-mono">
                    <Calendar size={14}/> {new Date(report.generatedAt).toLocaleString()}
                </p>
            </div>
            <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                <X size={24}/>
            </button>
        </div>

        {/* TABS DE NAVEGACIÓN */}
        <div className="flex border-b border-slate-200 bg-slate-50">
            <button 
                onClick={() => setViewMode('global')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${viewMode === 'global' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                <PieChart size={18}/> Resumen Global
            </button>
            <button 
                onClick={() => setViewMode('detailed')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${viewMode === 'detailed' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                <List size={18}/> Detalle de Productos
            </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            
            {/* --- VISTA GLOBAL --- */}
            {viewMode === 'global' && (
                <div className="space-y-6">
                    
                    {/* ADVERTENCIA DE CIERRE (Solo Z) */}
                    {type === 'Z' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-amber-800 text-sm">Cierre de Turno</h4>
                                <p className="text-xs text-amber-700 mt-1">
                                    Al confirmar, los contadores se reiniciarán a cero. Asegúrate de que el efectivo físico coincida.
                                </p>
                                <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                        checked={isConfirmed}
                                        onChange={(e) => setIsConfirmed(e.target.checked)}
                                    />
                                    <span className="font-bold text-slate-700 text-sm">Entiendo, cerrar turno.</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* TARJETAS KPI */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                            <p className="text-slate-400 text-[10px] font-bold uppercase mb-1 tracking-wider">Ventas Totales</p>
                            <p className="text-3xl font-bold text-slate-800">{money(report.totalSales)}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                            <p className="text-slate-400 text-[10px] font-bold uppercase mb-1 tracking-wider">Dinero Esperado</p>
                            <p className="text-3xl font-bold text-green-600">{money(report.expectedCashInDrawer)}</p>
                        </div>
                    </div>

                    {/* CAJA DE DIFERENCIA (Solo si se hizo arqueo en Z) */}
                    {type === 'Z' && report.difference !== undefined && (
                        <div className={`p-4 rounded-xl border-2 flex justify-between items-center shadow-sm ${
                            report.difference < -1 ? 'bg-red-50 border-red-100 text-red-700' : 
                            report.difference > 1 ? 'bg-green-50 border-green-100 text-green-700' : 
                            'bg-blue-50 border-blue-100 text-blue-700'
                        }`}>
                            <div>
                                <p className="font-bold text-sm flex items-center gap-2">
                                    {report.difference < -1 ? <AlertTriangle size={18}/> : <CheckCircle size={18}/>}
                                    Resultado del Arqueo
                                </p>
                                <p className="text-xs opacity-80 mt-1">
                                    Contaste: <b>{money(report.cashCounted || 0)}</b>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-1">
                                    {report.difference < -1 ? 'FALTANTE' : report.difference > 1 ? 'SOBRANTE' : 'CUADRADO'}
                                </p>
                                <p className="text-2xl font-black tracking-tight">
                                    {report.difference > 0 ? '+' : ''}{money(report.difference)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* DESGLOSE DETALLADO */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-sm">
                        <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-600 text-xs uppercase tracking-wider">Flujo de Efectivo</div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between"><span>Ventas Efectivo</span><span className="font-bold">{money(report.cashSales)}</span></div>
                            <div className="flex justify-between"><span>Ventas Tarjeta</span><span className="font-bold text-slate-500">{money(report.cardSales)}</span></div>
                            <div className="flex justify-between text-slate-400"><span>Crédito (No caja)</span><span>{money(report.totalSales - report.cashSales - report.cardSales)}</span></div>
                            <div className="border-t border-dashed border-slate-200 my-1"></div>
                            <div className="flex justify-between text-green-600"><span>(+) Fondo Inicial / Entradas</span><span>{money(report.initialFund + report.cashIn)}</span></div>
                            <div className="flex justify-between text-red-500"><span>(-) Gastos / Retiros</span><span>-{money(report.cashOut)}</span></div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- VISTA DETALLADA --- */}
            {viewMode === 'detailed' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-3 text-center w-16">Cant.</th>
                                <th className="p-3">Producto</th>
                                <th className="p-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {report.soldProducts && report.soldProducts.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                    <td className="p-3 text-center font-bold text-slate-600">{p.quantity}</td>
                                    <td className="p-3">
                                        <div className="font-medium text-slate-800">{p.name}</div>
                                        {/* Precio unitario implícito para claridad */}
                                        <div className="text-[10px] text-slate-400">
                                            @ {money(Number(p.total) / Number(p.quantity))} c/u
                                        </div>
                                    </td>
                                    <td className="p-3 text-right font-mono text-indigo-600 font-bold">
                                        {money(Number(p.total))}
                                    </td>
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

        {/* FOOTER ACCIONES */}
        <div className="p-5 bg-white border-t border-slate-200 flex gap-4 shrink-0">
            <button 
                onClick={() => handlePrint(false)} 
                disabled={type === 'Z' && !isConfirmed}
                className={`flex-1 py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all
                ${type === 'Z' && !isConfirmed ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50 hover:border-slate-300'}`}
            >
                <Printer size={18}/> 
                {type === 'Z' ? 'Cerrar e Imprimir Resumen' : 'Imprimir Resumen'}
            </button>
            
            <button 
                onClick={() => handlePrint(true)} 
                disabled={type === 'Z' && !isConfirmed}
                className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95
                    ${type === 'Z' 
                        ? (isConfirmed ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-slate-400 cursor-not-allowed') 
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
            >
                <Printer size={18}/> 
                {type === 'Z' ? 'Cerrar e Imprimir Detallado' : 'Imprimir Detallado'}
            </button>
        </div>
      </div>
    </div>
  );
};