import React, { useState, useMemo } from 'react';
import { X, Search, Package, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product; // El producto "Padre"
  onSelectVariant: (variant: any) => void;
}

export const VariantSelectorModal: React.FC<Props> = ({ 
  isOpen, onClose, product, onSelectVariant 
}) => {
  const [search, setSearch] = useState('');

  // Filtramos las variantes (Sabores/Aromas)
  const variants = useMemo(() => {
    if (!product.presentations) return [];
    return product.presentations.filter(v => 
      v.name.toLowerCase().includes(search.toLowerCase()) || 
      v.barcode?.includes(search)
    );
  }, [product, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in zoom-in-95">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* HEADER */}
        <div className="bg-indigo-600 p-4 flex justify-between items-start text-white shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package size={24} className="opacity-80"/>
              {product.name}
            </h2>
            <p className="text-indigo-100 text-sm">Selecciona una presentación o sabor</p>
          </div>
          <button onClick={onClose} className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BUSCADOR INTERNO */}
        <div className="p-3 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              autoFocus
              type="text"
              placeholder="Buscar sabor, color, aroma..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* LISTA DE VARIANTES */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
          {variants.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              <AlertCircle size={48} className="mx-auto mb-2 opacity-50"/>
              <p>No se encontraron variantes</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {variants.map((variant, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectVariant(variant)}
                  className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all text-left flex flex-col justify-between group h-24"
                >
                  <div>
                    <span className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight group-hover:text-indigo-700">
                      {variant.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Cod: {variant.barcode || 'S/N'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${variant.stock > 0 ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-600'}`}>
                      Stock: {variant.stock ?? '-'}
                    </span>
                    <span className="font-bold text-indigo-600 text-base">
                      ${variant.price.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};