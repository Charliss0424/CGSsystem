import React, { useEffect, useState } from 'react';
import { Eye, Truck, Clock, CheckCircle, XCircle, Loader, ArrowLeft } from 'lucide-react'; // Agregamos ArrowLeft
import { supabase } from '../services/supabase';
import { ViewState } from '../types'; // Importamos tipos

// ... (Tus interfaces PurchaseOrder se quedan igual) ...

interface PurchaseOrdersProps {
  setView?: (view: ViewState) => void; // Agregamos esta prop
  onSelectOrder?: (order: any) => void;
  onViewDetail?: () => void;
}

const PurchaseOrders: React.FC<PurchaseOrdersProps> = ({ 
  setView, // Recibimos setView
  onSelectOrder, 
  onViewDetail 
}) => {
  // ... (Toda tu lógica de useState y useEffect se queda igual) ...
  const [orders, setOrders] = useState<any[]>([]); // (Simplificado para el ejemplo)
  const [loading, setLoading] = useState(false); // (Simplificado)

  // ... (Tu useEffect de carga de datos se queda igual) ...

  return (
    <div className="p-6 h-full flex flex-col">
      
      {/* --- NUEVO ENCABEZADO --- */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        {setView && (
          <button 
            onClick={() => setView('DASHBOARD')} 
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
          >
            <ArrowLeft size={28} />
          </button>
        )}
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Órdenes de Compra</h1>
           <p className="text-sm text-slate-500">Monitoreo de pedidos a proveedores</p>
        </div>
      </div>

      {/* Contenedor con borde (Lo que ya tenías) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        {/* ... (El resto de tu renderizado de la tabla se queda igual) ... */}
         <div className="p-4 border-b border-slate-100 bg-slate-50">
            <p className="text-sm text-slate-500">Listado actualizado</p>
         </div>
         {/* ... tabla ... */}
      </div>
    </div>
  );
};

export default PurchaseOrders;