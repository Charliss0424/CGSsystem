import React from 'react';
import { 
  Calculator, RotateCcw, Clock, Printer, 
  PauseCircle, Scissors, ArrowUpCircle, ArrowDownCircle, FileBarChart
} from 'lucide-react';

interface KeyboardShortcutsBarProps {
  onPress: (key: string) => void;
}

export const KeyboardShortcutsBar: React.FC<KeyboardShortcutsBarProps> = ({ onPress }) => {
  
  const shortcuts = [
    // Operaciones Comunes
    { key: 'F2', label: 'Pendientes', icon: Clock, color: 'bg-amber-600' },
    { key: 'F3', label: 'Devolución', icon: RotateCcw, color: 'bg-pink-600' },
    { key: 'F4', label: 'Reimp. Ticket', icon: Printer, color: 'bg-cyan-600' },
    
    // Herramientas
    { key: 'F5', label: 'Calculadora', icon: Calculator, color: 'bg-blue-600' },
    
    // Gestión de Dinero (NUEVOS VISUALMENTE)
    { key: 'F6', label: 'Entrada $', icon: ArrowUpCircle, color: 'bg-emerald-600' },
    { key: 'F7', label: 'Salida $', icon: ArrowDownCircle, color: 'bg-rose-600' },
    
    // Reportes
    { key: 'F8', label: 'Corte X (Parcial)', icon: FileBarChart, color: 'bg-violet-600' },
    { key: 'F9', label: 'Corte Z (Cierre)', icon: Scissors, color: 'bg-red-700' },
    
    // Ocultamos F10, F11, F12 visualmente para no saturar, pero siguen funcionando
  ];

  return (
    <div className="bg-slate-900 p-2 flex gap-2 overflow-x-auto border-t-4 border-slate-800 shadow-2xl shrink-0 pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
      {shortcuts.map((sc) => (
        <button
          key={sc.key}
          onClick={() => onPress(sc.key)}
          className={`${sc.color} hover:brightness-110 text-white px-3 py-2 rounded-lg flex flex-col items-center justify-center min-w-[95px] transition-all active:scale-95 group shadow-lg border-b-4 border-black/20`}
          title={`Presiona ${sc.key}`}
        >
          <div className="flex items-center gap-1 mb-1 opacity-90">
            <span className="text-[10px] font-mono bg-black/20 px-1.5 rounded text-white/90">{sc.key}</span>
            <sc.icon size={16} />
          </div>
          <span className="text-[11px] font-bold whitespace-nowrap leading-tight text-shadow-sm">{sc.label}</span>
        </button>
      ))}
    </div>
  );
};