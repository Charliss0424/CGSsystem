import React, { useState, useEffect } from 'react';
import { 
  X, Save, MapPin, Building2, Store, User, 
  CreditCard, Tag, Layers, FileText, ChevronDown 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Client } from '../types';
import { useDatabase } from '../context/DatabaseContext';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
}

// Definimos las pestañas
type TabType = 'basica' | 'direccion' | 'configuracion' | 'sucursales';

// Interfaces de datos
interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  rfc: string;
  // Dirección
  street: string;
  exteriorNumber: string;
  interiorNumber: string;
  colony: string;
  city: string;
  state: string;
  postalCode: string;
  reference: string;
  // Configuración
  creditLimit: number;
  paymentDays: number;
  level: string;
}

interface BranchFormData {
  tempId: number;
  name: string;
  phone: string;
  fullAddress: string;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose, clientToEdit }) => {
  const { addClient, clients } = useDatabase();
  const [activeTab, setActiveTab] = useState<TabType>('basica');
  const [loading, setLoading] = useState(false);

  // --- ESTADOS ---
  const [formData, setFormData] = useState<ClientFormData>({
    name: '', phone: '', email: '', rfc: '',
    street: '', exteriorNumber: '', interiorNumber: '', colony: '', city: '', state: '', postalCode: '', reference: '',
    creditLimit: 0, paymentDays: 0, level: 'PUBLICO'
  });

  const [isBranch, setIsBranch] = useState(false);
  const [parentId, setParentId] = useState<string>('');
  
  // Sucursales (cuando damos de alta una Matriz)
  const [branches, setBranches] = useState<BranchFormData[]>([]);
  const [newBranch, setNewBranch] = useState({ name: '', phone: '', address: '' });

  // --- CARGA DE DATOS (EDICIÓN) ---
  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        name: clientToEdit.name,
        phone: clientToEdit.phone || '',
        email: clientToEdit.email || '',
        rfc: clientToEdit.rfc || '',
        street: clientToEdit.street || '',
        exteriorNumber: clientToEdit.exteriorNumber || '',
        interiorNumber: clientToEdit.interiorNumber || '',
        colony: clientToEdit.colony || '',
        city: clientToEdit.city || '',
        state: clientToEdit.state || '',
        postalCode: clientToEdit.postalCode || '',
        reference: clientToEdit.notes || '',
        creditLimit: clientToEdit.creditLimit || 0,
        paymentDays: clientToEdit.paymentDays || 0,
        level: clientToEdit.level || 'PUBLICO'
      });

      if (clientToEdit.parent_id) {
        setIsBranch(true);
        setParentId(clientToEdit.parent_id);
      } else {
        setIsBranch(false);
        setParentId('');
      }
    } else {
      resetForm();
    }
  }, [clientToEdit, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '', phone: '', email: '', rfc: '',
      street: '', exteriorNumber: '', interiorNumber: '', colony: '', city: '', state: '', postalCode: '', reference: '',
      creditLimit: 0, paymentDays: 0, level: 'PUBLICO'
    });
    setBranches([]);
    setIsBranch(false);
    setParentId('');
    setActiveTab('basica');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creditLimit' || name === 'paymentDays' ? parseFloat(value) || 0 : value.toUpperCase()
    }));
  };

  // --- LÓGICA SUCURSALES (Agregar a la lista temporal) ---
  const handleAddBranch = () => {
    if (!newBranch.name) return Swal.fire('Atención', 'El nombre de la sucursal es requerido', 'warning');
    setBranches(prev => [...prev, {
      tempId: Date.now(),
      name: newBranch.name.toUpperCase(),
      phone: newBranch.phone,
      fullAddress: newBranch.address.toUpperCase()
    }]);
    setNewBranch({ name: '', phone: '', address: '' });
  };

  const handleRemoveBranch = (id: number) => {
    setBranches(prev => prev.filter(b => b.tempId !== id));
  };

  // --- GUARDAR ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return Swal.fire('Error', 'El nombre del cliente es obligatorio', 'error');
    if (isBranch && !parentId) return Swal.fire('Error', 'Debes seleccionar una Matriz', 'error');

    setLoading(true);
    try {
      const parentData = {
        ...formData,
        address: `${formData.street} ${formData.exteriorNumber}, ${formData.colony}`,
        notes: formData.reference,
        parent_id: isBranch ? parentId : null
      };

      const success = await addClient(parentData);

      if (success) {
        if (!isBranch && branches.length > 0) {
           for (const b of branches) {
             await addClient({
               name: b.name,
               phone: b.phone,
               address: b.fullAddress,
               email: '',
               creditLimit: 0, paymentDays: 0, currentBalance: 0,
               parent_id: null // Aquí iría el ID del padre si el backend lo devolviera
             });
           }
        }
        Swal.fire('Guardado', 'Cliente registrado correctamente', 'success');
        onClose();
        resetForm();
      } else {
        Swal.fire('Error', 'No se pudo guardar el cliente', 'error');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtramos clientes para el dropdown de matriz (solo matrices)
  const potentialParents = clients.filter(c => !c.parent_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-scale-up">
        
        {/* --- HEADER (Estilo Imagen) --- */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white">
          <div className="flex gap-4 items-center">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Building2 size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <p className="text-sm text-gray-500 font-medium">Registro y configuración general</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- TABS (Estilo Imagen) --- */}
        <div className="px-8 border-b border-gray-200 flex gap-8">
          {[
            { id: 'basica', label: 'Información Básica', icon: User },
            { id: 'direccion', label: 'Dirección', icon: MapPin },
            { id: 'configuracion', label: 'Configuración', icon: Tag },
            { id: 'sucursales', label: `Sucursales (${branches.length})`, icon: Layers, hidden: isBranch }
          ].map((tab) => (
            !tab.hidden && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`pb-4 pt-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            )
          ))}
        </div>

        {/* --- BODY (Formulario) --- */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          
          {/* TAB 1: INFORMACIÓN BÁSICA */}
          {activeTab === 'basica' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Switch Matriz / Sucursal */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isBranch ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                    {isBranch ? <Store size={20} /> : <Building2 size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Tipo de Cuenta</p>
                    <p className="text-xs text-gray-500">{isBranch ? 'Es una sucursal dependiente' : 'Es una cuenta principal (Matriz)'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${!isBranch ? 'text-blue-600' : 'text-gray-400'}`}>MATRIZ</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isBranch} onChange={e => setIsBranch(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                  <span className={`text-xs font-bold ${isBranch ? 'text-indigo-600' : 'text-gray-400'}`}>SUCURSAL</span>
                </div>
              </div>

              {/* Campos Principales */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nombre de la Empresa / Razón Social *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 placeholder-gray-400 transition-all uppercase"
                    placeholder="Ej. DISTRIBUIDORA DEL NORTE S.A. DE C.V."
                    autoFocus
                  />
                </div>

                {isBranch && (
                  <div className="animate-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-indigo-600 uppercase mb-1.5">Pertenece a (Matriz) *</label>
                    <div className="relative">
                      <select
                        value={parentId}
                        onChange={e => setParentId(e.target.value)}
                        className="w-full px-4 py-2.5 border border-indigo-200 bg-indigo-50/50 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 appearance-none cursor-pointer"
                      >
                        <option value="">-- Seleccionar --</option>
                        {potentialParents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 text-indigo-400 pointer-events-none" size={16}/>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Teléfono</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                      placeholder="55 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Correo Electrónico</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 lowercase"
                      placeholder="contacto@cliente.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">RFC / ID Fiscal</label>
                  <input
                    type="text"
                    name="rfc"
                    value={formData.rfc}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 uppercase"
                    placeholder="XAXX010101000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECCIÓN */}
          {activeTab === 'direccion' && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-6 gap-5">
                <div className="col-span-6 md:col-span-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Calle</label>
                  <input type="text" name="street" value={formData.street} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 uppercase" placeholder="AV. REFORMA" />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">No. Ext</label>
                  <input type="text" name="exteriorNumber" value={formData.exteriorNumber} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700" placeholder="100" />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">No. Int</label>
                  <input type="text" name="interiorNumber" value={formData.interiorNumber} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700" placeholder="B" />
                </div>

                <div className="col-span-6 md:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Colonia</label>
                  <input type="text" name="colony" value={formData.colony} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 uppercase" placeholder="CENTRO" />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Ciudad / Municipio</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 uppercase" placeholder="CIUDAD DE MÉXICO" />
                </div>

                <div className="col-span-3 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Estado</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 uppercase" placeholder="CDMX" />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Código Postal</label>
                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700" placeholder="00000" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Referencias de Entrega</label>
                <textarea rows={2} name="reference" value={formData.reference} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 text-sm" placeholder="Ej. Frente a la escuela, portón negro..." />
              </div>
            </div>
          )}

          {/* TAB 3: CONFIGURACIÓN (Crédito y Precio) */}
          {activeTab === 'configuracion' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Límite de Crédito ($)</label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">$</div>
                    <input type="number" name="creditLimit" value={formData.creditLimit} onChange={handleInputChange} className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-mono" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Días de Crédito</label>
                  <input type="number" name="paymentDays" value={formData.paymentDays} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700" placeholder="0" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nivel de Precio Asignado</label>
                  <select name="level" value={formData.level} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 cursor-pointer bg-white">
                    <option value="PUBLICO">Público General (Lista)</option>
                    <option value="MAYOREO">Mayoreo / Bronce</option>
                    <option value="DISTRIBUIDOR">Distribuidor / Plata</option>
                    <option value="VIP">Familia / VIP (Oro)</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Determina qué lista de precios se aplicará automáticamente al vender.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUCURSALES (Solo si no es Branch) */}
          {activeTab === 'sucursales' && !isBranch && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Store size={18}/> Agregar Sucursal Rápida</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Nombre Sucursal (Ej. CENTRO)" className="px-4 py-2 border border-gray-300 rounded-lg uppercase text-sm" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
                  <input type="text" placeholder="Dirección Simplificada" className="px-4 py-2 border border-gray-300 rounded-lg uppercase text-sm" value={newBranch.address} onChange={e => setNewBranch({...newBranch, address: e.target.value})} />
                </div>
                <button onClick={handleAddBranch} className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors">
                  + Agregar a la lista
                </button>
              </div>

              {branches.length > 0 ? (
                <div className="space-y-2">
                  {branches.map(b => (
                    <div key={b.tempId} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{b.name}</p>
                        <p className="text-xs text-gray-500">{b.fullAddress || 'Sin dirección'}</p>
                      </div>
                      <button onClick={() => handleRemoveBranch(b.tempId)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
                  <Layers size={32} className="mx-auto mb-2 opacity-20"/>
                  <p className="text-sm">No hay sucursales agregadas</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* --- FOOTER (Estilo Imagen) --- */}
        <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 text-gray-600 font-bold text-sm hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Guardando...</span>
            ) : (
              <>
                <Save size={18} />
                Guardar {isBranch ? 'Sucursal' : 'Cliente'}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};