import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, RotateCcw, AlertTriangle, 
  Calendar, CheckCircle, XCircle, Trash2 
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ViewState, Sale, SaleItem } from '../types';
import { AdminAuthModal } from '../components/AdminAuthModal'; 

interface PosReturnsProps {
  setView: (view: ViewState) => void;
}

export const PosReturns: React.FC<PosReturnsProps> = ({ setView }) => {
  const { sales, processReturn } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Sale | null>(null);

  // Estados para la autorización y lógica
  const [showAuth, setShowAuth] = useState(false);
  const [actionType, setActionType] = useState<'SINGLE' | 'TOTAL' | null>(null);
  const [pendingItemReturn, setPendingItemReturn] = useState<{ item: SaleItem, qty: number } | null>(null);

  // --- LÓGICA DE 8 DÍAS ---
  const isReturnable = (dateString: string) => {
    const saleDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - saleDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 8;
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => 
      (s.id.toLowerCase().includes(searchTerm.toLowerCase()) || (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase())))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, searchTerm]);

  // --- OPCIÓN 1: DEVOLUCIÓN PARCIAL (POR PRODUCTO) ---
  const initiateReturnItem = (item: SaleItem) => {
    if (!selectedTicket) return;
    
    const maxReturn = item.quantity - (item.returnedQuantity || 0);
    if (maxReturn <= 0) return alert("Este producto ya fue devuelto en su totalidad.");

    const qtyStr = prompt(`Cantidad a devolver (Máximo: ${maxReturn}):`, "1");
    if (!qtyStr) return;
    
    const qty = parseFloat(qtyStr);
    if (isNaN(qty) || qty <= 0 || qty > maxReturn) return alert("Cantidad inválida");

    // Configurar acción y pedir clave
    setActionType('SINGLE');
    setPendingItemReturn({ item, qty });
    setShowAuth(true);
  };

  // --- OPCIÓN 2: DEVOLUCIÓN TOTAL (TODO EL TICKET) ---
  const initiateTotalReturn = () => {
    if (!selectedTicket) return;
    
    // Verificar si hay algo que devolver
    const hasItemsToReturn = selectedTicket.items.some(i => (i.quantity - (i.returnedQuantity || 0)) > 0);
    
    if (!hasItemsToReturn) return alert("Este ticket ya fue devuelto completamente.");

    if (confirm("¿Estás seguro de realizar la DEVOLUCIÓN TOTAL de este ticket?\nSe regresarán todos los productos al inventario.")) {
        setActionType('TOTAL');
        setShowAuth(true);
    }
  };

  // --- EJECUCIÓN TRAS AUTORIZACIÓN ---
  const handleAuthSuccess = async () => {
    setShowAuth(false);
    
    if (!selectedTicket) return;

    if (actionType === 'SINGLE' && pendingItemReturn) {
        // 1. Devolución Parcial
        await processReturn(selectedTicket.id, pendingItemReturn.item.productId, pendingItemReturn.qty);
        alert(`✅ Devolución parcial exitosa.\nReembolso: $${(pendingItemReturn.qty * pendingItemReturn.item.price).toFixed(2)}`);
    } 
    else if (actionType === 'TOTAL') {
        // 2. Devolución Total (Iteramos sobre los items)
        let totalRefund = 0;
        
        // Procesamos secuencialmente para asegurar consistencia
        for (const item of selectedTicket.items) {
            const remainingQty = item.quantity - (item.returnedQuantity || 0);
            if (remainingQty > 0) {
                await processReturn(selectedTicket.id, item.productId, remainingQty);
                totalRefund += remainingQty * item.price;
            }
        }
        alert(`✅ Devolución TOTAL exitosa.\nReembolso Total: $${totalRefund.toFixed(2)}`);
    }

    // Limpieza
    setPendingItemReturn(null);
    setActionType(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shrink-0">
        <button onClick={() => setView('POS')} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <RotateCcw className="text-pink-600"/> Devoluciones en Caja
          </h1>
          <p className="text-xs text-slate-400">Solo tickets menores a 8 días de antigüedad</p>
        </div>
      </div>

      <div className="flex flex-1 p-6 gap-6 overflow-hidden">
        
        {/* IZQUIERDA: LISTA */}
        <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
           <div className="p-4 border-b border-slate-100">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
               <input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-pink-500" placeholder="Buscar folio o cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus />
             </div>
           </div>
           <div className="flex-1 overflow-y-auto">
             {filteredSales.map(sale => {
               const active = isReturnable(sale.date);
               return (
                 <button key={sale.id} onClick={() => setSelectedTicket(sale)} className={`w-full p-4 border-b border-slate-50 hover:bg-slate-50 text-left transition-all group ${selectedTicket?.id === sale.id ? 'bg-pink-50 border-l-4 border-l-pink-500' : 'border-l-4 border-l-transparent'} ${!active ? 'opacity-60 grayscale' : ''}`}>
                   <div className="flex justify-between items-start mb-1">
                     <span className="font-mono font-bold text-slate-700">#{sale.id.slice(0,8)}</span>
                     <span className="font-bold text-slate-800">${sale.total.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 flex items-center gap-1"><Calendar size={12}/> {new Date(sale.date).toLocaleDateString()}</span>
                      {!active && <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">ARCHIVADO (+8 DÍAS)</span>}
                      {active && <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={10}/> VIGENTE</span>}
                   </div>
                 </button>
               );
             })}
           </div>
        </div>

        {/* DERECHA: DETALLE */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
          {selectedTicket ? (
            <>
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                 <div>
                    <h2 className="text-xl font-bold text-slate-800">Detalle del Ticket</h2>
                    <p className="text-sm text-slate-500 font-mono">ID: {selectedTicket.id}</p>
                    <p className="text-sm text-slate-500 mt-1">Cliente: {selectedTicket.customerName || 'Mostrador'}</p>
                 </div>
                 <div className="flex flex-col items-end gap-2">
                    {!isReturnable(selectedTicket.date) ? (
                        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 font-bold"><XCircle size={20}/> PLAZO VENCIDO</div>
                    ) : (
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 font-bold"><CheckCircle size={20}/> DISPONIBLE</div>
                    )}
                    
                    {/* BOTÓN DEVOLUCIÓN TOTAL */}
                    {isReturnable(selectedTicket.date) && (
                        <button 
                            onClick={initiateTotalReturn}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition-transform active:scale-95"
                        >
                            <Trash2 size={16}/> DEVOLUCIÓN TOTAL
                        </button>
                    )}
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <table className="w-full text-left">
                    <thead className="text-xs font-bold text-slate-400 uppercase border-b border-slate-200">
                        <tr><th className="pb-3">Producto</th><th className="pb-3 text-center">Comprado</th><th className="pb-3 text-center">Devuelto</th><th className="pb-3 text-right">Precio</th><th className="pb-3 text-center">Acción</th></tr>
                    </thead>
                    <tbody className="text-sm">
                        {selectedTicket.items.map((item, idx) => {
                            const available = item.quantity - (item.returnedQuantity || 0);
                            return (
                                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="py-4 font-medium text-slate-700">{item.name}</td>
                                    <td className="py-4 text-center">{item.quantity}</td>
                                    <td className="py-4 text-center text-orange-500 font-bold">{item.returnedQuantity || 0}</td>
                                    <td className="py-4 text-right">${item.price.toFixed(2)}</td>
                                    <td className="py-4 text-center">
                                        <button 
                                            onClick={() => initiateReturnItem(item)}
                                            disabled={!isReturnable(selectedTicket.date) || available <= 0}
                                            className="bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 mx-auto"
                                        >
                                            <RotateCcw size={14}/> Parcial
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
              </div>
              <div className="p-4 bg-yellow-50 border-t border-yellow-100 flex items-center gap-3 text-yellow-800 text-sm">
                 <AlertTriangle size={20}/>
                 <p>Cualquier devolución requiere <strong>Clave de Supervisor</strong> y afecta el corte de caja del día.</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300"><RotateCcw size={64} className="mb-4 bg-slate-50 p-4 rounded-full"/><p>Selecciona un ticket para gestionar devolución</p></div>
          )}
        </div>
      </div>

      {/* Modal de Autorización */}
      <AdminAuthModal 
        isOpen={showAuth} 
        onClose={() => { setShowAuth(false); setPendingItemReturn(null); setActionType(null); }} 
        onSuccess={handleAuthSuccess} 
        actionName={actionType === 'TOTAL' ? "Devolución TOTAL del Ticket" : `Devolver ${pendingItemReturn?.qty} pzas`}
      />
    </div>
  );
};