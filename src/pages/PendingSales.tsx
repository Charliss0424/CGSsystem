import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Trash2, ArrowRight, Beer, User, Package, ArrowLeft } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ViewState, PendingSale } from '../types';
import { ConsignmentModal } from '../components/ConsignmentModal';
import { AdminAuthModal } from '../components/AdminAuthModal'; 

interface PendingSalesProps {
  setView: (view: ViewState) => void;
}

export const PendingSales: React.FC<PendingSalesProps> = ({ setView }) => {
  const { getPendingSales, deletePendingSale, setSaleToLoad, currentUser, logCancellation } = useDatabase();
  const [sales, setSales] = useState<PendingSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [consignmentSale, setConsignmentSale] = useState<PendingSale | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<PendingSale | null>(null);

  useEffect(() => { loadSales(); }, []);

  const loadSales = async () => {
    setIsLoading(true);
    const data = await getPendingSales();
    if (data) setSales(data);
    setIsLoading(false);
  };

  const handleResume = (sale: PendingSale) => {
    if(confirm('¿Recuperar esta venta en la caja?')) {
        setSaleToLoad(sale);
        deletePendingSale(sale.id);
        setView('POS');
    }
  };

  const requestDelete = (sale: PendingSale) => { setSaleToDelete(sale); setShowAuth(true); };

  const handleAuthSuccess = async () => {
    setShowAuth(false);
    if (!saleToDelete) return;
    let reason = "Cancelación autorizada por supervisor";
    if (saleToDelete.type === 'CONSIGNMENT') {
        const inputReason = prompt("⚠️ ATENCIÓN: Estás eliminando un Evento/Consumo.\n\nEscribe el motivo de la cancelación:");
        if (!inputReason || inputReason.trim().length < 5) return alert("⛔ Cancelación abortada.");
        reason = inputReason;
    }
    if (logCancellation) await logCancellation(saleToDelete, reason, "Supervisor");
    await deletePendingSale(saleToDelete.id);
    loadSales();
    setSaleToDelete(null);
  };

  const handleSettleConsignment = (finalCart: any[]) => {
    setSaleToLoad({ ...consignmentSale!, items: finalCart });
    deletePendingSale(consignmentSale!.id);
    setConsignmentSale(null);
    setView('POS');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
            <button onClick={() => setView('POS')} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"><ArrowLeft size={24}/></button>
            <div><h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Clock className="text-orange-500"/> Ventas Pendientes</h1><p className="text-xs text-slate-500">Administra ventas pausadas y eventos.</p></div>
        </div>
        <button onClick={loadSales} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">Actualizar Lista</button>
      </div>
      
      {isLoading ? (<div className="text-center py-20 text-slate-400">Cargando...</div>) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="font-bold text-lg text-slate-700 mb-4 border-b pb-2 flex items-center gap-2"><Package className="text-slate-400"/> Ventas Pausadas</h2>
                <div className="space-y-4">
                    {sales.filter(s => s.type !== 'CONSIGNMENT').map(sale => (
                        <div key={sale.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-md transition-shadow flex justify-between items-center group">
                            <div><p className="font-bold text-slate-800">{sale.customer_name || 'Cliente General'}</p><p className="text-xs text-slate-500">{new Date(sale.created_at).toLocaleString()}</p><p className="text-sm font-bold text-indigo-600 mt-1">{sale.item_count} prods - ${sale.total.toFixed(2)}</p></div>
                            <div className="flex gap-2"><button onClick={() => requestDelete(sale)} className="p-2 text-red-300 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={20}/></button><button onClick={() => handleResume(sale)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 shadow-sm">Retomar <ArrowRight size={16}/></button></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="font-bold text-lg text-indigo-800 mb-4 border-b pb-2 flex items-center gap-2"><Beer className="text-indigo-500"/> Eventos a Consumo</h2>
                <div className="space-y-4">
                    {sales.filter(s => s.type === 'CONSIGNMENT').map(sale => (
                        <div key={sale.id} className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 hover:shadow-md transition-shadow flex justify-between items-center">
                            <div><div className="flex items-center gap-2 mb-1"><User size={16} className="text-indigo-500"/><p className="font-bold text-indigo-900">{sale.customer_name}</p></div><p className="text-xs text-indigo-400 mb-2">{new Date(sale.created_at).toLocaleDateString()}</p><div className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 inline-block border border-indigo-100">Mercancía: ${sale.total.toFixed(2)}</div></div>
                            <div className="flex flex-col gap-2 items-end"><button onClick={() => setConsignmentSale(sale)} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-green-700 shadow-sm w-full justify-center"><CheckCircle size={16}/> Liquidar</button><button onClick={() => requestDelete(sale)} className="text-xs text-red-400 hover:text-red-600 hover:underline flex items-center gap-1"><Trash2 size={12}/> Cancelar</button></div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
      )}

      {consignmentSale && (
        <ConsignmentModal 
            isOpen={!!consignmentSale}
            onClose={() => setConsignmentSale(null)}
            originalItems={consignmentSale.items}
            customerName={consignmentSale.customer_name || ''}
            creatorName={(consignmentSale as any).created_by || 'Sistema'}
            liquidatorName={currentUser?.fullName || 'Cajero Actual'}
            onSettle={handleSettleConsignment}
        />
      )}

      <AdminAuthModal isOpen={showAuth} onClose={() => { setShowAuth(false); setSaleToDelete(null); }} onSuccess={handleAuthSuccess} actionName="Eliminar Venta Pendiente" />
    </div>
  );
};