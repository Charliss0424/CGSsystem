import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { X, Lock, PieChart, Scissors } from 'lucide-react';
import { AdminAuthModal } from './AdminAuthModal';
import { CashCountModal } from './CashCountModal';
import { ShiftReportModal } from './ShiftReportModal';
import { ShiftReport } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Pasos del flujo
type Step = 'MENU' | 'AUTH' | 'CALCULATOR' | 'PROCESSING' | 'REPORT';

export const ShiftManager: React.FC<Props> = ({ isOpen, onClose }) => {
  const { generateShiftReport, closeShift, currentUser } = useDatabase();

  const [step, setStep] = useState<Step>('MENU');
  
  // Datos
  const [snapshotReport, setSnapshotReport] = useState<ShiftReport | null>(null);
  const [cashCounted, setCashCounted] = useState(0);
  const [reportType, setReportType] = useState<'X' | 'Z'>('X');

  // Reiniciar al abrir
  useEffect(() => {
    if (isOpen) {
        setStep('MENU');
        setSnapshotReport(null);
        setCashCounted(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- ACCIONES ---

  const handleXCut = async () => {
    setStep('PROCESSING');
    try {
      const report = await generateShiftReport();
      setSnapshotReport(report);
      setReportType('X');
      setStep('REPORT');
    } catch (error) {
      alert("Error al cargar datos.");
      setStep('MENU');
    }
  };

  const startZCut = () => {
    setReportType('Z');
    setStep('AUTH');
  };

  // 1. EL PIN ES CORRECTO
  const onAuthSuccess = () => {
    // Forzamos el paso a calculadora inmediatamente.
    // IMPORTANTE: Esto debe ocurrir antes de cualquier lógica de cierre.
    setStep('CALCULATOR');
  };

  // 2. CONTROLADOR DE CIERRE DEL MODAL DE AUTH
  const handleAuthClose = () => {
    // SOLUCIÓN AL BUG:
    // Solo permitimos volver al menú si TODAVÍA estamos en el paso AUTH.
    // Si ya cambiamos a CALCULATOR en onAuthSuccess, ignoramos este cierre.
    setStep((prevStep) => {
        if (prevStep === 'CALCULATOR') return prevStep; // No hacer nada, dejar en calculadora
        return 'MENU'; // Si canceló, volver al menú
    });
  };

  // 3. CONTEO CONFIRMADO
  const onCashCountConfirmed = async (total: number) => {
    setCashCounted(total);
    setStep('PROCESSING'); // Spinner mientras carga datos

    try {
        const report = await generateShiftReport();
        setSnapshotReport(report);
        setStep('REPORT');
    } catch (error) {
        console.error(error);
        alert("Error crítico al obtener información de ventas.");
        setStep('MENU');
    }
  };

  const handleCloseFinalReport = async () => {
    if (reportType === 'Z' && snapshotReport) {
      await closeShift(snapshotReport, cashCounted);
      alert("Turno cerrado correctamente.");
    }
    onClose();
  };

  return (
    <>
      {/* FONDO OSCURO */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />

      {/* 1. MENÚ DE SELECCIÓN */}
      {step === 'MENU' && (
        <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                <h2 className="font-bold text-lg">Gestión de Turnos</h2>
                <button onClick={onClose}><X size={20}/></button>
            </div>
            <div className="p-6 grid gap-4">
                <button onClick={handleXCut} className="flex items-center gap-4 p-4 rounded-xl border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left">
                    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg"><PieChart size={24} /></div>
                    <div><h3 className="font-bold text-slate-800">Corte Parcial (X)</h3><p className="text-xs text-slate-500">Solo lectura.</p></div>
                </button>
                <button onClick={startZCut} className="flex items-center gap-4 p-4 rounded-xl border-2 border-red-100 hover:border-red-500 hover:bg-red-50 transition-all text-left">
                    <div className="bg-red-100 text-red-600 p-3 rounded-lg"><Scissors size={24} /></div>
                    <div><h3 className="font-bold text-slate-800">Corte Final (Z)</h3><p className="text-xs text-slate-500">Requiere autorización.</p></div>
                    <Lock size={16} className="text-red-400 ml-auto" />
                </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PIN DE SEGURIDAD */}
      <AdminAuthModal 
        isOpen={step === 'AUTH'} 
        onClose={handleAuthClose} // Usamos la función protegida
        onSuccess={onAuthSuccess} 
        actionName="Autorizar Corte Z" 
      />

      {/* 3. CALCULADORA DE ARQUEO */}
      {step === 'CALCULATOR' && (
        <div className="relative z-[100]">
            <CashCountModal 
                isOpen={true} 
                onClose={() => setStep('MENU')} 
                onConfirm={onCashCountConfirmed} 
            />
        </div>
      )}

      {/* 4. PROCESANDO */}
      {step === 'PROCESSING' && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-white">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-lg drop-shadow-md">Procesando...</p>
        </div>
      )}

      {/* 5. REPORTE FINAL */}
      {step === 'REPORT' && snapshotReport && (
        <ShiftReportModal
          isOpen={true}
          onClose={handleCloseFinalReport}
          type={reportType}
          report={{
             ...snapshotReport,
             cashCounted: reportType === 'Z' ? cashCounted : undefined, 
             difference: reportType === 'Z' ? (cashCounted - snapshotReport.expectedCashInDrawer) : undefined
          }}
          cashierName={currentUser?.fullName || 'Cajero'}
        />
      )}
    </>
  );
};