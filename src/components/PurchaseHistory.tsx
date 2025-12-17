import React from 'react';
import { Calendar, Filter, Download, Search } from 'lucide-react';

export const PurchaseHistory: React.FC = () => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Historial de Compras</h3>
              <p className="text-sm text-slate-500">Registro histórico de todas las compras</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <Calendar size={16}/>
                Filtros
              </button>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                <Download size={16}/>
                Exportar
              </button>
            </div>
          </div>
          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
              placeholder="Buscar por proveedor, orden o referencia..."
            />
          </div>
        </div>
        
        <div className="p-8 text-center text-slate-400">
          <div className="text-lg mb-2">Historial de Compras</div>
          <p className="text-sm">Aquí se mostrará el historial completo de compras</p>
          <p className="text-xs mt-2">Esta funcionalidad se implementará en la siguiente fase</p>
        </div>
      </div>
    </div>
  );
};