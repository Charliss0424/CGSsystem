import React, { useState, useEffect } from 'react';
import { 
  X, Save, Info, Tag, Layers, DollarSign, PlusCircle, Package, Scale, 
  Box, Plus, Trash2, Image as ImageIcon, Car, Loader2, AlertTriangle
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Product } from '../types';
import { supabase } from '../services/supabase';

// ==========================================
// COMPONENTES AUXILIARES (Pestañas Especializadas)
// ==========================================

// 1. Pestaña de Autos (Refaccionaria)
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
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3 text-xs text-blue-700 items-center"><Car size={18}/><span>Asigna vehículos compatibles.</span></div>
        <div className="grid grid-cols-12 gap-2 bg-slate-50 p-2 rounded border">
            <input className="col-span-3 p-2 border rounded text-xs" placeholder="Marca" value={newFit.make} onChange={e=>setNewFit({...newFit, make: e.target.value})}/>
            <input className="col-span-3 p-2 border rounded text-xs" placeholder="Modelo" value={newFit.model} onChange={e=>setNewFit({...newFit, model: e.target.value})}/>
            <input type="number" className="col-span-2 p-2 border rounded text-xs" placeholder="Inicio" value={newFit.year_start} onChange={e=>setNewFit({...newFit, year_start: +e.target.value})}/>
            <input type="number" className="col-span-2 p-2 border rounded text-xs" placeholder="Fin" value={newFit.year_end} onChange={e=>setNewFit({...newFit, year_end: +e.target.value})}/>
            <button onClick={add} className="col-span-2 bg-blue-600 text-white rounded font-bold"><Plus size={16} className="mx-auto"/></button>
        </div>
        <div className="max-h-40 overflow-y-auto border rounded">
            {fitments.map((f: any, i: number) => (
                <div key={i} className="flex justify-between p-2 border-b text-xs hover:bg-slate-50">
                    <span>{f.make} {f.model} ({f.year_start}-{f.year_end})</span>
                    <button onClick={()=>remove(f.id)} className="text-red-500"><Trash2 size={14}/></button>
                </div>
            ))}
        </div>
    </div>
  );
};

// 2. Pestaña de Atributos (Ferretería)
const ProductAttributesTab = ({ attributes, setAttributes }: any) => {
  const [k, setK] = useState(''); const [v, setV] = useState('');
  const add = () => { if(k && v) { setAttributes({...attributes, [k]: v}); setK(''); setV(''); } };
  return (
    <div className="space-y-4 animate-in fade-in">
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex gap-3 text-xs text-orange-700 items-center"><Layers size={18}/><span>Especificaciones técnicas (Medida, Material).</span></div>
        <div className="flex gap-2 bg-slate-50 p-2 rounded border">
            <input className="flex-1 p-2 border rounded text-xs" placeholder="Atributo (Ej. Medida)" value={k} onChange={e=>setK(e.target.value)}/>
            <input className="flex-1 p-2 border rounded text-xs" placeholder="Valor (Ej. 1/2 Pulgada)" value={v} onChange={e=>setV(e.target.value)}/>
            <button onClick={add} className="bg-orange-500 text-white px-4 rounded"><Plus size={16}/></button>
        </div>
        <div className="grid grid-cols-2 gap-2">
            {Object.entries(attributes).map(([key, val]: any) => (
                <div key={key} className="flex justify-between p-2 border rounded text-xs bg-white">
                    <span className="font-bold text-slate-500">{key}: <span className="text-slate-800 font-normal">{val}</span></span>
                    <button onClick={()=>{ const n={...attributes}; delete n[key]; setAttributes(n); }} className="text-red-400"><Trash2 size={14}/></button>
                </div>
            ))}
        </div>
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

interface FullProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const FullProductModal: React.FC<FullProductModalProps> = ({ isOpen, onClose, productToEdit }) => {
  const { addProduct, updateProduct, categories, addCategory } = useDatabase();
  
  const [activeTab, setActiveTab] = useState<'info' | 'cat' | 'attr' | 'fitment' | 'com'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados complejos
  const [fitments, setFitments] = useState<any[]>([]); 
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  
  // Estado para actualización masiva (Gelatinas)
  const [applyToGroup, setApplyToGroup] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', sku: '', barcode: '', category: 'General',
    price: 0, costPrice: 0, stock: 0, image: '',
    groupId: '', wholesalePrice: 0, wholesaleMin: 0,
    isWeighable: false, packPrice: 0, packQuantity: 0, packBarcode: '',
    contentPerUnit: 0, contentUnitPrice: 0,
    presentations: []
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        ...productToEdit,
        presentations: productToEdit.presentations || [],
        contentPerUnit: productToEdit.contentPerUnit || 0,
        contentUnitPrice: productToEdit.contentUnitPrice || 0,
        image: productToEdit.image || ''
      });
      // @ts-ignore
      setAttributes(productToEdit.attributes || {});
      setFitments([]);
      setApplyToGroup(false);
    } else {
      setFormData({
        name: '', sku: '', barcode: '', price: 0, costPrice: 0, stock: 0, category: 'General', image: '',
        groupId: '', wholesalePrice: 0, wholesaleMin: 0,
        isWeighable: false, packPrice: 0, packQuantity: 0, packBarcode: '',
        contentPerUnit: 0, contentUnitPrice: 0, presentations: []
      });
      setAttributes({});
      setFitments([]);
    }
    setActiveTab('info');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsSubmitting(true);
    try {
      const finalProduct = { ...formData, attributes };
      
      if (productToEdit?.id) {
          // Lógica de "Gelatinas": Si el usuario marcó el checkbox, actualizamos todo el grupo
          if (applyToGroup && formData.groupId) {
             // 1. Actualizamos el producto actual
             await updateProduct(finalProduct as Product);
             // 2. Actualizamos el resto del grupo (Backend Logic manual aquí o en context)
             await supabase.from('products')
               .update({ 
                   price: formData.price, 
                   costPrice: formData.costPrice,
                   wholesalePrice: formData.wholesalePrice,
                   wholesaleMin: formData.wholesaleMin
               })
               .eq('groupId', formData.groupId)
               .neq('id', productToEdit.id); // No volver a actualizar el actual
             
             alert(`Se actualizaron los precios de todo el grupo: ${formData.groupId}`);
          } else {
             await updateProduct(finalProduct as Product);
          }
      } else {
          // Crear nuevo
          const { data, error } = await supabase.from('products').insert([finalProduct]).select().single();
          if (error) throw error;
          if (data && fitments.length > 0) {
             const fits = fitments.map(f => ({ ...f, product_id: data.id, id: undefined }));
             await supabase.from('product_fitment').insert(fits);
          }
      }
      onClose();
    } catch(e) { console.error(e); alert('Error al guardar.'); } 
    finally { setIsSubmitting(false); }
  };

  // --- RENDERS AUXILIARES PARA UI LIMPIA ---
  const InputGroup = ({ label, name, type="text", placeholder="" }: any) => (
    <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
        <input 
            type={type} name={name} value={(formData as any)[name]} 
            onChange={handleChange} placeholder={placeholder}
            onFocus={(e) => e.target.select()}
            className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
        />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800">{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-200 p-2 rounded-full"><X size={24} /></button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 px-6 overflow-x-auto bg-white">
          {[
            { id: 'info', label: 'Información Básica', icon: Info },
            { id: 'cat', label: 'Categorización', icon: Tag },
            { id: 'attr', label: 'Atributos', icon: Layers },
            { id: 'com', label: 'Info Comercial', icon: DollarSign }, // Tu pestaña importante
            { id: 'fitment', label: 'Compatibilidad', icon: Car },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 bg-white">
          
          {/* 1. INFO BÁSICA */}
          {activeTab === 'info' && (
            <div className="flex flex-col md:flex-row gap-6 animate-in fade-in">
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Imagen</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl h-48 flex items-center justify-center bg-slate-50 relative cursor-pointer hover:border-blue-500">
                        {formData.image ? <img src={formData.image} className="w-full h-full object-contain p-2"/> : <ImageIcon size={32} className="text-slate-300"/>}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                            const file = e.target.files?.[0]; if(!file) return;
                            setIsUploading(true);
                            const name = `${Date.now()}.${file.name.split('.').pop()}`;
                            await supabase.storage.from('product-images').upload(name, file);
                            const { data } = supabase.storage.from('product-images').getPublicUrl(name);
                            setFormData(p => ({ ...p, image: data.publicUrl }));
                            setIsUploading(false);
                        }}/>
                        {isUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">Cargando...</div>}
                    </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4 content-start">
                    <InputGroup label="SKU (Interno)" name="sku" />
                    <InputGroup label="Código de Barras" name="barcode" />
                    <div className="col-span-2"><InputGroup label="Nombre del Producto" name="name" /></div>
                    <div className="col-span-2"><InputGroup label="Descripción Corta" name="shortDescription" placeholder="Resumen para ticket" /></div>
                </div>
            </div>
          )}

          {/* 2. CATEGORIZACIÓN */}
          {activeTab === 'cat' && (
            <div className="grid grid-cols-2 gap-6 animate-in fade-in">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Categoría</label>
                    <div className="flex gap-2">
                        <select name="category" value={formData.category} onChange={handleChange} className="flex-1 p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="General">General</option>
                            {categories?.map((c:any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <button type="button" onClick={()=>{ const c=prompt("Categoría:"); if(c) { addCategory(c); setFormData(p=>({...p, category:c})) } }} className="p-2 bg-blue-100 text-blue-600 rounded"><PlusCircle size={20}/></button>
                    </div>
                </div>
                <InputGroup label="Marca" name="brand" />
            </div>
          )}

          {/* 3. INFO COMERCIAL (AQUÍ ESTÁ LO QUE PEDISTE RECUPERAR) */}
          {activeTab === 'com' && (
            <div className="space-y-6 animate-in fade-in">
                
                {/* PRECIOS BASE */}
                <div className="grid grid-cols-3 gap-6">
                    <InputGroup label="Precio Venta (Unitario)" name="price" type="number" />
                    <InputGroup label="Costo (Referencia)" name="costPrice" type="number" />
                    <InputGroup label="Stock Total" name="stock" type="number" />
                </div>

                {/* ESTRATEGIA MAYOREO (CON CHECKBOX DE GELATINAS) */}
                <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                    <h3 className="font-bold text-indigo-800 mb-2 flex items-center gap-2"><Tag size={18}/> Estrategia de Mayoreo</h3>
                    <div className="grid grid-cols-3 gap-6">
                        <InputGroup label="ID de Grupo" name="groupId" placeholder="EJ. GELATINAS" />
                        <InputGroup label="Precio Mayoreo" name="wholesalePrice" type="number" placeholder="0.00" />
                        <InputGroup label="Cant. Mínima" name="wholesaleMin" type="number" placeholder="Ej. 3" />
                    </div>
                    {/* CHECKBOX MÁGICO PARA CAMBIO MASIVO */}
                    {productToEdit && formData.groupId && (
                        <div className="mt-3 flex items-center gap-2 bg-white p-2 rounded border border-indigo-200">
                            <input type="checkbox" id="massUpdate" checked={applyToGroup} onChange={e => setApplyToGroup(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                            <label htmlFor="massUpdate" className="text-xs font-bold text-indigo-700 cursor-pointer select-none">
                                Actualizar precio a TODO el grupo <span className="uppercase">"{formData.groupId}"</span> (Sabores/Variantes)
                            </label>
                        </div>
                    )}
                </div>

                {/* VENTA SUELTA (CIGARROS) */}
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                    <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2"><Plus size={18}/> Venta Suelta (Sub-unidades)</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Contenido de la Unidad" name="contentPerUnit" type="number" placeholder="Ej. 20 (Cigarros)" />
                        <InputGroup label="Precio por Pieza Suelta" name="contentUnitPrice" type="number" placeholder="$0.00" />
                    </div>
                </div>

                {/* PRESENTACIÓN BÁSICA / MEDIDA (A GRANEL) */}
                <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                    <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2"><Package size={18}/> Presentación Básica / Medida</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-orange-200 shadow-sm">
                            <input type="checkbox" name="isWeighable" checked={!!formData.isWeighable} onChange={handleChange} className="w-5 h-5 text-orange-600 rounded cursor-pointer"/>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-slate-700">Producto a Granel (Báscula)</label>
                                <p className="text-[10px] text-slate-500">Se vende por kilo/fracción.</p>
                            </div>
                            <Scale className="text-orange-400" size={24} />
                        </div>
                        <div className="space-y-3 p-3 bg-white border border-orange-200 rounded-lg shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <InputGroup label="Contenido" name="packQuantity" type="number" placeholder="Ej. 12" />
                                <InputGroup label="Precio Paquete" name="packPrice" type="number" placeholder="$0.00" />
                            </div>
                            <InputGroup label="Cód. Barras Caja" name="packBarcode" placeholder="Escanea código caja..." />
                        </div>
                    </div>
                </div>

                {/* MÚLTIPLES PRESENTACIONES */}
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-blue-800 flex items-center gap-2"><Box size={18}/> Múltiples Presentaciones</h3>
                        <button type="button" onClick={() => setFormData(p => ({ ...p, presentations: [...(p.presentations||[]), {id:crypto.randomUUID(), name:'', quantity:1, price:0, barcode:''}] }))} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"><Plus size={14}/> Agregar Variante</button>
                    </div>
                    <div className="space-y-2">
                        {formData.presentations?.map((pres, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-blue-200 shadow-sm">
                                <input value={pres.name} onChange={e => {const l=[...(formData.presentations||[])]; l[idx].name=e.target.value; setFormData(p=>({...p, presentations:l}))}} className="flex-1 p-1 text-sm border rounded" placeholder="Nombre (Ej. Caja)"/>
                                <input type="number" value={pres.quantity} onChange={e => {const l=[...(formData.presentations||[])]; l[idx].quantity=+e.target.value; setFormData(p=>({...p, presentations:l}))}} className="w-16 p-1 text-sm border rounded text-center" placeholder="Cant."/>
                                <input type="number" value={pres.price} onChange={e => {const l=[...(formData.presentations||[])]; l[idx].price=+e.target.value; setFormData(p=>({...p, presentations:l}))}} className="w-20 p-1 text-sm border rounded text-right font-bold text-blue-600" placeholder="$"/>
                                <button type="button" onClick={() => {const l=[...(formData.presentations||[])]; l.splice(idx,1); setFormData(p=>({...p, presentations:l}))}} className="text-red-400"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'attr' && <ProductAttributesTab attributes={attributes} setAttributes={setAttributes} />}
          {activeTab === 'fitment' && <ProductFitmentTab productId={productToEdit?.id} fitments={fitments} setFitments={setFitments} />}

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