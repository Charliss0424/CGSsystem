import React, { useState } from 'react';
import { X, Save, Zap } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const { addProduct } = useDatabase();
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    price: '',
    costPrice: '',
    stock: '',
    category: 'Otros'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await addProduct({
      name: formData.name,
      sku: formData.barcode || 'S/N', // Si es rápido, usamos el código como SKU temporal
      barcode: formData.barcode,
      price: parseFloat(formData.price) || 0,
      costPrice: parseFloat(formData.costPrice) || 0,
      stock: parseInt(formData.stock) || 0,
      category: formData.category,
      // Valores por defecto para lo que no pedimos
      image: '' 
    });

    setIsSubmitting(false);
    setFormData({ name: '', barcode: '', price: '', costPrice: '', stock: '', category: 'Otros' }); // Limpiar
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Verde */}
        <div className="bg-emerald-50 p-6 border-b border-emerald-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
            <div className="bg-emerald-200 p-1.5 rounded-lg"><Zap size={20} className="text-emerald-700"/></div>
            Alta Rápida
          </h2>
          <button onClick={onClose} className="text-emerald-600 hover:bg-emerald-100 p-1 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 mb-6 text-sm text-emerald-700 flex gap-2">
            <span>💡</span>
            <p>El <strong>Modo Rápido</strong> solo pide los datos esenciales para empezar a vender.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Código de Barras (Escaneable)</label>
              <input name="barcode" value={formData.barcode} onChange={handleChange} autoFocus className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Escanea aquí..." />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Producto</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. Coca Cola 600ml" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Precio Venta ($)</label>
                <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Costo ($) (Opcional)</label>
                <input type="number" step="0.01" name="costPrice" value={formData.costPrice} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none" placeholder="0.00" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Stock Inicial</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Categoría</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none bg-white">
                  <option value="Otros">Otros</option>
                  <option value="Abarrotes">Abarrotes</option>
                  <option value="Electrónica">Electrónica</option>
                  <option value="Ropa">Ropa</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-emerald-200">
                <Save size={18} /> {isSubmitting ? 'Guardando...' : 'Guardar Rápido'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};