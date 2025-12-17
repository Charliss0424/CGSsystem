import React, { useState } from 'react';
import { 
  ShoppingCart, User, Plus, Search, Trash2, CheckCircle, 
  Package, ArrowLeft, FileText, Truck, Calendar, List, 
  Users, ClipboardList, AlertCircle, DollarSign,
  Truck as TruckIcon, Shield, Percent
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ViewState, Product, PurchaseOrder } from '../types';

// --- IMPORTAMOS COMPONENTES EXISTENTES ---
import PurchaseOrderList from '../components/PurchaseOrders'; // Asegúrate que la ruta sea correcta

// --- COMPONENTES PLACEHOLDER (Para que no falle la compilación mientras los creamos) ---
const PurchaseHistory = () => <div className="p-10 text-center text-slate-500">Módulo Historial en construcción...</div>;
const PurchaseCalendar = ({ onDateSelect }: any) => <div className="p-10 text-center text-slate-500">Calendario en construcción...</div>;
const NewSupplierModal = ({ isOpen, onClose, onSave }: any) => isOpen ? (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Nuevo Proveedor</h2>
      <p>Formulario pendiente de implementación.</p>
      <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-200 rounded">Cerrar</button>
    </div>
  </div>
) : null;
// -----------------------------------------------------------------------------------

type PurchaseView = 'CATALOG' | 'ORDERS' | 'HISTORY' | 'SUPPLIERS' | 'CALENDAR';

interface PurchaseModuleProps {
  setView: (view: ViewState) => void;
}

interface PurchaseCartItem {
  product: Product;
  qty: number;
  cost: number;
  discount: number;
  tax: number;
  subtotal: number;
  isBackorder: boolean;
}

const SupplierDirectory = ({ onSelectSupplier }: any) => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Directorio de Proveedores</h2>
    <p className="text-slate-500">Lista de proveedores cargada desde Supabase...</p>
  </div>
);

export const Purchases: React.FC<PurchaseModuleProps> = ({ setView }) => {
  // Conectamos con el Contexto Real
  const { products, suppliers, processPurchase, addSupplier } = useDatabase();
  
  const [currentView, setCurrentView] = useState<PurchaseView>('CATALOG');
  const [purchaseCart, setPurchaseCart] = useState<PurchaseCartItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [reference, setReference] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modales
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReceivingModal, setShowReceivingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  
  // Datos del Formulario
  const [purchaseType, setPurchaseType] = useState<'DIRECT' | 'ORDER'>('DIRECT');
  const [paymentTerms, setPaymentTerms] = useState('CONTADO');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  // Filtrar productos
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.includes(searchTerm) ||
    p.barcode?.includes(searchTerm)
  );

  const addToPurchase = (product: Product) => {
    setPurchaseCart(prev => {
      const existing = prev.find(p => p.product.id === product.id);
      if (existing) return prev;
      
      return [...prev, { 
        product, 
        qty: 1, 
        cost: product.costPrice || 0,
        discount: 0,
        tax: 0.16, 
        subtotal: product.costPrice || 0,
        isBackorder: product.stock <= (product.minStock || 0)
      }];
    });
    setSearchTerm('');
  };

  const calculateSubtotal = (item: PurchaseCartItem, field: string, newValue: number) => {
    const updated = { ...item, [field]: newValue };
    const base = updated.qty * updated.cost;
    const discountAmount = base * (updated.discount / 100);
    return base - discountAmount;
  };

  const updateItem = (index: number, field: 'qty' | 'cost' | 'discount', value: string) => {
    const val = parseFloat(value) || 0;
    setPurchaseCart(prev => {
      const newCart = [...prev];
      newCart[index] = { 
        ...newCart[index], 
        [field]: val,
        subtotal: calculateSubtotal(newCart[index], field, val)
      };
      return newCart;
    });
  };

  const removeItem = (index: number) => {
    setPurchaseCart(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = purchaseCart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.16;
    return {
      subtotal,
      tax,
      discount: purchaseCart.reduce((sum, item) => sum + (item.qty * item.cost * item.discount / 100), 0),
      total: subtotal + tax
    };
  };

  // --- LÓGICA DE GUARDADO REAL ---
  const handleFinishPurchase = async () => {
    if (!selectedSupplier) return alert("Selecciona un proveedor");
    if (purchaseCart.length === 0) return alert("La lista de compra está vacía");
    
    // Mapeamos al formato que espera la base de datos
    const itemsFormatted = purchaseCart.map(i => ({
      productId: i.product.id,
      quantity: i.qty,
      cost: i.cost,
      discount: i.discount
    }));

    const totals = calculateTotals();

    try {
      if (purchaseType === 'DIRECT') {
        // LLAMADA A SUPABASE REAL
        const success = await processPurchase(
          itemsFormatted, 
          totals.total, 
          selectedSupplier, 
          reference || `TICKET-${Date.now()}`, 
          notes
        );

        if (success) {
          alert('✅ Compra registrada y Stock actualizado correctamente.');
          setPurchaseCart([]);
          setReference('');
          setNotes('');
          // Opcional: Redirigir al dashboard o historial
          // setCurrentView('HISTORY'); 
        } else {
          alert('❌ Error al guardar la compra en la base de datos.');
        }

      } else {
        // Lógica de Orden de Compra (Pendiente de implementar backend)
        alert('ℹ️ La función de Órdenes de Compra (Pendientes) se implementará en la siguiente fase.');
        // setShowReceivingModal(true);
      }
    } catch (error) {
      console.error("Error en compra:", error);
      alert("Ocurrió un error inesperado.");
    }
  };

  // Renderizado de Vistas
  const renderView = () => {
    switch(currentView) {
      case 'ORDERS':
        // Usamos el componente real que ya creamos
        return <PurchaseOrderList onSelectOrder={(o: any) => setSelectedOrder(o)} onViewDetail={() => setShowOrderModal(true)} />;
      case 'HISTORY':
        return <PurchaseHistory />;
      case 'SUPPLIERS':
        return <SupplierDirectory onSelectSupplier={setSelectedSupplier} />;
      case 'CALENDAR':
        return <PurchaseCalendar onDateSelect={(date: string) => { setDeliveryDate(date); setCurrentView('CATALOG'); }} />;
      default:
        return renderCatalogView();
    }
  };

  // ... (Tu renderCatalogView original, intacto excepto por imports) ...
  const renderCatalogView = () => {
    const totals = calculateTotals();
    
    return (
      <div className="flex flex-1 p-4 gap-4 overflow-hidden h-full">
        {/* IZQUIERDA: CATÁLOGO */}
        <div className="w-1/3 flex flex-col gap-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex gap-2 mb-3">
              <button 
                className={`flex-1 p-2 rounded-lg text-sm font-medium ${purchaseType === 'DIRECT' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                onClick={() => setPurchaseType('DIRECT')}
              >
                <TruckIcon size={16} className="inline mr-2"/> Compra Directa
              </button>
              <button 
                className={`flex-1 p-2 rounded-lg text-sm font-medium ${purchaseType === 'ORDER' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
                onClick={() => setPurchaseType('ORDER')}
              >
                <ClipboardList size={16} className="inline mr-2"/> Orden de Compra
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
              <input 
                className="w-full pl-10 p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" 
                placeholder="Buscar SKU, nombre..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Package size={48} className="mx-auto mb-4 opacity-20"/>
                <p>No se encontraron productos</p>
              </div>
            ) : (
              filteredProducts.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => addToPurchase(p)} 
                  className="w-full text-left p-3 border-b border-slate-50 hover:bg-emerald-50 flex justify-between items-center group transition-all"
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-700 text-sm">{p.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">SKU: {p.sku}</span>
                      <span className={`text-xs px-2 py-1 rounded ${p.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        Stock: {p.stock}
                      </span>
                    </div>
                  </div>
                  <Plus className="text-emerald-500 opacity-0 group-hover:opacity-100" size={20}/>
                </button>
              ))
            )}
          </div>
        </div>

        {/* DERECHA: ORDEN DE COMPRA */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Formulario Cabecera */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  <Users size={14} className="inline mr-1"/> Proveedor
                </label>
                <div className="flex gap-2">
                  <select 
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 outline-none" 
                    value={selectedSupplier} 
                    onChange={e => setSelectedSupplier(e.target.value)}
                  >
                    <option value="">-- Seleccionar --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => setShowSupplierModal(true)} 
                    className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"
                  >
                    <Plus size={20}/>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  <FileText size={14} className="inline mr-1"/> Referencia / Factura
                </label>
                <input 
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none" 
                  placeholder="FAC-12345" 
                  value={reference} 
                  onChange={e => setReference(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  <DollarSign size={14} className="inline mr-1"/> Pago
                </label>
                <select className="w-full p-2 border border-slate-200 rounded-lg outline-none">
                  <option>Contado</option>
                  <option>Crédito</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de Items */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
             {/* Cabecera Tabla */}
             <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-500 flex uppercase">
              <span className="flex-1 pl-2">Producto</span>
              <span className="w-24 text-center">Cant.</span>
              <span className="w-28 text-center">Costo</span>
              <span className="w-28 text-right">Subtotal</span>
              <span className="w-10"></span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {purchaseCart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <ShoppingCart size={48} className="mb-4 opacity-20"/>
                  <p>Carrito vacío</p>
                </div>
              ) : (
                purchaseCart.map((item, idx) => (
                  <div key={idx} className="flex items-center p-2 bg-white border border-slate-100 rounded-lg">
                    <div className="flex-1">
                      <p className="font-bold text-slate-700">{item.product.name}</p>
                      <p className="text-xs text-slate-500">SKU: {item.product.sku}</p>
                    </div>
                    <input 
                        type="number" min="1"
                        className="w-24 p-2 border rounded text-center font-bold outline-none mx-1" 
                        value={item.qty} 
                        onChange={e => updateItem(idx, 'qty', e.target.value)}
                    />
                    <div className="w-28 relative mx-1">
                      <span className="absolute left-2 top-2 text-slate-400">$</span>
                      <input 
                        type="number" step="0.01"
                        className="w-full pl-6 p-2 border rounded text-right outline-none" 
                        value={item.cost} 
                        onChange={e => updateItem(idx, 'cost', e.target.value)}
                      />
                    </div>
                    <span className="w-28 text-right font-bold text-emerald-700 pr-4">
                      ${item.subtotal.toFixed(2)}
                    </span>
                    <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Totales */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
               <div className="flex justify-end gap-8 mb-4">
                 <div className="text-right">
                   <p className="text-sm text-slate-500">Subtotal</p>
                   <p className="font-bold text-lg">${totals.subtotal.toFixed(2)}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm text-slate-500">Total</p>
                   <p className="font-bold text-2xl text-slate-800">${totals.total.toFixed(2)}</p>
                 </div>
               </div>
               <div className="flex justify-end gap-4">
                 <button 
                  onClick={handleFinishPurchase}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all"
                 >
                   <CheckCircle size={20}/> Procesar Compra
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('DASHBOARD')} className="p-2 hover:bg-slate-100 rounded-full">
              <ArrowLeft className="text-slate-600"/>
            </button>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Truck className="text-emerald-600"/> Gestión de Compras
            </h1>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
             {['CATALOG', 'ORDERS', 'HISTORY', 'SUPPLIERS'].map((v) => (
               <button 
                key={v}
                onClick={() => setCurrentView(v as PurchaseView)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentView === v ? 'bg-white shadow text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 {v === 'CATALOG' ? 'Compra' : v === 'ORDERS' ? 'Órdenes' : v === 'HISTORY' ? 'Historial' : 'Proveedores'}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>

      {/* Modales */}
      <NewSupplierModal isOpen={showSupplierModal} onClose={() => setShowSupplierModal(false)} />
    </div>
  );
};

// Necesario exportar por defecto para el Lazy Load de React si se usa
export default Purchases;