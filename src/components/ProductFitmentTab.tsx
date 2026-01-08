import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Car, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface ProductFitmentTabProps {
  productId?: string; // Si es edición, necesitamos el ID
  tempFitments: any[]; // Para productos nuevos que aun no tienen ID
  setTempFitments: (data: any[]) => void;
}

export const ProductFitmentTab: React.FC<ProductFitmentTabProps> = ({ productId, tempFitments, setTempFitments }) => {
  const [fitments, setFitments] = useState<any[]>([]);
  const [newFitment, setNewFitment] = useState({ make: '', model: '', year_start: 2024, year_end: 2024, engine: '' });
  const [loading, setLoading] = useState(false);

  // Cargar compatibilidades si editamos un producto existente
  useEffect(() => {
    if (productId) {
      loadFitments();
    } else {
      setFitments(tempFitments);
    }
  }, [productId]);

  const loadFitments = async () => {
    const { data } = await supabase.from('product_fitment').select('*').eq('product_id', productId);
    if (data) setFitments(data);
  };

  const handleAdd = async () => {
    if (!newFitment.make || !newFitment.model) return alert("Marca y Modelo requeridos");

    if (productId) {
      // Guardar directo en BD si el producto ya existe
      setLoading(true);
      await supabase.from('product_fitment').insert([{ ...newFitment, product_id: productId }]);
      await loadFitments();
      setLoading(false);
    } else {
      // Guardar en memoria si es producto nuevo
      const newItem = { ...newFitment, id: Date.now() }; // ID temporal
      setTempFitments([...tempFitments, newItem]);
      setFitments([...fitments, newItem]);
    }
    // Limpiar campos parciales
    setNewFitment({ ...newFitment, model: '', engine: '' }); 
  };

  const handleDelete = async (id: string | number) => {
    if (productId) {
      await supabase.from('product_fitment').delete().eq('id', id);
      loadFitments();
    } else {
      const filtered = tempFitments.filter(f => f.id !== id);
      setTempFitments(filtered);
      setFitments(filtered);
    }
  };

  return (
    <div className="space-y-4 p-1">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3 items-start">
         <Car className="text-blue-500 shrink-0 mt-1" size={18} />
         <div>
            <p className="text-sm font-bold text-blue-800">Compatibilidad de Vehículos</p>
            <p className="text-xs text-blue-600">Define a qué vehículos le queda esta refacción para facilitar la búsqueda.</p>
         </div>
      </div>

      {/* Inputs de Agregar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="md:col-span-3">
           <label className="text-[10px] font-bold text-slate-500 uppercase">Marca</label>
           <input type="text" placeholder="Nissan" className="w-full p-2 border rounded text-sm outline-none focus:border-blue-500"
             value={newFitment.make} onChange={e => setNewFitment({...newFitment, make: e.target.value})} />
        </div>
        <div className="md:col-span-3">
           <label className="text-[10px] font-bold text-slate-500 uppercase">Modelo</label>
           <input type="text" placeholder="Tsuru" className="w-full p-2 border rounded text-sm outline-none focus:border-blue-500"
             value={newFitment.model} onChange={e => setNewFitment({...newFitment, model: e.target.value})} />
        </div>
        <div className="md:col-span-2">
           <label className="text-[10px] font-bold text-slate-500 uppercase">Año Inicio</label>
           <input type="number" className="w-full p-2 border rounded text-sm outline-none focus:border-blue-500"
             value={newFitment.year_start} onChange={e => setNewFitment({...newFitment, year_start: parseInt(e.target.value)})} />
        </div>
        <div className="md:col-span-2">
           <label className="text-[10px] font-bold text-slate-500 uppercase">Año Fin</label>
           <input type="number" className="w-full p-2 border rounded text-sm outline-none focus:border-blue-500"
             value={newFitment.year_end} onChange={e => setNewFitment({...newFitment, year_end: parseInt(e.target.value)})} />
        </div>
        <div className="md:col-span-2">
           <button onClick={handleAdd} disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded text-sm font-bold flex justify-center items-center gap-1 hover:bg-blue-700 transition-colors">
             <Plus size={16} /> Agregar
           </button>
        </div>
      </div>

      {/* Lista */}
      <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-600 font-bold text-xs uppercase sticky top-0">
            <tr>
              <th className="p-3">Vehículo</th>
              <th className="p-3">Años</th>
              <th className="p-3">Motor</th>
              <th className="p-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fitments.length === 0 ? (
               <tr><td colSpan={4} className="p-6 text-center text-slate-400 text-xs">No hay vehículos asignados</td></tr>
            ) : (
               fitments.map((fit, idx) => (
                 <tr key={idx} className="hover:bg-slate-50">
                   <td className="p-3 font-medium text-slate-700">{fit.make} {fit.model}</td>
                   <td className="p-3 text-slate-500">{fit.year_start} - {fit.year_end}</td>
                   <td className="p-3 text-slate-500">{fit.engine || '-'}</td>
                   <td className="p-3 text-right">
                     <button onClick={() => handleDelete(fit.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                   </td>
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};