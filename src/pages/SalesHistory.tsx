import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, DollarSign, CreditCard, RotateCcw, 
  FileText, Info, CheckCircle, Package, ArrowLeft, Check
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Sale, SaleItem } from '../types';
import { AdminAuthModal } from '../components/AdminAuthModal';

export const SalesHistory = () => {
  const { sales, processReturn } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  // Estados para Devolución
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  
  // Diccionario para controlar cuántas piezas se devuelven de cada ID
  // { 'producto_id': cantidad_a_devolver }
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});

  // Filtrado
  const filteredSales = sales.filter(sale => 
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);

  // --- LÓGICA DE DEVOLUCIÓN ---

  const handleStartReturn = () => {
    setAuthOpen(true); // 1. Pedir permiso
  };

  const onAuthSuccess = () => {
    setIsReturnMode(true); // 2. Activar modo edición
    setReturnQuantities({}); // Limpiar selecciones previas
  };

  // Manejar cambio en inputs de cantidad
  const handleQuantityChange = (productId: string, val: string, max: number) => {
    const qty = parseInt(val) || 0;
    if (qty >= 0 && qty <= max) {
        setReturnQuantities(prev => ({ ...prev, [productId]: qty }));
    }
  };

  // Seleccionar TODO (Devolución total del remanente)
  const handleSelectAll = () => {
    if (!selectedSale) return;
    const newQtys: Record<string, number> = {};
    selectedSale.items.forEach(item => {
        const available = item.quantity - (item.returnedQuantity || 0);
        if (available > 0) newQtys[item.productId] = available;
    });
    setReturnQuantities(newQtys);
  };

  // Confirmar y procesar
  const handleConfirmReturn = async () => {
    if (!selectedSale) return;

    // Convertir el estado returnQuantities al formato que pide el Context
    const itemsToProcess = selectedSale.items
        .map(item => ({
            productId: item.productId,
            quantity: returnQuantities[item.productId] || 0,
            price: item.price
        }))
        .filter(i => i.quantity > 0);

    if (itemsToProcess.length === 0) {
        return alert("Seleccione al menos un producto para devolver.");
    }

    if (confirm(`¿Confirmar devolución de ${itemsToProcess.length} productos?\nSe registrará una salida de efectivo.`)) {
        const success = await processReturn(selectedSale.id, itemsToProcess);
        if (success) {
            alert("Devolución procesada correctamente.");
            setIsReturnMode(false);
            setReturnQuantities({});
        }
    }
  };

  // Calcular total a reembolsar en tiempo real
  const totalRefundAmount = selectedSale?.items.reduce((sum, item) => {
      const qty = returnQuantities[item.productId] || 0;
      return sum + (qty * item.price);
  }, 0) || 0;

  return (
    <div className="flex h-full bg-slate-100 p-4 gap-4">
      
      {/* Modal de Supervisor */}
      <AdminAuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
        onSuccess={onAuthSuccess} 
        actionTitle="Autorizar Devolución"
      />

      {/* PANEL IZQUIERDO: LISTA */}
      <div className="flex-1 flex flex-col gap-4 min-w-[350px] max-w-md">
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-500">
            <p className="text-slate-500 text-xs font-medium uppercase">Ventas en Pantalla</p>
            <p className="text-2xl font-bold text-slate-800">${totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar ticket o cliente..." 
            className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            {filteredSales.map(sale => (
              <button
                key={sale.id}
                onClick={() => { setSelectedSale(sale); setIsReturnMode(false); setReturnQuantities({}); }}
                className={`w-full text-left p-4 border-b border-slate-50 hover:bg-indigo-50 transition-colors group ${selectedSale?.id === sale.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-700">#{sale.id.slice(0, 8)}</span>
                  <span className="font-bold text-emerald-600">${sale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <div className="flex items-center gap-1"><Calendar size={12} />{new Date(sale.date).toLocaleString()}</div>
                  <div className="uppercase bg-slate-100 px-2 py-0.5 rounded">{sale.paymentMethod}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PANEL DERECHO: DETALLE */}
      <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden relative">
        {selectedSale ? (
          <>
            {/* HEADER DE ACCIONES */}
            <div className={`p-6 border-b border-slate-100 ${isReturnMode ? 'bg-red-50' : 'bg-slate-50'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${isReturnMode ? 'text-red-700' : 'text-slate-800'}`}>
                    {isReturnMode ? <RotateCcw /> : <FileText className="text-indigo-500" />}
                    {isReturnMode ? 'Modo Devolución' : 'Detalle de Venta'}
                  </h2>
                  <p className="text-sm text-slate-500">ID: {selectedSale.id}</p>
                </div>
                
                {!isReturnMode ? (
                    <button 
                        onClick={handleStartReturn}
                        className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center gap-2"
                    >
                        <RotateCcw size={16}/> Iniciar Devolución
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setIsReturnMode(false)} className="text-slate-500 hover:text-slate-800 px-3 font-medium">Cancelar</button>
                        <button onClick={handleSelectAll} className="text-indigo-600 hover:text-indigo-800 px-3 font-medium text-sm">Devolver Todo</button>
                    </div>
                )}
              </div>
              
              {isReturnMode && (
                  <div className="mt-4 bg-red-100 text-red-800 p-3 rounded-lg text-sm flex justify-between items-center">
                      <div className="flex gap-2 items-center"><Info size={16}/> Seleccione cantidades a devolver.</div>
                      <div className="font-bold text-lg">Reembolso: ${totalRefundAmount.toFixed(2)}</div>
                  </div>
              )}
            </div>

            {/* TABLA DE PRODUCTOS */}
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase border-b border-slate-100">
                  <tr>
                    <th className="py-2">Producto</th>
                    <th className="py-2 text-center">Comprado</th>
                    <th className="py-2 text-right">Precio</th>
                    {isReturnMode && <th className="py-2 text-center text-red-600 font-bold">Devolver</th>}
                    <th className="py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {selectedSale.items.map((item, idx) => {
                    const alreadyReturned = item.returnedQuantity || 0;
                    const maxReturn = item.quantity - alreadyReturned;
                    const isFullyReturned = maxReturn === 0;

                    return (
                        <tr key={idx} className={`transition-colors ${isFullyReturned ? 'opacity-50 bg-slate-50' : 'hover:bg-slate-50'}`}>
                        <td className="py-3 font-medium text-slate-700">
                            {item.name}
                            {alreadyReturned > 0 && (
                            <div className="text-[10px] text-red-500 font-bold">
                                Ya devuelto: {alreadyReturned}
                            </div>
                            )}
                        </td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">${item.price.toFixed(2)}</td>
                        
                        {/* COLUMNA DE INPUT DEVOLUCIÓN */}
                        {isReturnMode && (
                            <td className="py-3 text-center">
                                {isFullyReturned ? (
                                    <span className="text-xs text-slate-400">Completo</span>
                                ) : (
                                    <input 
                                        type="number"
                                        min="0"
                                        max={maxReturn}
                                        value={returnQuantities[item.productId] || ''}
                                        onChange={(e) => handleQuantityChange(item.productId, e.target.value, maxReturn)}
                                        className="w-16 p-1 text-center border border-red-200 rounded-lg text-red-700 font-bold outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="0"
                                    />
                                )}
                            </td>
                        )}

                        <td className="py-3 text-right font-bold text-slate-700">
                            ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* FOOTER ACCIONES */}
            <div className="p-6 bg-slate-50 border-t border-slate-200">
                {!isReturnMode ? (
                    <div className="flex justify-between text-2xl font-bold text-slate-800">
                        <span>Total Ticket</span><span>${selectedSale.total.toFixed(2)}</span>
                    </div>
                ) : (
                    <button 
                        onClick={handleConfirmReturn}
                        disabled={totalRefundAmount <= 0}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        <Check size={20} />
                        Confirmar Devolución (${totalRefundAmount.toFixed(2)})
                    </button>
                )}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
            <Package size={64} className="mb-4 text-slate-200" />
            <p className="text-lg">Selecciona una venta para ver detalles</p>
          </div>
        )}
      </div>
    </div>
  );
};