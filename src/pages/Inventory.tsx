import React, { useState, useRef } from 'react';
import { 
  Search, Plus, Zap, Edit3, Trash2, ArrowUpDown, Filter, 
  Package, Download, Upload, Car, XCircle, FileSpreadsheet, Lock,
  ClipboardCheck // <--- 1. IMPORTAR ICONO NUEVO
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { supabase } from '../services/supabase';
import { Product } from '../types';
import { QuickAddModal } from '../components/QuickAddModal';
import { FullProductModal } from '../components/FullProductModal';
import { AdminAuthModal } from '../components/AdminAuthModal';
// IMPORTAR EL MODAL DE CONTEO
import { InventoryCountModal } from '../components/InventoryCountModal';

export const Inventory = () => {
  const { products, addProduct, updateProduct, isLoading, auditProductStock } = useDatabase(); // Asegúrate de tener auditProductStock en tu context
  
  // --- ESTADOS DE BÚSQUEDA ---
  const [searchMode, setSearchMode] = useState<'GENERAL' | 'VEHICLE'>('GENERAL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refaccionaria
  const [vehicleSearch, setVehicleSearch] = useState({ make: '', model: '', year: new Date().getFullYear() });
  const [fitmentResults, setFitmentResults] = useState<string[]>([]);
  const [isSearchingFitment, setIsSearchingFitment] = useState(false);

  // --- CONTROL DE MODALES ---
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFullAdd, setShowFullAdd] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  // --- NUEVO: ESTADO PARA AUDITORÍA ---
  const [showAudit, setShowAudit] = useState(false);
  const [productToAudit, setProductToAudit] = useState<Product | null>(null);
  
  // --- SEGURIDAD (SUPERVISOR) ---
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'EDIT' | 'DELETE', product: Product } | null>(null);

  // --- IMPORTACIÓN / EXPORTACIÓN ---
  const [isImporting, setIsImporting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // 1. LÓGICA DE BÚSQUEDA INTELIGENTE
  // ==========================================
  const filteredProducts = products.filter(p => {
    if (searchMode === 'GENERAL') {
      const term = searchTerm.toLowerCase();
      const basicMatch = (
        p.name.toLowerCase().includes(term) || 
        p.sku.toLowerCase().includes(term) ||
        (p.barcode && p.barcode.includes(term))
      );
      const attrMatch = p.attributes 
        ? JSON.stringify(p.attributes).toLowerCase().includes(term)
        : false;
      return basicMatch || attrMatch;
    } else {
      if (fitmentResults.length === 0 && !vehicleSearch.make) return true;
      return fitmentResults.includes(p.id);
    }
  });

  const searchByVehicle = async () => {
    if (!vehicleSearch.make) return;
    setIsSearchingFitment(true);
    try {
      const { data } = await supabase.from('product_fitment')
        .select('product_id')
        .ilike('make', `%${vehicleSearch.make}%`) 
        .ilike('model', `%${vehicleSearch.model}%`)
        .lte('year_start', vehicleSearch.year) 
        .gte('year_end', vehicleSearch.year);

      if (data) setFitmentResults(data.map((item: any) => item.product_id));
    } catch (error) { console.error(error); } 
    finally { setIsSearchingFitment(false); }
  };

  // ==========================================
  // 2. SEGURIDAD Y SOFT DELETE
  // ==========================================
  const initiateAction = (type: 'EDIT' | 'DELETE', product: Product) => {
    setPendingAction({ type, product });
    setShowAuth(true); 
  };

  const handleAuthSuccess = async () => {
    setShowAuth(false);
    if (!pendingAction) return;

    if (pendingAction.type === 'DELETE') {
      const { error } = await supabase
        .from('products')
        .update({ is_deleted: true }) 
        .eq('id', pendingAction.product.id);
      
      if (error) alert("Error al eliminar");
      else window.location.reload(); 
    } 
    
    if (pendingAction.type === 'EDIT') {
      setProductToEdit(pendingAction.product);
      setShowFullAdd(true);
    }
    setPendingAction(null);
  };

  // ==========================================
  // 3. NUEVA FUNCIÓN: AUDITAR PRODUCTO
  // ==========================================
  const handleOpenAudit = (product: Product) => {
    setProductToAudit(product);
    setShowAudit(true);
  };

  const handleConfirmAudit = async (newStock: number) => {
    if (productToAudit && auditProductStock) {
        // Asumimos que tienes auditProductStock en el contexto, si no, usa updateProduct
        const success = await auditProductStock(productToAudit.id, newStock, "Conteo Rápido Inventario");
        if (success) {
            // Feedback visual o toast
        }
    }
    setShowAudit(false);
  };

  // ==========================================
  // 4. PLANTILLAS DE IMPORTACIÓN
  // ==========================================
  const downloadTemplate = (type: 'GROCERY' | 'AUTOPARTS' | 'HARDWARE') => {
    // ... (Tu código de plantillas igual)
    let headers = ""; let example = ""; let filename = "";
    switch (type) {
        case 'GROCERY': headers = "Nombre,CodigoBarras,Costo,Precio,Stock"; example = `"Coca Cola",...`; filename = "plantilla_abarrotes.csv"; break;
        // ... otros casos
    }
    // ... lógica de descarga
    setShowTemplates(false);
  };

  return (
    <div className="h-full bg-slate-50 p-6 flex flex-col gap-6" onClick={() => setShowTemplates(false)}>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Catálogo de Productos</h1>
          <p className="text-slate-500">Gestión de inventario y precios.</p>
        </div>
        <div className="flex gap-3 relative">
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setShowTemplates(!showTemplates); }} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-600 font-bold hover:bg-slate-50 text-sm">
                <FileSpreadsheet size={18}/> Plantillas CSV
            </button>
            {showTemplates && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                    <button className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm text-slate-700">Abarrotes</button>
                    {/* ... */}
                </div>
            )}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-600 font-bold hover:bg-slate-50 text-sm"><Upload size={18}/> Importar</button>
          <div className="w-px h-10 bg-slate-300 mx-2 hidden md:block"></div>
          <button onClick={() => setShowQuickAdd(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-emerald-200 active:scale-95"><Zap size={20} /> Alta Rápida</button>
          <button onClick={() => { setProductToEdit(null); setShowFullAdd(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-200 active:scale-95"><Plus size={20} /> Nuevo Producto</button>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        {/* ... (Tu código de búsqueda igual) ... */}
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Producto</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">SKU / Código</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Categoría</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Precio</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Stock</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (<tr><td colSpan={6} className="p-10 text-center">Cargando...</td></tr>) : 
               filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg shrink-0 overflow-hidden border">
                          {p.image ? <img src={p.image} className="w-full h-full object-cover"/> : p.name.charAt(0)}
                        </div>
                        <div>
                            <span className="font-bold text-slate-700 text-sm block">{p.name}</span>
                            {/* Mostrar Unidad de Empaque si existe */}
                            {p.packUnit && (
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 rounded border border-indigo-100">
                                    Venta por: {p.packUnit} ({p.packContent} {p.unitBase})
                                </span>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-mono">
                        <div>{p.sku}</div>
                        {p.barcode && <div className="text-[10px] text-slate-400">{p.barcode}</div>}
                    </td>
                    <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 border">{p.category}</span></td>
                    <td className="p-4 text-right">
                        <div className="font-bold text-slate-800">${p.price.toFixed(2)}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.stock} {p.unitBase || ''}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        
                        {/* 1. BOTÓN DE AUDITORÍA (NUEVO) */}
                        <button 
                            onClick={() => handleOpenAudit(p)} 
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Auditar / Contar Existencias"
                        >
                            <ClipboardCheck size={18} />
                        </button>

                        <button onClick={() => initiateAction('EDIT', p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                            <Edit3 size={18}/>
                        </button>
                        <button onClick={() => initiateAction('DELETE', p)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar">
                            <Trash2 size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} />
      
      {/* MODALES */}
      <QuickAddModal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
      <FullProductModal isOpen={showFullAdd} onClose={() => setShowFullAdd(false)} productToEdit={productToEdit} />
      
      <AdminAuthModal 
        isOpen={showAuth} 
        onClose={() => { setShowAuth(false); setPendingAction(null); }} 
        onSuccess={handleAuthSuccess}
        actionName={pendingAction?.type === 'DELETE' ? 'Eliminar Producto' : 'Editar Producto'} 
      />

      {/* --- 2. MODAL DE AUDITORÍA (NUEVO) --- */}
      {productToAudit && (
        <InventoryCountModal 
            isOpen={showAudit}
            onClose={() => setShowAudit(false)}
            product={productToAudit}
            onConfirm={handleConfirmAudit}
        />
      )}

    </div>
  );
};