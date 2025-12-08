import React, { useState, useEffect, useRef } from 'react';
import { X, Box, ShoppingBag, LayoutGrid } from 'lucide-react'; // LayoutGrid nuevo icono
import { Product, ProductPresentation } from '../types';

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (qty: number, presentation?: ProductPresentation | null, isFractional?: boolean) => void;
  product: Product;
}

export const QuantityModal: React.FC<QuantityModalProps> = ({ isOpen, onClose, onConfirm, product }) => {
  const [qtyStr, setQtyStr] = useState("1");
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      setQtyStr("1");
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const qty = parseInt(qtyStr) || 0;
  const displayQty = qty > 0 ? qty : 1;

  // 1. Venta Normal (Cajetilla Cerrada)
  const handleSelectBase = () => {
    onConfirm(qty || 1, null, false); 
    onClose();
  };

  // 2. Venta de Presentación (Paquete 10s / Caja Master)
  const handleSelectPresentation = (pres: ProductPresentation) => {
    onConfirm(qty || 1, pres, false);
    onClose();
  };

  // 3. Venta Suelta (Cigarro Individual)
  const handleSelectFractional = () => {
    onConfirm(qty || 1, null, true); // true = es fraccionado
    onClose();
  };

  const adjustQty = (delta: number) => {
    const newQty = Math.max(1, (parseInt(qtyStr) || 0) + delta);
    setQtyStr(newQty.toString());
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Selecciona Presentación</h3>
          <button onClick={onClose}><X className="text-slate-400 hover:text-red-500" /></button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
             <h2 className="text-lg font-bold text-indigo-900 uppercase">{product.name}</h2>
             <p className="text-sm text-slate-500">¿Qué desea llevar el cliente?</p>
          </div>

          {/* CONTADOR */}
          <div className="flex items-center justify-center gap-4 mb-6">
             <button onClick={() => adjustQty(-1)} className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 font-bold text-2xl hover:bg-slate-200">-</button>
             <div className="text-center w-32">
                <input 
                    ref={inputRef}
                    type="number" 
                    value={qtyStr} 
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setQtyStr(e.target.value)}
                    className="text-5xl font-bold text-slate-800 w-full text-center outline-none border-b-2 border-transparent focus:border-indigo-500 bg-transparent"
                />
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">CANTIDAD</div>
             </div>
             <button onClick={() => adjustQty(1)} className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 font-bold text-2xl hover:bg-slate-200">+</button>
          </div>

          <div className="grid gap-3 max-h-[350px] overflow-y-auto pr-1">
            
            {/* OPCIÓN: SUELTO / PIEZA INDIVIDUAL (NUEVO) */}
            {product.contentPerUnit && product.contentUnitPrice && (
                <button 
                    onClick={handleSelectFractional}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-purple-100 bg-purple-50 hover:border-purple-500 transition-all group text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-3 rounded-lg text-purple-600 shadow-sm">
                            <LayoutGrid size={24}/>
                        </div>
                        <div>
                            <p className="font-bold text-purple-900 uppercase">
                                {qty === 1 ? 'Pieza Suelta' : `${qty} Piezas Sueltas`}
                            </p>
                            <p className="text-xs text-purple-600">Se abrirá una unidad para esto</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-purple-700">${(product.contentUnitPrice * displayQty).toFixed(2)}</p>
                        <p className="text-[10px] text-purple-400">(${product.contentUnitPrice} c/u)</p>
                    </div>
                </button>
            )}

            {/* OPCIÓN: UNIDAD BASE (CAJETILLA) */}
             <button 
                onClick={handleSelectBase}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                        <ShoppingBag size={24}/>
                    </div>
                    <div>
                        {/* CAMBIO 1: Mostrar nombre del producto o "Unidad" si es múltiple */}
                        <p className="font-bold text-slate-700 uppercase">
                            {qty === 1 ? 'UNIDAD / CAJETILLA' : `${qty} UNIDADES`}
                        </p>
                        
                        {/* CAMBIO 2: Mostrar contenido explícito si existe */}
                        <p className="text-xs text-slate-500 font-medium">
                            {product.contentPerUnit && product.contentPerUnit > 1 
                                ? `Contiene: ${product.contentPerUnit} piezas c/u` 
                                : `SKU: ${product.sku || 'N/A'}`
                            }
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-indigo-600">${(product.price * displayQty).toFixed(2)}</p>
                    {qty > 1 && <p className="text-[10px] text-slate-400">(${product.price} c/u)</p>}
                </div>
            </button>

            {/* OPCIONES: PRESENTACIONES (CAJAS/PAQUETES) */}
            {product.presentations?.map((pres) => (
                <button 
                    key={pres.id}
                    onClick={() => handleSelectPresentation(pres)}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                            <Box size={24}/>
                        </div>
                        <div>
                            <p className="font-bold text-slate-700 uppercase">
                                {qty === 1 ? pres.name : `${qty} x ${pres.name}`}
                            </p>
                            <p className="text-xs text-slate-500">Contiene: {pres.quantity} unidades</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-blue-600">${(pres.price * qty).toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400">(${(pres.price / pres.quantity).toFixed(2)} / unidad)</p>
                    </div>
                </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};