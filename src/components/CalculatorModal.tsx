import React, { useState } from 'react';
import { X, Delete } from 'lucide-react';

interface CalculatorModalProps { isOpen: boolean; onClose: () => void; }

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('');

  if (!isOpen) return null;

  const handleBtn = (val: string) => setDisplay(prev => prev + val);
  const handleClear = () => setDisplay('');
  const handleEval = () => {
    try {
      // eslint-disable-next-line no-eval
      setDisplay(eval(display).toString());
    } catch {
      setDisplay('Error');
      setTimeout(() => setDisplay(''), 1000);
    }
  };

  const btns = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-800 p-4 rounded-2xl shadow-2xl w-full max-w-xs animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-4 text-white">
          <h3 className="font-bold">Calculadora</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        
        <div className="bg-slate-100 p-4 rounded-xl mb-4 text-right text-3xl font-mono font-bold text-slate-800 h-16 overflow-hidden">
          {display || '0'}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button onClick={handleClear} className="col-span-3 bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg font-bold">C</button>
          <button onClick={() => setDisplay(d => d.slice(0, -1))} className="bg-slate-600 hover:bg-slate-500 text-white p-3 rounded-lg flex items-center justify-center"><Delete size={20}/></button>
          
          {btns.map(btn => (
            <button
              key={btn}
              onClick={() => btn === '=' ? handleEval() : handleBtn(btn)}
              className={`p-4 rounded-lg font-bold text-xl transition-all active:scale-95 ${
                btn === '=' ? 'bg-green-500 text-white hover:bg-green-600' :
                ['/','*','-','+'].includes(btn) ? 'bg-indigo-500 text-white hover:bg-indigo-600' :
                'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};