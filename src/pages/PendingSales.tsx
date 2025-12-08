import React, { useEffect, useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { PendingSale, ViewState } from '../types';
import { Search, ShoppingCart, Trash2, Eye, RefreshCw, X, ArrowLeft, Loader2 } from 'lucide-react';

interface PendingSalesProps {
  setView: (view: ViewState) => void;
}

export const PendingSales: React.FC<PendingSalesProps> = ({ setView }) => {
  const { getPendingSales, deletePendingSale, setSaleToLoad } = useDatabase();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<PendingSale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadSales = async () => {
    setLoading(true);
    const data = await getPendingSales();
    setSales(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleLoadSale = async (sale: PendingSale) => {
    setSaleToLoad(sale); // Set in context
    await deletePendingSale(sale.id); // Remove from DB as we are moving it to active cart
    setView('POS'); // Redirect
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta venta pendiente permanentemente?')) {
      await deletePendingSale(id);
      loadSales();
    }
  };

  const filteredSales = sales.filter(s => 
    (s.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.note?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    s.id.includes(searchTerm)
  );

  return (
    <div className="p-8 h-full bg-slate-50 flex flex-col max-w-7xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('POS')} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold text-slate-800">Ventas Pendientes</h2>
             <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">{sales.length}</span>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={loadSales} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors">
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''}/>
            </button>
            <button onClick={() => setView('POS')} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} />
            </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex justify-between items-center gap-4">
        <div className="relative flex-1">
             <Search className="absolute left-3 top-3 text-slate-400" size={18} />
             <input 
                type="text" 
                placeholder="Buscar por cliente, notas o ID..." 
                className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
        </div>
        <div className="text-sm text-slate-500 font-medium flex items-center gap-2 cursor-pointer">
            <span className="hidden sm:inline">Filtrar:</span>
            <span className="text-slate-800">Todas</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 overflow-y-auto">
            {filteredSales.map((sale) => (
                <div key={sale.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col hover:shadow-md transition-shadow">
                    
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                <ShoppingCart size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">#{sale.id.slice(0, 10)}...</h3>
                                <p className="text-xs text-slate-400">{new Date(sale.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors" title="Ver detalle">
                                <Eye size={16} />
                            </button>
                            <button onClick={() => handleDelete(sale.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors" title="Eliminar">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                            <span className="font-medium">👤 {sale.customer_name || 'Sin nombre'}</span>
                        </div>
                        <div className="flex justify-between items-end mt-3">
                            <span className="text-2xl font-bold text-slate-800">${sale.total.toFixed(2)} US$</span>
                            <span className="text-sm text-slate-500">{sale.item_count} artículos</span>
                        </div>
                        {/* Simulation of Savings (not in DB yet, but in design) */}
                        <p className="text-xs text-green-600 font-medium mt-1">(Ahorro estimado: $0.00 US$)</p>
                    </div>

                    {sale.note && (
                        <div className="bg-slate-50 p-2 rounded-lg mb-4 text-xs text-slate-500 italic border border-slate-100">
                            "{sale.note}"
                        </div>
                    )}

                    <button 
                        onClick={() => handleLoadSale(sale)}
                        className="mt-auto w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:translate-y-0.5"
                    >
                        Cargar Venta
                    </button>

                </div>
            ))}
            
            {filteredSales.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 flex flex-col items-center">
                    <ShoppingCart size={48} className="mb-4 opacity-20" />
                    <p>No hay ventas pendientes que coincidan.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};