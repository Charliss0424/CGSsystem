import React, { useState, useEffect, useRef } from 'react';
import { X, Scale, CheckCircle, Calculator, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (weight: number) => void;
}

export const WeightModal: React.FC<WeightModalProps> = ({ isOpen, onClose, product, onConfirm }) => {
  // Estado separado para Kilos/Litros y Gramos/Mililitros
  const [majorQty, setMajorQty] = useState<string>(''); // Kilos o Litros
  const [minorQty, setMinorQty] = useState<string>(''); // Gramos o Mililitros

  const majorInputRef = useRef<HTMLInputElement>(null);
  const minorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMajorQty('');
      setMinorQty('');
      // Enfocar el primer campo al abrir
      setTimeout(() => majorInputRef.current?.focus(), 50);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // Cálculos matemáticos
  const kilos = parseFloat(majorQty) || 0;
  const gramos = parseFloat(minorQty) || 0;
  
  // Fórmula maestra: Kilos + (Gramos / 1000)
  const totalQuantity = kilos + (gramos / 1000);
  const totalPrice = totalQuantity * product.price;

  const handleConfirm = () => {
    if (totalQuantity > 0) {
      onConfirm(totalQuantity);
      onClose();
    }
  };

  // Manejo inteligente del teclado
  const handleKeyDownMajor = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === '.') {
        e.preventDefault();
        minorInputRef.current?.focus(); // Salta a gramos
    }
    if (e.key === 'Escape') onClose();
  };

  const handleKeyDownMinor = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm(); // Confirma venta
    if (e.key === 'ArrowLeft') majorInputRef.current?.focus(); // Regresa a kilos
    if (e.key === 'Escape') onClose();
  };

  // Botones rápidos para gramos comunes
  const quickGrams = [100, 250, 500, 750]; 

  // Determinar si es líquido o sólido (solo visual)
  // Puedes mejorar esto si en tu DB tienes un campo 'unitType', por ahora asumo mixto
  const labels = {
      major: "Kilos / Litros",
      minor: "Gramos / Ml",
      abbrMajor: "Kg/L",
      abbrMinor: "gr/ml"
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        
        {/* HEADER */}
        <div className="bg-slate-800 p-5 text-white flex justify-between items-start relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-medium opacity-90 flex items-center gap-2 text-orange-400">
              <Scale size={20}/> Medición Manual
            </h3>
            <p className="text-xl font-bold mt-1 text-white truncate w-64">{product.name}</p>
            <p className="text-sm text-slate-400">Precio: ${product.price.toFixed(2)} / {labels.abbrMajor}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1 rounded-full transition-colors relative z-10">
            <X size={24} />
          </button>
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <Calculator size={140} />
          </div>
        </div>

        {/* CUERPO PRINCIPAL */}
        <div className="p-6 space-y-6 bg-slate-50">
          
          {/* ÁREA DE INPUTS DUALES */}
          <div className="flex gap-4 items-stretch">
            
            {/* INPUT 1: KILOS / LITROS */}
            <div className="flex-1 bg-white p-4 rounded-xl border-2 border-slate-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100 transition-all shadow-sm">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{labels.major}</label>
                <div className="flex items-baseline">
                    <input
                        ref={majorInputRef}
                        type="number"
                        min="0"
                        value={majorQty}
                        onChange={e => setMajorQty(e.target.value)}
                        onKeyDown={handleKeyDownMajor}
                        placeholder="0"
                        className="w-full text-5xl font-black text-slate-800 outline-none placeholder:text-slate-200"
                    />
                    <span className="text-sm font-bold text-slate-400">{labels.abbrMajor}</span>
                </div>
            </div>

            {/* SEPARADOR DECIMAL VISUAL */}
            <div className="flex items-end pb-6 text-slate-300">
                <div className="w-2 h-2 bg-slate-400 rounded-full mb-2"></div>
            </div>

            {/* INPUT 2: GRAMOS / MILILITROS */}
            <div className="flex-1 bg-white p-4 rounded-xl border-2 border-slate-200 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-100 transition-all shadow-sm">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{labels.minor}</label>
                <div className="flex items-baseline">
                    <input
                        ref={minorInputRef}
                        type="number"
                        min="0"
                        max="999"
                        value={minorQty}
                        onChange={e => {
                            // Limitar a 3 dígitos para evitar errores (ej. 1000g = 1kg)
                            if (e.target.value.length <= 3) setMinorQty(e.target.value);
                        }}
                        onKeyDown={handleKeyDownMinor}
                        placeholder="000"
                        className="w-full text-5xl font-black text-slate-800 outline-none placeholder:text-slate-200"
                    />
                    <span className="text-sm font-bold text-slate-400">{labels.abbrMinor}</span>
                </div>
            </div>

          </div>

          {/* BOTONES RÁPIDOS (Gramos) */}
          <div className="grid grid-cols-4 gap-3">
            {quickGrams.map(g => (
                <button 
                    key={g}
                    onClick={() => { 
                        setMinorQty(g.toString()); 
                        minorInputRef.current?.focus();
                    }}
                    className="py-2.5 bg-white border border-slate-200 hover:border-green-400 hover:bg-green-50 hover:text-green-700 text-slate-600 font-bold rounded-lg transition-all shadow-sm active:scale-95"
                >
                    {g} {labels.abbrMinor}
                </button>
            ))}
          </div>

          {/* RESUMEN FINAL */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-sm text-slate-500 mb-1">
                <span>Peso Total Calculado:</span>
                <span className="font-mono">{totalQuantity.toFixed(3)} {labels.abbrMajor}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                <span className="font-bold text-slate-800 text-lg">Total a Cobrar:</span>
                <span className="font-black text-3xl text-indigo-600">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={totalQuantity <= 0}
            className={`w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all flex justify-center items-center gap-2
              ${totalQuantity > 0 ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98]' : 'bg-slate-300 cursor-not-allowed'}
            `}
          >
            <CheckCircle size={24} />
            Agregar al Carrito
          </button>
          
          <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <span>[Enter] Cambiar campo / Confirmar</span>
            <span>•</span>
            <span>[Esc] Cancelar</span>
          </div>

        </div>
      </div>
    </div>
  );
};