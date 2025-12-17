import React, { useState, useEffect } from 'react';
import { Clock, RotateCcw, Printer, Calculator, ArrowUpCircle, ArrowDownCircle, Scissors, FileText } from 'lucide-react';
import { AdminAuthModal } from './AdminAuthModal'; 
import { useDatabase } from '../context/DatabaseContext';
import { ShiftReportModal } from './ShiftReportModal';
import { printElement } from '../utils/printHelper';
import { TicketTemplate } from './TicketTemplate';
import { CashFlowModal } from './CashFlowModal';
import { CalculatorModal } from './CalculatorModal';
import { CashFlowTicket } from './CashFlowTicket';
import { ViewState } from '../types';
import { supabase } from '../services/supabase';

interface KeyboardShortcutsBarProps {
  setView: (view: ViewState) => void;
}

export const KeyboardShortcutsBar: React.FC<KeyboardShortcutsBarProps> = ({ setView }) => {
  const { generateShiftReport, closeShift, currentUser, sales, registerCashMovement } = useDatabase();
  
  // Estados para Modales
  const [showAuth, setShowAuth] = useState(false);
  const [authAction, setAuthAction] = useState<'Z_CUT' | 'REPRINT' | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'X' | 'Z'>('X');

  // Flujo de Efectivo
  const [showCashFlow, setShowCashFlow] = useState(false);
  const [cashFlowType, setCashFlowType] = useState<'IN' | 'OUT'>('IN');
  
  // CALCULADORA: Inicia cerrada (false)
  const [showCalculator, setShowCalculator] = useState(false);

  // --- ESCUCHA DE TECLAS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (showAuth || showReportModal || showCashFlow) return;

        switch(e.key) {
            case 'F2': e.preventDefault(); handlePending(); break;
            case 'F3': e.preventDefault(); handleReturns(); break;
            case 'F4': e.preventDefault(); initiateReprint(); break;
            case 'F5': e.preventDefault(); toggleCalculator(); break;
            case 'F6': e.preventDefault(); handleCashFlow('IN'); break;
            case 'F7': e.preventDefault(); handleCashFlow('OUT'); break;
            case 'F8': e.preventDefault(); initiateXCut(); break;
            case 'F9': e.preventDefault(); initiateZCut(); break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAuth, showReportModal, showCashFlow, showCalculator, sales]); // Dependencias importantes

  // --- NAVEGACIÓN (F2/F3) ---
  const handlePending = () => setView('PENDING_SALES');
  const handleReturns = () => setView('POS_RETURNS');
  
  // --- REIMPRESIÓN (F4) ---
  const initiateReprint = () => { setAuthAction('REPRINT'); setShowAuth(true); };
  const processReprint = async () => {
    const lastSale = sales[0];
    if (!lastSale) return alert("No hay ventas recientes.");
    if ((lastSale as any).z_report_id) return alert("⛔ ERROR: Turno cerrado.");
    
    // Imprimir
    const savings = lastSale.items.reduce((acc, item) => acc + ((item.price * item.quantity) - item.subtotal), 0);
    const subtotal = lastSale.total / 1.16;
    const Ticket = <TicketTemplate cart={lastSale.items} total={lastSale.total} savings={savings} subtotal={subtotal} amountTendered={lastSale.amountTendered} change={lastSale.change} ticketId={lastSale.id} customerName={lastSale.customerName} isReprint={true} />;
    printElement(Ticket);
    
    // Actualizar contador
    const count = (lastSale as any).reprint_count || 0;
    await supabase.from('sales').update({ reprint_count: count + 1 }).eq('id', lastSale.id);
  };

  // --- CALCULADORA (F5) ---
  const toggleCalculator = () => setShowCalculator(prev => !prev);

  // --- FLUJO DE EFECTIVO (F6/F7) ---
  const handleCashFlow = (type: 'IN' | 'OUT') => { setCashFlowType(type); setShowCashFlow(true); };

  // Nueva lógica que recibe 'shouldPrint'
  const handleCashFlowConfirm = async (amount: number, reason: string, shouldPrint: boolean) => {
    await registerCashMovement(cashFlowType, amount, reason);
    
    // SOLO IMPRIMIR SI EL USUARIO QUISO
    if (shouldPrint) {
        const Ticket = <CashFlowTicket type={cashFlowType} amount={amount} reason={reason} date={new Date().toISOString()} user={currentUser?.fullName || 'Cajero'} authorizedBy={authAction === 'Z_CUT' ? 'Supervisor' : undefined} />;
        printElement(Ticket);
    }
    
    setShowCashFlow(false);
  };

  // --- CORTES (F8/F9) ---
  const initiateXCut = async () => { const report = await generateShiftReport(); setReportData(report); setReportType('X'); setShowReportModal(true); };
  const initiateZCut = () => { setAuthAction('Z_CUT'); setShowAuth(true); };
  const handleAuthSuccess = async () => {
    setShowAuth(false);
    if (authAction === 'Z_CUT') { const report = await generateShiftReport(); setReportData(report); setReportType('Z'); setShowReportModal(true); } 
    else if (authAction === 'REPRINT') { processReprint(); }
  };
  const handleCloseShiftConfirm = async () => { if (reportData) await closeShift(reportData, reportData.expectedCashInDrawer); };

  return (
    <>
      <div className="bg-slate-900 p-2 flex justify-between items-center gap-2 overflow-x-auto select-none mt-auto sticky bottom-0 z-40 w-full shadow-lg border-t border-slate-700">
        <div className="flex gap-2">
            <ShortcutButton k="F2" label="Pendientes" icon={Clock} color="bg-orange-600" onClick={handlePending} />
            <ShortcutButton k="F3" label="Devolución" icon={RotateCcw} color="bg-pink-600" onClick={handleReturns} />
            <ShortcutButton k="F4" label="Reimp. Ticket" icon={Printer} color="bg-teal-600" onClick={initiateReprint} />
            <ShortcutButton k="F5" label="Calculadora" icon={Calculator} color="bg-blue-600" onClick={toggleCalculator} />
        </div>
        <div className="flex gap-2">
            <ShortcutButton k="F6" label="Entrada $" icon={ArrowUpCircle} color="bg-emerald-600" onClick={() => handleCashFlow('IN')} />
            <ShortcutButton k="F7" label="Salida $" icon={ArrowDownCircle} color="bg-red-600" onClick={() => handleCashFlow('OUT')} />
            <button onClick={initiateXCut} className="flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-lg transition-colors min-w-[90px]"><div className="flex items-center gap-1 text-[10px] font-bold opacity-80"><span>F8</span></div><span className="text-xs font-bold whitespace-nowrap flex items-center gap-1"><FileText size={12}/> Corte X</span></button>
            <button onClick={initiateZCut} className="flex flex-col items-center justify-center bg-red-700 hover:bg-red-600 text-white px-4 py-1 rounded-lg transition-colors min-w-[100px]"><div className="flex items-center gap-1 text-[10px] font-bold opacity-80"><Scissors size={12} /> <span>F9</span></div><span className="text-xs font-bold whitespace-nowrap">Corte Z</span></button>
        </div>
      </div>

      <AdminAuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} actionName={authAction === 'Z_CUT' ? "Realizar Corte Z" : "Reimprimir Ticket"} />
      {showReportModal && reportData && <ShiftReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} report={reportData} type={reportType} cashierName={currentUser?.fullName || 'Admin'} onConfirmCloseShift={handleCloseShiftConfirm} />}
      
      {/* MODAL DE FLUJO CON LA NUEVA LÓGICA */}
      <CashFlowModal isOpen={showCashFlow} onClose={() => setShowCashFlow(false)} type={cashFlowType} onConfirm={handleCashFlowConfirm} />

      {/* CALCULADORA FLOTANTE */}
      {showCalculator && <CalculatorModal onClose={() => setShowCalculator(false)} />}
    </>
  );
};

const ShortcutButton = ({ k, label, icon: Icon, color, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center ${color} hover:opacity-90 text-white px-3 py-1 rounded-lg transition-colors min-w-[90px]`}>
    <div className="flex items-center gap-1 text-[10px] font-bold opacity-80"><span>{k}</span></div>
    <span className="text-xs font-bold whitespace-nowrap flex items-center gap-1"><Icon size={12}/> {label}</span>
  </button>
);