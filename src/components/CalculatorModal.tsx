import React, { useState, useRef } from 'react';
import { X, Delete, GripHorizontal } from 'lucide-react';

export const CalculatorModal = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState('0');
  
  // Estado para arrastrar
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: window.innerHeight - 450 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleBtn = (val: string) => {
    if (val === 'C') setDisplay('0');
    else if (val === '=') {
        try { 
            // eslint-disable-next-line
            setDisplay(eval(display).toString()); 
        } catch { setDisplay('Error'); }
    } else if (val === 'DEL') {
        setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else {
        setDisplay(prev => prev === '0' ? val : prev + val);
    }
  };

  const buttons = ['C', '/', '*', 'DEL', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'];

  return (
    <div 
        className="fixed z-[9999] bg-slate-900 p-4 rounded-2xl shadow-2xl w-72 border border-slate-700 select-none"
        style={{ left: position.x, top: position.y, cursor: isDragging ? 'grabbing' : 'default' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
      <div 
        className="flex justify-between items-center mb-4 text-white cursor-grab active:cursor-grabbing border-b border-slate-700 pb-2"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 opacity-70">
            <GripHorizontal size={18}/>
            <span className="font-bold text-xs uppercase">Calculadora</span>
        </div>
        <button onClick={onClose} className="hover:text-red-400"><X size={18}/></button>
      </div>
      
      <div className="bg-slate-800 p-4 rounded-xl mb-4 text-right text-3xl font-mono text-white truncate h-20 flex items-center justify-end border border-slate-600 shadow-inner">
        {display}
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {buttons.map(btn => (
            <button 
                key={btn} 
                onClick={() => handleBtn(btn)}
                className={`h-12 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg ${
                    ['=','+','-','*','/'].includes(btn) ? 'bg-blue-600 text-white hover:bg-blue-500' : 
                    btn === 'C' || btn === 'DEL' ? 'bg-red-600 text-white hover:bg-red-500' :
                    btn === '0' ? 'bg-slate-700 text-white col-span-2 hover:bg-slate-600' :
                    'bg-slate-700 text-white hover:bg-slate-600'
                }`}
            >
                {btn === 'DEL' ? <Delete size={20} className="mx-auto"/> : btn}
            </button>
        ))}
      </div>
    </div>
  );
};