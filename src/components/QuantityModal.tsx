import React, { useEffect, useState } from 'react';
import { X, Package, Layers, Grid, Box, Minus, Plus } from 'lucide-react';
import { Product } from '../types';

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  // Esta función debe coincidir con la firma en PosTerminal
  onAddToCart: (
    product: Product, 
    qty: number, 
    presentation: any | null, 
    isLegacyPack: boolean, 
    isFractional: boolean
  ) => void;
}

export const QuantityModal: React.FC<QuantityModalProps> = ({ 
  isOpen, 
  onClose, 
  product, 
  onAddToCart 
}) => {
  const [quantity, setQuantity] = useState(1);

  // Reiniciar cantidad al abrir el modal
  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // --- LÓGICA DE SELECCIÓN ---
  const handleSelectOption = (type: 'UNIT' | 'LOOSE' | 'PACK' | 'PRESENTATION', presentationData?: any) => {
    
    switch (type) {
      case 'LOOSE':
        // Pieza suelta (isFractional = true)
        onAddToCart(product, quantity, null, false, true);
        break;
        
      case 'UNIT':
        // Unidad normal (Todo false)
        onAddToCart(product, quantity, null, false, false);
        break;
        
      case 'PACK':
        // Caja Legacy (isLegacyPack = true)
        onAddToCart(product, quantity, null, true, false);
        break;
        
      case 'PRESENTATION':
        // Presentación específica (Se pasa el objeto presentation)
        onAddToCart(product, quantity, presentationData, false, false);
        break;
    }
    
    onClose(); // Cerrar modal después de agregar
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <h2 className="font-bold text-lg text-slate-800">Selecciona Presentación</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* BODY CON SCROLL */}
        <div className="p-6 overflow-y-auto">
          
          {/* Nombre e Instrucción */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-black text-indigo-900 uppercase leading-tight">{product.name}</h3>
            <p className="text-slate-500 text-sm mt-1">¿Qué desea llevar el cliente?</p>
          </div>

          {/* SELECTOR DE CANTIDAD (GRANDE) */}
          <div className="flex items-center justify-center gap-6 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-all active:scale-90"
            >
              <Minus size={24} />
            </button>
            <div className="text-center w-20">
              <span className="block text-4xl font-bold text-slate-800">{quantity}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CANTIDAD</span>
            </div>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-all active:scale-90"
            >
              <Plus size={24} />
            </button>
          </div>

          {/* LISTA DE OPCIONES (GRID) */}
          <div className="space-y-3">

            {/* 1. OPCIÓN: VENTA SUELTA (Si aplica) */}
            {product.contentPerUnit > 1 && (
              <button 
                onClick={() => handleSelectOption('LOOSE')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-purple-100 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 transition-all group text-left relative overflow-hidden"
              >
                <div className="bg-white p-3 rounded-lg text-purple-600 shadow-sm shrink-0">
                  <Grid size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-purple-900">PIEZA SUELTA</h4>
                  <p className="text-xs text-purple-700">Se abrirá una unidad para esto</p>
                </div>
                <div className="text-right">
                  <span className="block text-lg font-bold text-purple-700">${(product.contentUnitPrice || 0).toFixed(2)}</span>
                  <span className="text-[10px] text-purple-500">(${product.contentUnitPrice} c/u)</span>
                </div>
              </button>
            )}

            {/* 2. OPCIÓN: UNIDAD ESTÁNDAR (Siempre visible) */}
            <button 
              onClick={() => handleSelectOption('UNIT')}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-indigo-100 bg-white hover:border-indigo-500 hover:shadow-md transition-all group text-left"
            >
              <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm shrink-0">
                <Box size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">UNIDAD / CAJETILLA / BOLSA</h4>
                <p className="text-xs text-slate-500">
                  {product.contentPerUnit > 1 ? `Contiene: ${product.contentPerUnit} piezas c/u` : 'Venta por unidad estándar'}
                </p>
              </div>
              <div className="text-right">
                <span className="block text-lg font-bold text-indigo-600">${product.price.toFixed(2)}</span>
              </div>
            </button>

            {/* 3. OPCIÓN: CAJA LEGACY (Si tiene packPrice) */}
            {product.packPrice > 0 && (
              <button 
                onClick={() => handleSelectOption('PACK')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all group text-left"
              >
                <div className="bg-white p-3 rounded-lg text-blue-600 shadow-sm shrink-0">
                  <Package size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900">CAJA / PAQUETE / BULTO</h4>
                  <p className="text-xs text-blue-700">
                    Contiene: {product.packQuantity || 1} unidades
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-lg font-bold text-blue-700">${product.packPrice.toFixed(2)}</span>
                  <span className="text-[10px] text-blue-500">(${(product.packPrice / (product.packQuantity || 1)).toFixed(2)} unidad)</span>
                </div>
              </button>
            )}

            {/* 4. OPCIÓN: MULTIPLES PRESENTACIONES (Array presentations) */}
            {product.presentations?.map((pres: any, idx: number) => (
              <button 
                key={idx}
                onClick={() => handleSelectOption('PRESENTATION', pres)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 bg-white hover:border-orange-400 hover:shadow-md transition-all group text-left"
              >
                <div className="bg-orange-50 p-3 rounded-lg text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-sm shrink-0">
                  <Layers size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 uppercase">{pres.name}</h4>
                  <p className="text-xs text-slate-500">Contiene: {pres.quantity} unidades</p>
                </div>
                <div className="text-right">
                  <span className="block text-lg font-bold text-orange-600">${(pres.price || 0).toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400">(${(pres.price / pres.quantity).toFixed(2)} unidad)</span>
                </div>
              </button>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
};