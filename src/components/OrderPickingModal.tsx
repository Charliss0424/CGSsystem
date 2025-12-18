import React, { useState } from 'react';
import { X, CheckCircle, Box, AlertTriangle } from 'lucide-react';

interface PickingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onFinish: () => void;
}

export const OrderPickingModal: React.FC<PickingModalProps> = ({ isOpen, onClose, order, onFinish }) => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  if (!isOpen || !order) return null;

  // Manejo seguro de items (si viene null o vacío)
  const items = Array.isArray(order.items) ? order.items : [];
  
  // Cálculo de progreso
  const progress = items.length > 0 
    ? Math.round((checkedItems.length / items.length) * 100) 
    : 0;
    
  const isComplete = items.length > 0 && checkedItems.length === items.length;

  const toggleItem = (itemId: string) => {
    if (checkedItems.includes(itemId)) {
      setCheckedItems(prev => prev.filter(id => id !== itemId));
    } else {
      setCheckedItems(prev => [...prev, itemId]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
        
        {/* Header Surtido */}
        <div className="p-5 bg-blue-600 text-white flex justify-between items-start">
          <div>
             <h2 className="text-xl font-bold flex items-center gap-2">
                <Box size={24} /> Surtir Pedido #{order.orderFolio || order.order_folio || '---'}
             </h2>
             <p className="text-blue-100 text-sm mt-1">{order.customerName || order.customer_name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30"><X size={20}/></button>
        </div>

        {/* Barra de Progreso */}
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
           <div className="flex justify-between text-sm font-bold text-blue-800 mb-2">
              <span>Progreso del Surtido</span>
              <span>{checkedItems.length} / {items.length} items</span>
           </div>
           <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
           </div>
        </div>

        {/* Lista de Items (Checklist Grande para Táctil) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
           {items.length === 0 ? (
             <div className="text-center py-10 text-slate-400">
               No hay productos en este pedido.
             </div>
           ) : (
             items.map((item: any, idx: number) => {
               // Usamos un identificador único (id del producto o su nombre + índice si no hay ID)
               const uniqueId = item.id || `${item.name}-${idx}`;
               const isChecked = checkedItems.includes(uniqueId);
               
               return (
                 <div 
                   key={uniqueId}
                   onClick={() => toggleItem(uniqueId)}
                   className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 select-none ${isChecked ? 'bg-green-50 border-green-500' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                 >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-transparent'}`}>
                       <CheckCircle size={20} fill="currentColor" className="text-white"/>
                    </div>
                    <div className="flex-1">
                       <p className={`font-bold text-lg ${isChecked ? 'text-green-800' : 'text-slate-800'}`}>
                          {item.name}
                       </p>
                       <p className="text-slate-500 text-sm">
                          SKU: {item.sku || '---'}
                       </p>
                    </div>
                    <div className="text-right">
                       <span className="block text-2xl font-bold text-slate-800">{item.quantity}</span>
                       <span className="text-xs text-slate-400 uppercase">Pzas</span>
                    </div>
                 </div>
               );
             })
           )}
        </div>

        {/* Footer Acción */}
        <div className="p-5 border-t border-slate-200 bg-white">
           <button 
             onClick={onFinish}
             disabled={!isComplete}
             className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${isComplete ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
           >
             {isComplete ? (
                <> <CheckCircle size={24} /> Finalizar Surtido </>
             ) : (
                <> <AlertTriangle size={24} /> Faltan Productos </>
             )}
           </button>
        </div>

      </div>
    </div>
  );
};