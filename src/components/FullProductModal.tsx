import React, { useState, useEffect } from 'react';
import { 
  X, Save, Info, Tag, Layers, DollarSign, Package, Scale, 
  Box, Plus, Trash2, Image as ImageIcon, Car, Loader2, PlusCircle, Receipt, Percent
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Product } from '../types';
import { supabase } from '../services/supabase';

// ==========================================
// 1. COMPONENTES AUXILIARES (OPTIMIZADOS)
// ==========================================

const ProductFitmentTab = ({ productId, fitments, setFitments }: any) => {
  const [newFit, setNewFit] = useState({ make: '', model: '', year_start: 2024, year_end: 2024, engine: '' });
  
  useEffect(() => {
    if (productId) {
      supabase.from('product_fitment').select('*').eq('product_id', productId).then(({ data }) => { if(data) setFitments(data) });
    }
  }, [productId]);

  const add = async () => {
    if(!newFit.make) return;
    if(productId) {
        await supabase.from('product_fitment').insert([{...newFit, product_id: productId}]);
        const { data } = await supabase.from('product_fitment').select('*').eq('product_id', productId);
        if(data) setFitments(data);
    } else {
        setFitments([...fitments, { ...newFit, id: Date.now() }]);
    }
    setNewFit({ ...newFit, model: '', engine: '' });
  };

  const remove = async (id: any) => {
    if(productId) await supabase.from('product_fitment').delete().eq('id', id);
    setFitments(fitments.filter((f: any) => f.id !== id));
  };

  return (
    <div className="space-y-4 animate-in fade-in">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-800 items-center">
            <Car size={20} className="shrink-0"/><span>Asigna vehículos compatibles.</span>
        </div>
        {/* GRID RESPONSIVE: 2 columnas en móvil, 12 en escritorio */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <input className="col-span-2 md:col-span-3 p-2.5 border border-slate-300 rounded-lg text-sm w-full" placeholder="Marca" value={newFit.make} onChange={e=>setNewFit({...newFit, make: e.target.value})}/>
            <input className="col-span-2 md:col-span-3 p-2.5 border border-slate-300 rounded-lg text-sm w-full" placeholder="Modelo" value={newFit.model} onChange={e=>setNewFit({...newFit, model: e.target.value})}/>
            <input type="number" className="col-span-1 md:col-span-2 p-2.5 border border-slate-300 rounded-lg text-sm w-full" placeholder="Inicio" value={newFit.year_start} onChange={e=>setNewFit({...newFit, year_start: +e.target.value})}/>
            <input type="number" className="col-span-1 md:col-span-2 p-2.5 border border-slate-300 rounded-lg text-sm w-full" placeholder="Fin" value={newFit.year_end} onChange={e=>setNewFit({...newFit, year_end: +e.target.value})}/>
            <button type="button" onClick={add} className="col-span-2 md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-colors py-2 md:py-0"><Plus size={20} className="mx-auto"/></button>
        </div>
        <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl bg-white">
            {fitments.length === 0 ? <p className="p-4 text-center text-slate-400 text-sm">No hay compatibilidades asignadas</p> : 
            fitments.map((f: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 border-b border-slate-100 text-sm hover:bg-slate-50 last:border-0">
                    <span className="font-medium text-slate-700">{f.make} {f.model} ({f.year_start}-{f.year_end})</span>
                    <button type="button" onClick={()=>remove(f.id)} className="text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 size={16}/></button>
                </div>
            ))}
        </div>
    </div>
  );
};

const ProductAttributesTab = ({ attributes, setAttributes }: any) => {
  const [k, setK] = useState(''); const [v, setV] = useState('');
  const add = () => { if(k && v) { setAttributes({...attributes, [k]: v}); setK(''); setV(''); } };
  return (
    <div className="space-y-4 animate-in fade-in">
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3 text-sm text-orange-800 items-center">
            <Layers size={20} className="shrink-0"/><span>Especificaciones técnicas.</span>
        </div>
        {/* FLEX COLUMN EN MÓVIL */}
        <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <input className="w-full sm:flex-1 p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="Atributo (Ej. Material)" value={k} onChange={e=>setK(e.target.value)}/>
            <input className="w-full sm:flex-1 p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="Valor (Ej. Acero)" value={v} onChange={e=>setV(e.target.value)}/>
            <button type="button" onClick={add} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 sm:py-0 rounded-lg shadow-sm transition-colors flex justify-center items-center"><Plus size={20}/></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(attributes).map(([key, val]: any) => (
                <div key={key} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg text-sm bg-white shadow-sm">
                    <span className="font-bold text-slate-600 truncate mr-2">{key}: <span className="text-slate-800 font-normal ml-1">{val}</span></span>
                    <button type="button" onClick={()=>{ const n={...attributes}; delete n[key]; setAttributes(n); }} className="text-red-400 hover:text-red-600 transition-colors shrink-0"><Trash2 size={16}/></button>
                </div>
            ))}
        </div>
    </div>
  );
};

const InputGroup = ({ label, name, type="text", placeholder="", value, onChange }: any) => (
  <div className="w-full">
      <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
      <input 
          type={type} 
          name={name} 
          value={value === undefined || value === null ? '' : value} 
          onChange={onChange} 
          placeholder={placeholder}
          onFocus={(e) => e.target.select()}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 transition-all placeholder-slate-400" 
      />
  </div>
);

// ==========================================
// 2. COMPONENTE PRINCIPAL (MODAL)
// ==========================================

interface FullProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const INITIAL_FORM_DATA = {
  name: '', sku: '', barcode: '', category: 'General',
  price: 0, costPrice: 0, stock: 0, image: '',
  groupId: '', wholesalePrice: 0, wholesaleMin: 0,
  isWeighable: false, packPrice: 0, packQuantity: 0, packBarcode: '',
  contentPerUnit: 0, contentUnitPrice: 0,
  presentations: [],
  taxIds: [] as string[]
};

export const FullProductModal: React.FC<FullProductModalProps> = ({ isOpen, onClose, productToEdit }) => {
  const { addProduct, updateProduct, categories, addCategory, taxes } = useDatabase();
  
  const [activeTab, setActiveTab] = useState<'info' | 'cat' | 'com' | 'tax' | 'attr' | 'fitment'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [fitments, setFitments] = useState<any[]>([]); 
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [applyToGroup, setApplyToGroup] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>(INITIAL_FORM_DATA);

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setFormData({ 
            ...INITIAL_FORM_DATA, 
            ...productToEdit, 
            presentations: productToEdit.presentations || [],
            // @ts-ignore
            taxIds: productToEdit.taxIds || [] 
        });
        // @ts-ignore
        setAttributes(productToEdit.attributes || {});
        setFitments([]);
        setApplyToGroup(false);
      } else {
        setFormData(INITIAL_FORM_DATA);
        setAttributes({});
        setFitments([]);
      }
      setActiveTab('info');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
        const numVal = value === '' ? '' : parseFloat(value);
        setFormData(prev => ({ ...prev, [name]: numVal }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleTax = (taxId: string) => {
    setFormData(prev => {
        const currentTaxes = prev.taxIds || [];
        if (currentTaxes.includes(taxId)) {
            return { ...prev, taxIds: currentTaxes.filter(id => id !== taxId) };
        } else {
            return { ...prev, taxIds: [...currentTaxes, taxId] };
        }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsSubmitting(true);
    try {
      const finalProduct = { ...formData, attributes };
      if (finalProduct.price === ('', 0)) finalProduct.price = 0;
      
      if (productToEdit?.id) {
          if (applyToGroup && formData.groupId) {
             await updateProduct(finalProduct as Product);
             await supabase.from('products').update({ price: formData.price, wholesalePrice: formData.wholesalePrice, wholesaleMin: formData.wholesaleMin }).eq('groupId', formData.groupId).neq('id', productToEdit.id);
          } else {
             await updateProduct(finalProduct as Product);
          }
      } else {
          await addProduct(finalProduct as any);
      }
      onClose();
    } catch(e) { console.error(e); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 transition-opacity animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-scale-up border border-slate-100">
        
        {/* HEADER */}
        <div className="px-4 py-4 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20 shrink-0">
          <div>
             <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* TABS (SCROLLABLE) */}
        <div className="flex border-b border-slate-200 px-4 sm:px-8 bg-white overflow-x-auto shrink-0 no-scrollbar">
          {[
            { id: 'info', label: 'Info', icon: Info },
            { id: 'cat', label: 'Categoría', icon: Tag },
            { id: 'com', label: 'Comercial', icon: DollarSign },
            { id: 'tax', label: 'Impuestos', icon: Receipt },
            { id: 'attr', label: 'Atributos', icon: Layers },
            { id: 'fitment', label: 'Compatibilidad', icon: Car },
          ].map(tab => (
            <button 
                key={tab.id} 
                type="button"
                onClick={() => setActiveTab(tab.id as any)} 
                className={`flex items-center gap-2 px-3 py-3 sm:px-4 sm:py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap outline-none ${
                    activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
            >
                <tab.icon size={18} /> <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0,4)}..</span>
            </button>
          ))}
        </div>

        {/* CONTENIDO (Scrollable) */}
        {/* Padding reducido en móvil (p-4) y aumentado en escritorio (md:p-8) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-8 bg-white w-full">
          
          {/* 1. INFO BÁSICA */}
          {activeTab === 'info' && (
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 animate-fade-in">
                {/* Columna Izquierda: Imagen */}
                <div className="w-full md:w-1/3 space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Imagen</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl aspect-square flex items-center justify-center bg-slate-50 relative cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all group overflow-hidden">
                        {formData.image ? (
                            <img src={formData.image} className="w-full h-full object-contain p-2" alt="Producto"/>
                        ) : (
                            <div className="flex flex-col items-center text-slate-300 group-hover:text-blue-400 transition-colors">
                                <ImageIcon size={48} />
                                <span className="text-xs font-bold mt-2">Subir imagen</span>
                            </div>
                        )}
                        
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            disabled={isUploading}
                            onChange={async (e) => {
                                const file = e.target.files?.[0]; 
                                if(!file) return;
                                if (file.size > 2 * 1024 * 1024) { alert("Máximo 2MB"); return; }
                                setIsUploading(true);
                                try {
                                    const fileExt = file.name.split('.').pop();
                                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                                    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
                                    if (uploadError) throw uploadError;
                                    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                                    setFormData(p => ({ ...p, image: data.publicUrl }));
                                } catch (error) { console.error(error); alert("Error al subir."); } 
                                finally { setIsUploading(false); }
                            }}
                        />
                        {isUploading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-blue-600 text-xs font-bold z-10">
                                <Loader2 size={32} className="animate-spin mb-2"/> Subiendo...
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Campos */}
                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputGroup label="SKU (Interno)" name="sku" value={formData.sku} onChange={handleChange} />
                        <InputGroup label="Código de Barras" name="barcode" value={formData.barcode} onChange={handleChange} />
                    </div>
                    <InputGroup label="Nombre del Producto" name="name" value={formData.name} onChange={handleChange} />
                    <InputGroup label="Descripción Corta" name="shortDescription" value={(formData as any).shortDescription} onChange={handleChange} placeholder="Resumen para ticket" />
                </div>
            </div>
          )}

          {/* 2. CATEGORIZACIÓN */}
          {activeTab === 'cat' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 animate-fade-in max-w-2xl">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Categoría</label>
                    <div className="flex gap-2">
                        <select name="category" value={formData.category} onChange={handleChange} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 cursor-pointer w-full">
                            <option value="General">General</option>
                            {categories?.map((c:any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <button type="button" onClick={()=>{ const c=prompt("Nueva Categoría:"); if(c) { addCategory(c); setFormData(p=>({...p, category:c})) } }} className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-colors shrink-0">
                            <PlusCircle size={20}/>
                        </button>
                    </div>
                </div>
                <InputGroup label="Marca" name="brand" value={(formData as any).brand} onChange={handleChange} />
            </div>
          )}

          {/* 3. INFO COMERCIAL */}
          {activeTab === 'com' && (
            <div className="space-y-6 md:space-y-8 animate-fade-in">
                
                {/* Precios Base */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <InputGroup label="Precio Venta ($)" name="price" type="number" placeholder="0.00" value={formData.price} onChange={handleChange} />
                    <InputGroup label="Costo (Referencia)" name="costPrice" type="number" placeholder="0.00" value={formData.costPrice} onChange={handleChange} />
                    <InputGroup label="Stock Total" name="stock" type="number" placeholder="0" value={formData.stock} onChange={handleChange} />
                </div>

                {/* Estrategia Mayoreo */}
                <div className="bg-indigo-50 p-4 md:p-6 rounded-xl border border-indigo-100">
                    <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2 text-sm">
                        <Tag size={18}/> Estrategia de Mayoreo
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                        <InputGroup label="ID de Grupo" name="groupId" placeholder="EJ. GELATINAS" value={formData.groupId} onChange={handleChange} />
                        <InputGroup label="Precio Mayoreo" name="wholesalePrice" type="number" placeholder="0.00" value={formData.wholesalePrice} onChange={handleChange} />
                        <InputGroup label="Cant. Mínima" name="wholesaleMin" type="number" placeholder="0" value={formData.wholesaleMin} onChange={handleChange} />
                    </div>
                </div>

                {/* Venta Suelta */}
                <div className="bg-purple-50 p-4 md:p-6 rounded-xl border border-purple-100">
                    <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2 text-sm">
                        <Plus size={18}/> Venta Suelta (Sub-unidades)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <InputGroup label="Contenido de la Unidad" name="contentPerUnit" type="number" placeholder="Ej. 20 (Cigarros)" value={formData.contentPerUnit} onChange={handleChange} />
                        <InputGroup label="Precio por Pieza Suelta" name="contentUnitPrice" type="number" placeholder="0.00" value={formData.contentUnitPrice} onChange={handleChange} />
                    </div>
                </div>

                {/* Presentación Básica / Medida */}
                <div className="bg-orange-50 p-4 md:p-6 rounded-xl border border-orange-100">
                    <h3 className="font-bold text-orange-900 mb-6 flex items-center gap-2 text-sm">
                        <Package size={18}/> Presentación Básica / Medida
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* Checkbox Báscula */}
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-orange-200 shadow-sm flex items-center justify-between h-full">
                            <div className="flex items-center gap-4">
                                <input 
                                    type="checkbox" 
                                    name="isWeighable" 
                                    checked={!!formData.isWeighable} 
                                    onChange={handleChange} 
                                    className="w-6 h-6 text-orange-600 rounded cursor-pointer border-gray-300 focus:ring-orange-500 shrink-0"
                                />
                                <div>
                                    <label className="block text-sm font-bold text-slate-800">Producto a Granel</label>
                                    <p className="text-xs text-slate-500 mt-0.5">Se vende por kilo/fracción.</p>
                                </div>
                            </div>
                            <Scale className="text-orange-400 shrink-0" size={28} />
                        </div>

                        {/* Inputs Paquete */}
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-orange-200 shadow-sm space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Contenido" name="packQuantity" type="number" placeholder="0" value={formData.packQuantity} onChange={handleChange} />
                                <InputGroup label="Precio Paquete" name="packPrice" type="number" placeholder="0.00" value={formData.packPrice} onChange={handleChange} />
                            </div>
                            <InputGroup label="Cód. Barras Caja" name="packBarcode" placeholder="Escanea código caja..." value={formData.packBarcode} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Múltiples Presentaciones */}
                <div className="bg-blue-50 p-4 md:p-6 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-blue-900 flex items-center gap-2 text-sm">
                            <Box size={18}/> Múltiples Presentaciones
                        </h3>
                        <button 
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, presentations: [...(p.presentations||[]), {id:crypto.randomUUID(), name:'', quantity:1, price:0, barcode:''}] }))} 
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-4 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                        >
                            <Plus size={16}/> <span className="hidden sm:inline">Agregar Variante</span>
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {formData.presentations?.map((pres, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-white p-3 md:p-4 rounded-lg border border-blue-200 shadow-sm">
                                <div className="w-full sm:flex-1">
                                    <label className="sm:hidden text-xs font-bold text-slate-500 mb-1 block">Nombre</label>
                                    <input value={pres.name} onChange={e => {const l=[...(formData.presentations||[])]; l[idx].name=e.target.value; setFormData(p=>({...p, presentations:l}))}} className="w-full p-2 border rounded text-sm outline-none focus:border-blue-500" placeholder="Ej. Media Caja"/>
                                </div>
                                <div className="flex w-full sm:w-auto gap-3">
                                    <div className="flex-1 sm:w-20">
                                        <label className="sm:hidden text-xs font-bold text-slate-500 mb-1 block">Cant.</label>
                                        <input type="number" value={pres.quantity} onChange={e => {const l=[...(formData.presentations||[])]; l[idx].quantity=+e.target.value; setFormData(p=>({...p, presentations:l}))}} className="w-full p-2 border rounded text-sm text-center outline-none focus:border-blue-500" placeholder="6"/>
                                    </div>
                                    <div className="flex-1 sm:w-24">
                                        <label className="sm:hidden text-xs font-bold text-slate-500 mb-1 block">Precio</label>
                                        <input type="number" value={pres.price} onChange={e => {const l=[...(formData.presentations||[])]; l[idx].price=+e.target.value; setFormData(p=>({...p, presentations:l}))}} className="w-full p-2 border rounded text-sm text-right font-bold text-blue-600 outline-none focus:border-blue-500" placeholder="0.00"/>
                                    </div>
                                    <button type="button" onClick={() => {const l=[...(formData.presentations||[])]; l.splice(idx,1); setFormData(p=>({...p, presentations:l}))}} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors self-end sm:self-center"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          )}

          {/* 4. IMPUESTOS */}
          {activeTab === 'tax' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-emerald-50 p-4 md:p-6 rounded-xl border border-emerald-100 flex items-start gap-4 shadow-sm">
                    <div className="p-3 bg-white rounded-full text-emerald-600 shadow-sm shrink-0"><Receipt size={24}/></div>
                    <div>
                        <h3 className="font-bold text-emerald-900 mb-1">Configuración Fiscal</h3>
                        <p className="text-sm text-emerald-700">El precio de venta base NO debe incluir impuestos.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {taxes.length === 0 ? (
                        <div className="col-span-full p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                            <Percent size={32} className="mx-auto text-slate-300 mb-2"/>
                            <p className="text-slate-500 font-medium">No hay impuestos configurados.</p>
                        </div>
                    ) : (
                        taxes.map(tax => (
                            <label key={tax.id} className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                formData.taxIds?.includes(tax.id) 
                                ? 'bg-emerald-50 border-emerald-500 shadow-md' 
                                : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                            }`}>
                                <div className="flex items-center h-5">
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                        checked={formData.taxIds?.includes(tax.id)}
                                        onChange={() => toggleTax(tax.id)}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-sm font-bold truncate mr-2 ${formData.taxIds?.includes(tax.id) ? 'text-emerald-900' : 'text-slate-700'}`}>{tax.name}</span>
                                        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">{tax.rate}%</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{tax.code || 'IMPUESTO'}</p>
                                </div>
                            </label>
                        ))
                    )}
                </div>
            </div>
          )}

          {activeTab === 'attr' && <ProductAttributesTab attributes={attributes} setAttributes={setAttributes} />}
          {activeTab === 'fitment' && <ProductFitmentTab productId={productToEdit?.id} fitments={fitments} setFitments={setFitments} />}

        </form>

        {/* FOOTER */}
        <div className="px-4 py-4 sm:px-8 sm:py-5 border-t border-slate-200 bg-white flex justify-end gap-3 sm:gap-4 shrink-0 z-20">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 sm:px-6 sm:py-2.5 text-slate-600 font-bold hover:text-slate-800 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            className="px-5 py-2 sm:px-8 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 text-sm"
          >
             {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} />} 
             {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};