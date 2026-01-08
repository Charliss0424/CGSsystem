import React, { useState } from 'react';
import { X, Save, DollarSign, Calendar, Tag, AlignLeft, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({ isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0], // Hoy por defecto
    category: 'Servicios',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('expenses').insert([
        {
          title: formData.title,
          amount: parseFloat(formData.amount),
          due_date: formData.due_date,
          category: formData.category,
          notes: formData.notes,
          status: 'pending' // Por defecto entra como pendiente de pago
        }
      ]);

      if (error) throw error;

      onSave(); // Recargar calendario
      onClose();
      // Resetear form
      setFormData({
        title: '', amount: '', due_date: new Date().toISOString().split('T')[0], category: 'Servicios', notes: ''
      });

    } catch (error) {
      console.error('Error al guardar gasto:', error);
      alert('Error al guardar el gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        <div className="bg-purple-50 p-4 border-b border-purple-100 flex justify-between items-center">
          <h2 className="font-bold text-lg text-purple-900 flex items-center gap-2">
            <DollarSign size={20} /> Registrar Gasto
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Concepto</label>
            <input 
              type="text" required autoFocus
              placeholder="Ej. Pago de Luz CFE"
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-700"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Monto</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input 
                    type="number" step="0.01" required min="0"
                    placeholder="0.00"
                    className="w-full p-2 pl-7 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-700 font-bold"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Vencimiento</label>
                <input 
                  type="date" required
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-700"
                  value={formData.due_date}
                  onChange={e => setFormData({...formData, due_date: e.target.value})}
                />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría</label>
            <select 
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-700 bg-white"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
                <option value="Servicios">Servicios (Luz, Agua, Internet)</option>
                <option value="Renta">Renta / Alquiler</option>
                <option value="Nomina">Nómina / Salarios</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Impuestos">Impuestos</option>
                <option value="Otros">Otros</option>
            </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas (Opcional)</label>
             <textarea 
               className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-700 resize-none h-20 text-sm"
               placeholder="Detalles adicionales..."
               value={formData.notes}
               onChange={e => setFormData({...formData, notes: e.target.value})}
             ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {loading ? 'Guardando...' : 'Agendar Gasto'}
          </button>

        </form>
      </div>
    </div>
  );
};