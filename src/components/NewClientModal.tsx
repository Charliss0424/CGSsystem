import React, { useState } from 'react';
import { X, Save, User, MapPin, Tag } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose }) => {
  const { addClient } = useDatabase();
  const [activeTab, setActiveTab] = useState<'info' | 'address' | 'prefs'>('info');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    rfc: '',
    // Preferencias
    contactMethod: 'Correo electrónico',
    acceptsMarketing: false,
    tags: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("El nombre es obligatorio");

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);

    await addClient({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        creditLimit: 0,
        currentBalance: 0,
        tags: tagsArray
    });
    
    alert("Cliente registrado exitosamente");
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in zoom-in-95">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Nuevo cliente</h2>
          <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 border-b border-slate-100 gap-8">
            <button onClick={() => setActiveTab('info')} className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><User size={18}/> Información básica</button>
            <button onClick={() => setActiveTab('address')} className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'address' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><MapPin size={18}/> Dirección</button>
            <button onClick={() => setActiveTab('prefs')} className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'prefs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><Tag size={18}/> Preferencias</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 flex-1 overflow-y-auto bg-white">
            
            {activeTab === 'info' && (
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Completo *</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all" placeholder="Ej. Juan Pérez" autoFocus/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono / Celular</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all" placeholder="55 1234 5678"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Correo electrónico</label>
                        <input name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all" placeholder="cliente@email.com"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">RFC / ID Fiscal</label>
                        <input name="rfc" value={formData.rfc} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all" placeholder="Opcional"/>
                    </div>
                </div>
            )}

            {activeTab === 'address' && (
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Dirección Completa</label>
                        <textarea name="address" rows={4} value={formData.address} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all" placeholder="Calle, Número, Colonia, Ciudad..."/>
                    </div>
                </div>
            )}

            {activeTab === 'prefs' && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Método de contacto preferido</label>
                        <select name="contactMethod" value={formData.contactMethod} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Correo electrónico</option>
                            <option>WhatsApp</option>
                            <option>Llamada telefónica</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <input type="checkbox" name="acceptsMarketing" checked={formData.acceptsMarketing} onChange={handleChange} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"/>
                        <label className="text-sm text-slate-600">Acepta recibir comunicaciones de marketing</label>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Etiquetas</label>
                        <input name="tags" value={formData.tags} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="Separar con comas (ej: frecuente, vip, crédito)"/>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Notas</label>
                        <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="Información adicional sobre el cliente..."/>
                    </div>
                </div>
            )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition-colors">Cancelar</button>
            <button onClick={handleSubmit} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200">
                <Save size={18}/> Crear cliente
            </button>
        </div>
      </div>
    </div>
  );
};