import React, { useState, useEffect } from 'react';
import { X, Save, User, Shield, Key, Mail, Building } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { User as UserType, UserRole } from '../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: UserType | null;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, userToEdit }) => {
  const { addUser, updateUser, license } = useDatabase();
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    pin: '',
    role: 'CASHIER' as UserRole,
    email: '',
    branchId: ''
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        fullName: userToEdit.fullName,
        username: userToEdit.username,
        password: userToEdit.password || '',
        pin: userToEdit.pin || '',
        role: userToEdit.role,
        email: userToEdit.email || '',
        branchId: userToEdit.branchId || ''
      });
    } else {
      setFormData({ fullName: '', username: '', password: '', pin: '', role: 'CASHIER', email: '', branchId: '' });
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.username || !formData.pin) return alert("Campos obligatorios faltantes");

    if (userToEdit) {
        await updateUser({ ...userToEdit, ...formData, isActive: userToEdit.isActive });
    } else {
        const success = await addUser({ ...formData, isActive: true });
        if (!success) return; 
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in zoom-in-95">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <User size={20}/> {userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <button onClick={onClose}><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Nombre y Usuario */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nombre Completo *</label>
                    <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-2 border rounded-lg outline-none focus:border-blue-500" autoFocus />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Usuario (Login) *</label>
                    <input name="username" value={formData.username} onChange={handleChange} className="w-full p-2 border rounded-lg outline-none focus:border-blue-500" />
                </div>
            </div>

            {/* Rol y PIN */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Rol / Permisos</label>
                    <div className="relative">
                        <Shield size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full pl-8 p-2 border rounded-lg outline-none focus:border-blue-500 bg-white">
                            <option value="CASHIER">Cajero / Vendedor</option>
                            <option value="ADMIN">Administrador (Dueño)</option>
                            {/* Roles extra solo para licencias superiores */}
                            {(license.level === 'INTERMEDIATE' || license.level === 'PROFESSIONAL') && (
                                <>
                                    <option value="SUPERVISOR">Supervisor</option>
                                    <option value="WAREHOUSE">Almacenista</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">PIN (Acceso Rápido) *</label>
                    <div className="relative">
                        <Key size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <input name="pin" type="password" maxLength={4} placeholder="4 dígitos" value={formData.pin} onChange={handleChange} className="w-full pl-8 p-2 border rounded-lg outline-none focus:border-blue-500 text-center tracking-widest font-bold" />
                    </div>
                </div>
            </div>

            {/* Campos Avanzados (Solo Intermedio/Pro) */}
            {(license.level === 'INTERMEDIATE' || license.level === 'PROFESSIONAL') && (
                <div className="pt-2 border-t border-slate-100 mt-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Datos Corporativos</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Email Corporativo</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"/>
                                <input name="email" value={formData.email} onChange={handleChange} className="w-full pl-8 p-2 border rounded-lg outline-none focus:border-blue-500" placeholder="usuario@empresa.com"/>
                            </div>
                        </div>
                        {license.level === 'PROFESSIONAL' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Sucursal</label>
                                <div className="relative">
                                    <Building size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"/>
                                    <select name="branchId" value={formData.branchId} onChange={handleChange} className="w-full pl-8 p-2 border rounded-lg outline-none focus:border-blue-500 bg-white">
                                        <option value="">Matriz</option>
                                        <option value="SUC-01">Sucursal Norte</option>
                                        <option value="SUC-02">Sucursal Sur</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
                    <Save size={18}/> Guardar Usuario
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};