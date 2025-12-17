import React, { useState, useRef } from 'react';
import { Search, Plus, Zap, Edit3, Trash2, ArrowUpDown, Filter, Package, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Product } from '../types';
import { QuickAddModal } from '../components/QuickAddModal';
import { FullProductModal } from '../components/FullProductModal';

export const Inventory = () => {
  const { products, addProduct, deleteProduct, isLoading } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Control de Modales
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showFullAdd, setShowFullAdd] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Input oculto para importar
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchTerm))
  );

  // --- LÓGICA EXPORTAR ---
  const handleExport = () => {
    if (products.length === 0) return alert("No hay productos para exportar.");
    
    // Encabezados del CSV
    const headers = "Nombre,Precio,Costo,Stock,SKU,CodigoBarras,Categoria";
    
    // Filas
    const rows = products.map(p => 
        `"${p.name}",${p.price},${p.costPrice || 0},${p.stock},"${p.sku}","${p.barcode || ''}","${p.category}"`
    );

    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_nexpos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LÓGICA IMPORTAR ---
  const handleImportClick = () => fileInputRef.current?.click();

  const processImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
        const text = evt.target?.result as string;
        if (!text) return;
        
        const lines = text.split('\n');
        const dataLines = lines.slice(1); // Saltar header
        let successCount = 0;

        for (const line of dataLines) {
            if (!line.trim()) continue;
            // Parseo básico (Nombre,Precio,Costo,Stock,SKU,CodigoBarras,Categoria)
            const cols = line.split(',');
            
            const name = cols[0]?.replace(/"/g, '').trim();
            const price = parseFloat(cols[1]) || 0;
            const costPrice = parseFloat(cols[2]) || 0;
            const stock = parseInt(cols[3]) || 0;
            const sku = cols[4]?.replace(/"/g, '').trim() || '';
            const barcode = cols[5]?.replace(/"/g, '').trim() || '';
            const category = cols[6]?.replace(/"/g, '').trim() || 'General';

            if (name && price > 0) {
                await addProduct({
                    name, price, costPrice, stock, sku: sku || 'S/N', barcode, category,
                    image: '', isWeighable: false, packPrice: 0, packQuantity: 0
                });
                successCount++;
            }
        }
        alert(`Se importaron ${successCount} productos correctamente.`);
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  // --- MANEJADORES UI ---
  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setShowFullAdd(true);
  };

  const handleDelete = async (id: string) => {
    if(confirm('¿Estás seguro de eliminar este producto?')) await deleteProduct(id);
  };

  const handleOpenCreate = () => {
    setProductToEdit(null);
    setShowFullAdd(true);
  };

  return (
    <div className="h-full bg-slate-50 p-6 flex flex-col gap-6">
      
      <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={processImport} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Catálogo de Productos</h1>
          <p className="text-slate-500">Gestiona tu inventario, precios y existencias.</p>
        </div>
        <div className="flex gap-3">
          {/* Botones Exportar/Importar */}
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-600 font-bold hover:bg-slate-50 transition-colors shadow-sm text-sm">
            <Download size={18}/> Exportar
          </button>
          <button onClick={handleImportClick} disabled={isImporting} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-600 font-bold hover:bg-slate-50 transition-colors shadow-sm text-sm">
            <Upload size={18}/> {isImporting ? 'Cargando...' : 'Importar'}
          </button>
          
          <div className="w-px h-10 bg-slate-300 mx-2 hidden md:block"></div>

          <button 
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            <Zap size={20} /> Alta Rápida
          </button>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Plus size={20} /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* Barra de Herramientas */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por Nombre, SKU o Código..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-colors bg-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200" title="Filtrar">
             <Filter size={20} />
           </button>
           <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200" title="Ordenar">
             <ArrowUpDown size={20} />
           </button>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU / Código</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Grupo (Mix)</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Costo</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Precio</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Stock</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                 <tr><td colSpan={8} className="p-10 text-center text-slate-400">Cargando inventario...</td></tr>
              ) : filteredProducts.length === 0 ? (
                 <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-400 flex flex-col items-center justify-center">
                        <Package size={48} className="mb-2 opacity-20"/>
                        No se encontraron productos
                    </td>
                 </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg shrink-0 overflow-hidden border border-slate-200">
                          {p.image ? <img src={p.image} className="w-full h-full object-cover"/> : p.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700 text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                        <div className="text-xs text-slate-500 font-mono">{p.sku}</div>
                        {p.barcode && <div className="text-[10px] text-slate-400">{p.barcode}</div>}
                    </td>
                    <td className="p-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 border border-slate-200">{p.category}</span>
                    </td>
                    <td className="p-4">
                      {p.groupId ? (
                        <div className="flex flex-col items-start">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold border border-indigo-200 uppercase">{p.groupId}</span>
                          {p.wholesaleMin && <span className="text-[10px] text-slate-400 mt-0.5 ml-1">Min: {p.wholesaleMin} pzas</span>}
                        </div>
                      ) : <span className="text-slate-300 text-xs">-</span>}
                    </td>
                    <td className="p-4 text-right text-sm text-slate-400">${p.costPrice?.toFixed(2) || '0.00'}</td>
                    <td className="p-4 text-right">
                        <div className="font-bold text-slate-800">${p.price.toFixed(2)}</div>
                        {p.wholesalePrice && <div className="text-[10px] text-green-600 font-medium">May: ${p.wholesalePrice}</div>}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {p.stock} {p.isWeighable ? 'kg' : ''}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Edit3 size={18}/></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <QuickAddModal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
      <FullProductModal isOpen={showFullAdd} onClose={() => setShowFullAdd(false)} productToEdit={productToEdit} />

    </div>
  );
};