import React, { useState } from 'react';
import { X, Save, User, MapPin, Tag, Loader2, Building2 } from 'lucide-react';
import { supabase } from '../services/supabase'; // Verifica que la ruta sea correcta

interface NewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

type TabType = 'basic' | 'address' | 'preferences';

export const NewSupplierModal: React.FC<NewSupplierModalProps> = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    phone: '',
    email: '',
    tax_id: '',
    address: '',
    category: '',
    credit_days: 0,
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Insertar en Supabase
      const { error } = await supabase.from('suppliers').insert([
        {
          name: formData.name,
          contact_name: formData.contact_name,
          phone: formData.phone,
          email: formData.email,
          tax_id: formData.tax_id,
          address: formData.address,
          category: formData.category,
          credit_days: formData.credit_days,
          // Si tienes columna 'notes' en la DB descomenta la siguiente línea, si no, guárdalo en otro lado o ignóralo
          // notes: formData.notes 
        }
      ]);

      if (error) throw error;

      // Éxito
      onSave(); // Recargar lista en el padre
      onClose(); // Cerrar modal
      
      // Resetear formulario
      setFormData({
        name: '', contact_name: '', phone: '', email: '', 
        tax_id: '', address: '', category: '', credit_days: 0, notes: ''
      });
      setActiveTab('basic');

    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      alert('Hubo un error al guardar el proveedor. Revisa la consola.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-5 flex justify-between items-center shrink-0 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Building2 size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800 leading-none">Nuevo Proveedor</h2>
                <p className="text-xs text-slate-500 mt-1">Alta de socio comercial</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* TABS (Navegación) */}
        <div className="flex border-b border-slate-200 px-5 shrink-0 bg-slate-50/50">
          <button 
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'basic' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
          >
            <User size={16} /> Información Básica
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('address')}
            className={`py-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'address' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
          >
            <MapPin size={16} /> Dirección
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'preferences' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
          >
            <Tag size={16} /> Configuración
          </button>
        </div>

        {/* BODY (Formulario) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
          <form id="supplier-form" onSubmit={handleSubmit}>
            
            {/* --- PESTAÑA 1: BÁSICA --- */}
            {activeTab === 'basic' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre de la Empresa / Razón Social *</label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    placeholder="Ej. Distribuidora de Bebidas S.A. de C.V."
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                    <input 
                      type="tel" 
                      placeholder="55 1234 5678"
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                    <input 
                      type="email" 
                      placeholder="contacto@proveedor.com"
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">RFC / ID Fiscal</label>
                        <input 
                            type="text" 
                            placeholder="XAXX010101000"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 uppercase"
                            value={formData.tax_id}
                            onChange={e => setFormData({...formData, tax_id: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Persona de Contacto</label>
                        <input 
                            type="text" 
                            placeholder="Ej. Roberto Gómez"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                            value={formData.contact_name}
                            onChange={e => setFormData({...formData, contact_name: e.target.value})}
                        />
                    </div>
                </div>
              </div>
            )}

            {/* --- PESTAÑA 2: DIRECCIÓN --- */}
            {activeTab === 'address' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Dirección Fiscal / Entrega</label>
                  <textarea 
                    placeholder="Calle, Número, Colonia, Ciudad, Código Postal..."
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 h-32 resize-none"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  ></textarea>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                    <MapPin className="text-blue-500 shrink-0" size={20} />
                    <p className="text-xs text-blue-700">Esta dirección se utilizará para generar las Órdenes de Compra y fichas de recepción.</p>
                </div>
              </div>
            )}

            {/* --- PESTAÑA 3: CONFIGURACIÓN --- */}
            {activeTab === 'preferences' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría / Rubro</label>
                        <select 
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 bg-white"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Abarrotes">Abarrotes</option>
                            <option value="Bebidas">Bebidas</option>
                            <option value="Limpieza">Limpieza</option>
                            <option value="Lácteos">Lácteos</option>
                            <option value="Carnes">Carnes / Embutidos</option>
                            <option value="Electrónica">Electrónica</option>
                            <option value="Servicios">Servicios (Luz, Agua, etc)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Días de Crédito</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                min="0"
                                placeholder="0"
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                                value={formData.credit_days}
                                onChange={e => setFormData({...formData, credit_days: parseInt(e.target.value) || 0})}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">días</span>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas Internas</label>
                     <textarea 
                        placeholder="Ej. Entregan solo los días Jueves. Requieren pago por transferencia..."
                        className="w-full p-2 bg-transparent border-none outline-none text-slate-600 text-sm h-16 resize-none"
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                    ></textarea>
                </div>

              </div>
            )}

          </form>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-lg font-bold transition-colors text-sm"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="supplier-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-transform active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSubmitting ? 'Guardando...' : 'Guardar Proveedor'}
          </button>
        </div>

      </div>
    </div>
  );
};