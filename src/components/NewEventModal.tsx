import React, { useState } from 'react';
import { X, Save, Calendar, Clock } from 'lucide-react';
import { supabase } from '../services/supabase';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    start_date: new Date().toISOString().split('T')[0], // Hoy
    time: '12:00',
    type: 'reminder',
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Combinar fecha y hora para Timestamp
    const fullDate = new Date(`${formData.start_date}T${formData.time}:00`);

    try {
      const { error } = await supabase.from('calendar_events').insert([{
        title: formData.title,
        start_date: fullDate.toISOString(),
        type: formData.type,
        description: formData.description
      }]);

      if (error) throw error;
      onSave();
      onClose();
      setFormData({ title: '', start_date: new Date().toISOString().split('T')[0], time: '12:00', type: 'reminder', description: '' });
    } catch (error) {
      console.error(error);
      alert('Error al guardar evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Nuevo Recordatorio</h2>
          <button onClick={onClose}><X className="text-slate-400 hover:text-red-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título</label>
            <input type="text" required className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ej. Pagar la Luz" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
              <input type="date" required className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora</label>
              <input type="time" required className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
             <div className="flex gap-2">
                {['reminder', 'meeting'].map(type => (
                  <button type="button" key={type} 
                    onClick={() => setFormData({...formData, type})}
                    className={`flex-1 py-2 text-sm rounded-lg border ${formData.type === type ? 'bg-blue-100 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600'}`}>
                    {type === 'reminder' ? 'Recordatorio' : 'Reunión'}
                  </button>
                ))}
             </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold mt-2 flex justify-center items-center gap-2">
            <Save size={18} /> {loading ? 'Guardando...' : 'Agendar Evento'}
          </button>
        </form>
      </div>
    </div>
  );
};