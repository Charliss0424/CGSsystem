import React, { useState, useEffect } from 'react';
import { X, Save, Info, Tag, Layers, DollarSign, PlusCircle, Package, Scale, Box, Plus, Trash2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Product, ProductPresentation } from '../types';
import { supabase } from '../services/supabase';

interface FullProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const FullProductModal: React.FC<FullProductModalProps> = ({ isOpen, onClose, productToEdit }) => {
  const { addProduct, updateProduct, categories, addCategory } = useDatabase();
  
  const [activeTab, setActiveTab] = useState<'info' | 'cat' | 'attr' | 'com'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateGroup, setUpdateGroup] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Estado de carga

  // --- ESTADO DEL FORMULARIO ---
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', sku: '', barcode: '', manufacturerCode: '',
    shortDescription: '', longDescription: '',
    brand: '', manufacturer: '', category: 'General',
    price: 0, costPrice: 0, stock: 0, image: '', // Campo Imagen
    width: 0, height: 0, length: 0, weightGross: 0,
    groupId: '', wholesalePrice: 0, wholesaleMin: 0,
    isWeighable: false, packPrice: 0, packQuantity: 0, packBarcode: '',
    contentPerUnit: 0, contentUnitPrice: 0,
    presentations: []
  });

  // --- CARGA INICIAL ---
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        ...productToEdit,
        presentations: productToEdit.presentations || [],
        contentPerUnit: productToEdit.contentPerUnit || 0,
        contentUnitPrice: productToEdit.contentUnitPrice || 0,
        image: productToEdit.image || '' // Asegurar que cargue la imagen
      });
      setUpdateGroup(false);
    } else {
      setFormData({
        name: '', sku: '', barcode: '', price: 0, costPrice: 0, stock: 0, category: 'General', image: '',
        groupId: '', wholesalePrice: 0, wholesaleMin: 0,
        isWeighable: false, packPrice: 0, packQuantity: 0, packBarcode: '',
        contentPerUnit: 0, contentUnitPrice: 0,
        presentations: []
      });
    }
    setActiveTab('info');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // --- MANEJADORES ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
        const val = value === '' ? 0 : parseFloat(value);
        setFormData(prev => ({ ...prev, [name]: val }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  // --- SUBIDA DE IMAGEN ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // 1. Subir
        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Obtener URL
        const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        // 3. Guardar en estado
        setFormData(prev => ({ ...prev, image: data.publicUrl }));
        
    } catch (error: any) {
        console.error('Error subiendo imagen:', error);
        alert('Error al subir la imagen. Verifica tu conexión.');
    } finally {
        setIsUploading(false);
    }
  };

  // --- PRESENTACIONES ---
  const addPresentation = () => {
    setFormData(prev => ({ ...prev, presentations: [...(prev.presentations || []), { id: crypto.randomUUID(), name: '', barcode: '', quantity: 1, price: 0 }] }));
  };
  const updatePresentation = (index: number, field: any, value: any) => {
    const list = [...(formData.presentations || [])]; list[index] = { ...list[index], [field]: value }; setFormData(prev => ({ ...prev, presentations: list }));
  };
  const removePresentation = (index: number) => {
    const list = [...(formData.presentations || [])]; list.splice(index, 1); setFormData(prev => ({ ...prev, presentations: list }));
  };

  const handleQuickAddCategory = async () => {
    const newCat = prompt("Nueva categoría:"); 
    if (newCat) { await addCategory(newCat); setFormData(p => ({ ...p, category: newCat })); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      if (productToEdit?.id) {
          // @ts-ignore
          await updateProduct({ ...productToEdit, ...formData } as Product, updateGroup);
      } else {
          await addProduct(formData as Product);
      }
      onClose();
    } catch(e) { console.error(e); } 
    finally { setIsSubmitting(false); }
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button type="button" onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
        <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800">{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full"><X size={24} /></button>
        </div>

        <div className="flex border-b border-slate-200 px-6 overflow-x-auto bg-white">
          <TabButton id="info" label="Información Básica" icon={Info} />
          <TabButton id="cat" label="Categorización" icon={Tag} />
          <TabButton id="attr" label="Atributos" icon={Layers} />
          <TabButton id="com" label="Info Comercial" icon={DollarSign} />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 bg-white">
          
          {/* --- PESTAÑA: INFORMACIÓN BÁSICA (CON FOTO) --- */}
          {activeTab === 'info' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* ESTRUCTURA DE COLUMNAS: FOTO A LA IZQUIERDA, DATOS A LA DERECHA */}
              <div className="flex flex-col md:flex-row gap-6">
                  
                  {/* COLUMNA IZQUIERDA: FOTO */}
                  <div className="w-full md:w-1/3">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Imagen del Producto</label>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl h-48 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group hover:border-blue-500 transition-colors cursor-pointer">
                          
                          {/* Previsualización */}
                          {formData.image ? (
                              <img src={formData.image} alt="Producto" className="w-full h-full object-contain p-2" />
                          ) : (
                              <div className="text-center text-slate-400">
                                  <ImageIcon size={32} className="mx-auto mb-2"/>
                                  <span className="text-xs font-medium">Click para subir imagen</span>
                              </div>
                          )}
                          
                          {/* Input invisible */}
                          <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload} 
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          
                          {/* Overlay de carga */}
                          {isUploading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">
                                  Subiendo...
                              </div>
                          )}
                      </div>
                  </div>

                  {/* COLUMNA DERECHA: CAMPOS DE TEXTO */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">SKU (Interno)</label>
                            <input name="sku" value={formData.sku} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Código de Barras</label>
                            <input name="barcode" value={formData.barcode} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Producto</label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Descripción Corta</label>
                        <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Resumen para ticket" />
                    </div>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'cat' && (
            <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-300">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Categoría</label>
                    <div className="flex gap-2">
                        <select name="category" value={formData.category} onChange={handleChange} className="flex-1 p-3 border border-slate-300 rounded-lg bg-white outline-none cursor-pointer focus:ring-2 focus:ring-blue-500">
                            <option value="General">General</option>
                            {categories?.map((cat: any) => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
                        </select>
                        <button type="button" onClick={handleQuickAddCategory} className="p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"><PlusCircle size={20} /></button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Marca</label>
                    <input name="brand" value={formData.brand} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
          )}

          {activeTab === 'attr' && (<div className="text-center text-slate-400 py-10 animate-in fade-in"><Layers size={48} className="mx-auto mb-4 opacity-20"/><p>Opciones de atributos próximamente.</p></div>)}

          {activeTab === 'com' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-3 gap-6">
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Precio Venta (Unitario)</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span><input type="number" name="price" value={formData.price} onFocus={handleFocus} onChange={handleChange} className="w-full pl-6 p-3 border border-slate-300 rounded-lg text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500" /></div></div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Costo (Referencia)</label><input type="number" name="costPrice" value={formData.costPrice} onFocus={handleFocus} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Stock Total</label><input type="number" name="stock" value={formData.stock} onFocus={handleFocus} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" /></div>
                </div>

                <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 mt-6 relative overflow-hidden">
                    <h3 className="font-bold text-indigo-800 mb-2 flex items-center gap-2 relative z-10"><Tag size={18}/> Estrategia de Mayoreo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div><label className="block text-sm font-bold text-slate-700 mb-1">ID de Grupo</label><input name="groupId" value={formData.groupId || ''} onChange={handleChange} className="w-full p-3 border border-indigo-200 rounded-lg uppercase bg-white outline-none focus:border-indigo-500" placeholder="Ej. REFRESCOS"/></div>
                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Precio Mayoreo</label><input type="number" name="wholesalePrice" value={formData.wholesalePrice || ''} onFocus={handleFocus} onChange={handleChange} className="w-full p-3 border border-indigo-200 rounded-lg text-emerald-600 font-bold bg-white outline-none focus:border-indigo-500" placeholder="0.00"/></div>
                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Cant. Mínima</label><input type="number" name="wholesaleMin" value={formData.wholesaleMin || ''} onFocus={handleFocus} onChange={handleChange} className="w-full p-3 border border-indigo-200 rounded-lg bg-white outline-none focus:border-indigo-500" placeholder="Ej. 3"/></div>
                    </div>
                    {productToEdit && formData.groupId && (<div className="mt-4 flex items-center gap-3 bg-white p-3 rounded-lg border border-indigo-200 shadow-sm relative z-10"><input type="checkbox" id="updateGroup" checked={updateGroup} onChange={(e) => setUpdateGroup(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded cursor-pointer"/><label htmlFor="updateGroup" className="text-sm text-slate-700 font-medium cursor-pointer select-none">Aplicar a TODOS los productos del grupo <span className="font-bold text-indigo-600">{formData.groupId}</span></label></div>)}
                </div>

                {/* VENTA SUELTA (Contenido Unitario) */}
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 mt-4 relative overflow-hidden">
                    <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2"><Plus size={18}/> Venta Suelta (Sub-unidades)</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Contenido de la Unidad</label>
                            <input type="number" name="contentPerUnit" value={formData.contentPerUnit || ''} onFocus={handleFocus} onChange={handleChange} className="w-full p-2 border border-purple-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Ej. 20 (Cigarros)"/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Precio por Pieza Suelta</label>
                            <input type="number" name="contentUnitPrice" value={formData.contentUnitPrice || ''} onFocus={handleFocus} onChange={handleChange} className="w-full p-2 border border-purple-200 rounded-lg bg-white font-bold text-purple-700 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="$0.00"/>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 mt-4 relative overflow-hidden">
                    <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2"><Package size={18}/> Presentación Básica / Medida</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-orange-200 shadow-sm"><input type="checkbox" name="isWeighable" checked={!!formData.isWeighable} onChange={handleChange} className="w-5 h-5 text-orange-600 rounded cursor-pointer"/><div className="flex-1"><label className="block text-sm font-bold text-slate-700">Producto a Granel (Báscula)</label><p className="text-[10px] text-slate-500">Se vende por kilo/fracción.</p></div><Scale className="text-orange-400" size={24} /></div>
                        <div className="space-y-3 p-3 bg-white border border-orange-200 rounded-lg shadow-sm"><div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-bold text-slate-500 mb-1">Contenido</label><input type="number" name="packQuantity" value={formData.packQuantity || ''} onFocus={handleFocus} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ej. 12"/></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Precio Paquete</label><input type="number" name="packPrice" value={formData.packPrice || ''} onFocus={handleFocus} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold text-orange-700 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="$0.00"/></div></div><div><label className="block text-xs font-bold text-slate-500 mb-1">Cód. Barras Caja</label><input name="packBarcode" value={formData.packBarcode || ''} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Escanea código caja..."/></div></div>
                    </div>
                </div>

                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mt-4 relative">
                    <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-blue-800 flex items-center gap-2"><Box size={18}/> Múltiples Presentaciones</h3><button type="button" onClick={addPresentation} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition-colors shadow-sm"><Plus size={14}/> Agregar Variante</button></div>
                    <div className="space-y-2">{(formData.presentations || []).map((pres, idx) => (<div key={pres.id || idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-white p-2 rounded-lg border border-blue-200 shadow-sm"><div className="flex-1 min-w-[120px]"><label className="text-[10px] text-slate-400 font-bold block">Nombre</label><input value={pres.name} onChange={(e) => updatePresentation(idx, 'name', e.target.value)} className="w-full p-1 border-b border-slate-200 outline-none text-sm focus:border-blue-500" placeholder="Ej. Caja Master"/></div><div className="w-full md:w-1/4"><label className="text-[10px] text-slate-400 font-bold block">Cód. Barras</label><input value={pres.barcode} onChange={(e) => updatePresentation(idx, 'barcode', e.target.value)} className="w-full p-1 border-b border-slate-200 outline-none text-sm font-mono focus:border-blue-500" placeholder="Escanea..."/></div><div className="w-20"><label className="text-[10px] text-slate-400 font-bold block">Contenido</label><input type="number" value={pres.quantity} onFocus={handleFocus} onChange={(e) => updatePresentation(idx, 'quantity', parseFloat(e.target.value))} className="w-full p-1 border-b border-slate-200 outline-none text-sm text-center focus:border-blue-500" /></div><div className="w-24"><label className="text-[10px] text-slate-400 font-bold block">Precio</label><input type="number" value={pres.price} onFocus={handleFocus} onChange={(e) => updatePresentation(idx, 'price', parseFloat(e.target.value))} className="w-full p-1 border-b border-slate-200 outline-none text-sm font-bold text-blue-600 text-right focus:border-blue-500" placeholder="$0.00"/></div><button type="button" onClick={() => removePresentation(idx)} className="text-red-300 hover:text-red-500 p-2 hover:bg-red-50 rounded transition-colors self-end"><Trash2 size={16}/></button></div>))}</div>
                </div>
            </div>
          )}
        </form>

        <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3 shadow-lg z-10">
          <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95">
             <Save size={20} /> {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </div>
    </div>
  );
};