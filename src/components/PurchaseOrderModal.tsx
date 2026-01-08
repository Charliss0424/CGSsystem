import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Search, Trash2, Calendar, Building2, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Product, Supplier } from '../types';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

// Estructura temporal para las líneas de la orden
interface POItem {
  product_id: string;
  sku: string;
  name: string;
  quantity: number;
  unit_cost: number;
  total: number;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  
  // --- CABECERA DEL DOCUMENTO (SAP Header) ---
  const [supplierId, setSupplierId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [docDate] = useState(new Date().toISOString().split('T')[0]); // Fecha Documento (Hoy)

  // --- POSICIONES (SAP Items) ---
  const [items, setItems] = useState<POItem[]>([]);
  
  // Catálogos
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');

  // Cargar catálogos al abrir
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const { data: supData } = await supabase.from('suppliers').select('*').eq('status', 'active');
        const { data: prodData } = await supabase.from('products').select('*');
        if (supData) setSuppliers(supData);
        if (prodData) setProducts(prodData);
      };
      fetchData();
    }
  }, [isOpen]);

  // --- LÓGICA DE NEGOCIO ---

  const addItem = (product: Product) => {
    const existingIndex = items.findIndex(i => i.product_id === product.id);
    
    if (existingIndex >= 0) {
      // Si ya existe, sumamos 1
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      newItems[existingIndex].total = newItems[existingIndex].quantity * newItems[existingIndex].unit_cost;
      setItems(newItems);
    } else {
      // Si no existe, agregamos nueva posición
      // Nota: SAP toma el último precio de compra (costPrice)
      const cost = product.costPrice || 0;
      setItems([...items, {
        product_id: product.id,
        sku: product.sku || 'S/N',
        name: product.name,
        quantity: 1,
        unit_cost: cost,
        total: cost
      }]);
    }
    setProductSearch(''); // Limpiar buscador
  };

  const updateItem = (index: number, field: 'quantity' | 'unit_cost', value: number) => {
    const newItems = [...items];
    newItems[index][field] = value;
    // Recalcular total de línea
    newItems[index].total = newItems[index].quantity * newItems[index].unit_cost;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateGrandTotal = () => items.reduce((acc, item) => acc + item.total, 0);

  const handleSave = async () => {
    if (!supplierId || items.length === 0) {
      alert("Faltan datos obligatorios (Proveedor o Productos)");
      return;
    }

    setLoading(true);
    try {
      // 1. Crear Cabecera (Purchase Order)
      const { data: orderData, error: orderError } = await supabase
        .from('purchase_orders')
        .insert([{
          supplier_id: supplierId,
          expected_delivery_date: deliveryDate || null,
          status: 'sent', // En SAP sería 'Created' o 'Released'
          notes: notes,
          total_amount: calculateGrandTotal()
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Crear Posiciones (Items)
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      onSave();
      onClose();
      // Reset
      setItems([]); setSupplierId(''); setNotes('');
    } catch (error) {
      console.error(error);
      alert("Error al crear la orden de compra");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filtrado de productos para el buscador
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 5); // Solo mostrar 5 sugerencias

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-slate-50 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        {/* --- HEADER VISUAL (Tipo SAP GUI moderno) --- */}
        <div className="bg-white border-b border-slate-200 p-5 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Crear Orden de Compra</h2>
              <p className="text-xs text-slate-500 flex gap-2">
                <span>Doc. Fecha: {docDate}</span>
                <span className="text-slate-300">|</span>
                <span>Clase: Pedido Estándar (NB)</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* --- PANEL IZQUIERDO: DATOS DE CABECERA --- */}
          <div className="w-full lg:w-80 bg-white border-r border-slate-200 p-5 flex flex-col gap-5 overflow-y-auto z-10">
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1">
                <Building2 size={12} /> Proveedor
              </label>
              <select 
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
              >
                <option value="">Seleccionar Proveedor...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1">
                <Calendar size={12} /> Entrega Esperada
              </label>
              <input 
                type="date" 
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Notas / Textos</label>
              <textarea 
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-32"
                placeholder="Instrucciones de entrega, número de cotización..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div className="mt-auto bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Total del Documento</p>
              <p className="text-2xl font-bold text-emerald-800">${calculateGrandTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>

          </div>

          {/* --- PANEL DERECHO: POSICIONES (ITEMS) --- */}
          <div className="flex-1 flex flex-col bg-slate-50/50">
            
            {/* Buscador de Productos (Barra de herramientas) */}
            <div className="p-4 bg-white border-b border-slate-200 relative">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Buscar producto para agregar (SKU o Nombre)..." 
                   className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                   value={productSearch}
                   onChange={e => setProductSearch(e.target.value)}
                 />
               </div>
               
               {/* Sugerencias de búsqueda */}
               {productSearch.length > 1 && (
                 <div className="absolute top-full left-4 right-4 bg-white border border-slate-200 rounded-xl shadow-xl mt-1 overflow-hidden z-20">
                    {filteredProducts.length === 0 ? (
                      <div className="p-3 text-slate-400 text-sm text-center">No se encontraron productos</div>
                    ) : (
                      filteredProducts.map(p => (
                        <button 
                          key={p.id} 
                          onClick={() => addItem(p)}
                          className="w-full text-left p-3 hover:bg-emerald-50 flex justify-between items-center border-b border-slate-50 last:border-0"
                        >
                          <div>
                            <p className="font-bold text-slate-700 text-sm">{p.name}</p>
                            <p className="text-xs text-slate-400">SKU: {p.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-emerald-600">${p.costPrice?.toFixed(2)}</p>
                            <p className="text-[10px] text-slate-400">Costo Actual</p>
                          </div>
                        </button>
                      ))
                    )}
                 </div>
               )}
            </div>

            {/* Tabla de Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                    <th className="px-4 py-3 text-left w-16">Pos.</th>
                    <th className="px-4 py-3 text-left">Material / Descripción</th>
                    <th className="px-4 py-3 text-center w-24">Cant.</th>
                    <th className="px-4 py-3 text-right w-32">Precio Neto</th>
                    <th className="px-4 py-3 text-right w-32">Total</th>
                    <th className="px-4 py-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                           <AlertCircle size={32} className="opacity-20" />
                           <p>No hay posiciones en este documento.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={`${item.product_id}-${idx}`} className="group hover:bg-white border-b border-slate-100 last:border-0 transition-colors">
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{(idx + 1) * 10}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-700">{item.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{item.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input 
                            type="number" min="1"
                            className="w-16 p-1 text-center border border-slate-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-bold"
                            value={item.quantity}
                            onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                           <input 
                            type="number" min="0" step="0.01"
                            className="w-24 p-1 text-right border border-slate-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                            value={item.unit_cost}
                            onChange={e => updateItem(idx, 'unit_cost', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-700">
                          ${item.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer de Acciones */}
            <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3">
              <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                {loading ? <Plus className="animate-spin" /> : <Save size={18} />}
                Crear Orden
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};