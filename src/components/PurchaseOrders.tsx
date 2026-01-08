import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { PurchaseOrderModal } from './PurchaseOrderModal';
import { Plus, Search, Filter, FileText, Calendar, ArrowRight } from 'lucide-react';

interface PurchaseOrdersProps {
  setView: (view: any) => void;
}

const PurchaseOrders: React.FC<PurchaseOrdersProps> = ({ setView }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    // Traemos orden + datos del proveedor (Join)
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, suppliers(name)')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'draft': return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase border border-slate-200">Borrador</span>;
      case 'sent': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase border border-blue-200">Enviada</span>;
      case 'completed': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold uppercase border border-emerald-200">Recibida</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold uppercase border border-red-200">Cancelada</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs">{status}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in">
      
      {/* HEADER DE MÓDULO */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Órdenes de Compra</h1>
          <p className="text-slate-500 text-sm">Gestión de abastecimiento y pedidos a proveedores.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} /> Nueva Orden
        </button>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar por Folio o Proveedor..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
         </div>
         <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2 font-medium">
            <Filter size={18} /> Filtros
         </button>
      </div>

      {/* LISTADO DE ÓRDENES */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Folio</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Proveedor</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Fecha Doc.</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Entrega</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Total</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Estatus</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr><td colSpan={7} className="p-8 text-center text-slate-400">Cargando órdenes...</td></tr>
            ) : orders.length === 0 ? (
               <tr><td colSpan={7} className="p-8 text-center text-slate-400">No hay órdenes registradas.</td></tr>
            ) : (
               orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg">
                          <FileText size={16} />
                       </div>
                       <span className="font-mono text-sm font-bold text-slate-700">
                          #{order.id.slice(0, 8).toUpperCase()}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                     {order.suppliers?.name || 'Proveedor Eliminado'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                     {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                     <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {order.expected_delivery_date || 'Sin fecha'}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-700">
                     ${order.total_amount?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                     {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                     <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                        <ArrowRight size={20} />
                     </button>
                  </td>
                </tr>
               ))
            )}
          </tbody>
        </table>
      </div>

      <PurchaseOrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchOrders}
      />
    </div>
  );
};

export default PurchaseOrders;