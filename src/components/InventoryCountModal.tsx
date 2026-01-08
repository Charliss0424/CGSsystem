import React, { useState, useEffect } from 'react';
import { X, Save, Box, Scale, Calculator, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onConfirm: (finalStock: number) => void;
}

export const InventoryCountModal: React.FC<Props> = ({ 
  isOpen, onClose, product, onConfirm 
}) => {
  // Estados para el conteo físico
  const [packs, setPacks] = useState('');       // Cantidad de Bultos/Cajas
  const [loose, setLoose] = useState('');       // Cantidad de Kilos/Piezas sueltas
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setPacks('');
      setLoose('');
      setCalculatedTotal(0);
    }
  }, [isOpen]);

  // Recalcular en tiempo real
  useEffect(() => {
    const packQty = parseFloat(packs) || 0;
    const looseQty = parseFloat(loose) || 0;
    const factor = product.packContent || 1;

    // Fórmula Maestra: (Bultos * 25) + Sueltos
    const total = (packQty * factor) + looseQty;
    setCalculatedTotal(total);
  }, [packs, loose, product]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (confirm(`¿Confirmas que el inventario real es ${calculatedTotal} ${product.unitBase}?`)) {
        onConfirm(calculatedTotal);
        onClose();
    }
  };

  // Si el producto no tiene configuración avanzada, mostramos modo simple
  const isAdvanced = product.packContent && product.packContent > 1;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in zoom-in-95">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-5 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calculator size={24} className="text-blue-400"/> Auditoría de Inventario
            </h2>
            <p className="text-slate-400 text-sm">{product.name}</p>
          </div>
          <button onClick={onClose}><X size={24}/></button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          
          {/* MODO AVANZADO (BULTOS + SUELTOS) */}
          {isAdvanced ? (
            <div className="grid grid-cols-2 gap-4">
              
              {/* CAMPO 1: EMPAQUES CERRADOS */}
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2 text-indigo-800 font-bold">
                  <Box size={20}/> 
                  {product.packUnit || 'Empaques'} 
                  <span className="text-xs font-normal opacity-70">
                    (x{product.packContent} {product.unitBase})
                  </span>
                </div>
                <input 
                  type="number" 
                  autoFocus
                  className="w-full text-3xl font-bold text-center bg-white border border-indigo-200 rounded-lg py-2 focus:ring-4 focus:ring-indigo-200 outline-none text-indigo-900"
                  placeholder="0"
                  value={packs}
                  onChange={e => setPacks(e.target.value)}
                />
                <p className="text-center text-xs text-indigo-400 mt-2">Cajas/Bultos cerrados</p>
              </div>

              {/* CAMPO 2: UNIDADES SUELTAS */}
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <div className="flex items-center gap-2 mb-2 text-orange-800 font-bold">
                  <Scale size={20}/> 
                  {product.unitBase || 'Unidades'} (Sueltas)
                </div>
                <input 
                  type="number" 
                  className="w-full text-3xl font-bold text-center bg-white border border-orange-200 rounded-lg py-2 focus:ring-4 focus:ring-orange-200 outline-none text-orange-900"
                  placeholder="0"
                  value={loose}
                  onChange={e => setLoose(e.target.value)}
                />
                <p className="text-center text-xs text-orange-400 mt-2">Lo que sobró / abierto</p>
              </div>

            </div>
          ) : (
            // MODO SIMPLE (SOLO UNIDADES)
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
               <p className="text-slate-500 font-medium mb-2">Conteo Total ({product.unitBase || 'Piezas'})</p>
               <input 
                  type="number" 
                  autoFocus
                  className="w-48 text-4xl font-bold text-center bg-white border border-slate-300 rounded-lg py-3 focus:ring-4 focus:ring-slate-200 outline-none text-slate-800 mx-auto block"
                  placeholder="0"
                  value={loose}
                  onChange={e => {
                      setLoose(e.target.value);
                      setCalculatedTotal(parseFloat(e.target.value) || 0);
                  }}
                />
            </div>
          )}

          {/* RESULTADO CALCULADO */}
          <div className="bg-slate-800 text-white p-4 rounded-xl flex justify-between items-center shadow-lg">
             <div>
                <p className="text-slate-400 text-xs font-bold uppercase">Inventario Total Calculado</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-mono font-bold text-emerald-400">
                        {calculatedTotal}
                    </span>
                    <span className="text-sm font-medium text-slate-300">
                        {product.unitBase || 'pza'}
                    </span>
                </div>
             </div>
             
             {/* DIFERENCIA VISUAL (Opcional) */}
             <div className="text-right border-l border-slate-600 pl-4">
                <p className="text-xs text-slate-400">Sistema dice:</p>
                <p className="font-mono text-sm">{product.stock} {product.unitBase}</p>
                <p className={`text-xs font-bold ${calculatedTotal - product.stock < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    Dif: {calculatedTotal - product.stock}
                </p>
             </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
                <Save size={20}/> Guardar Conteo
            </button>
        </div>

      </div>
    </div>
  );
};