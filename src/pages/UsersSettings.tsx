import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit3, Lock, Unlock, Shield, Star } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ViewState, User } from '../types';
import { UserFormModal } from '../components/UserFormModal';

export const UsersSettings = ({ setView }: { setView: (v: ViewState) => void }) => {
  const { users, license, toggleUserStatus } = useDatabase();
  const [showModal, setShowModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setUserToEdit(user);
    setShowModal(true);
  };

  const handleCreate = () => {
    setUserToEdit(null);
    setShowModal(true);
  };

  // Colores por Rol
  const roleBadge = (role: string) => {
      switch(role) {
          case 'ADMIN': return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">DUEÑO / ADMIN</span>;
          case 'SUPERVISOR': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">SUPERVISOR</span>;
          case 'WAREHOUSE': return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-200">ALMACÉN</span>;
          default: return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">CAJERO</span>;
      }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
                <button onClick={() => setView('SETTINGS')} className="p-2 hover:bg-white rounded-full transition-colors text-slate-500">
                    <ArrowLeft size={24}/>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Usuarios y Permisos</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Plan Actual:</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-xs ${license.level === 'PROFESSIONAL' ? 'bg-black text-amber-400' : license.level === 'INTERMEDIATE' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                            {license.level}
                        </span>
                        <span>• {users.length} / {license.maxUsers} Usuarios activos</span>
                    </div>
                </div>
            </div>
            
            <button 
                onClick={handleCreate}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
                <Plus size={18}/> Nuevo Usuario
            </button>
        </div>

        {/* Tabla de Usuarios */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                    <tr>
                        <th className="p-4">Usuario</th>
                        <th className="p-4">Rol</th>
                        <th className="p-4">PIN</th>
                        <th className="p-4">Estado</th>
                        {license.level !== 'BASIC' && <th className="p-4">Email</th>}
                        <th className="p-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                                <div className="font-bold text-slate-700">{user.fullName}</div>
                                <div className="text-xs text-slate-400">@{user.username}</div>
                            </td>
                            <td className="p-4">{roleBadge(user.role)}</td>
                            <td className="p-4 font-mono text-slate-500">****</td>
                            <td className="p-4">
                                {user.isActive 
                                    ? <span className="text-green-600 font-bold text-xs flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Activo</span>
                                    : <span className="text-slate-400 font-bold text-xs flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Inactivo</span>
                                }
                            </td>
                            {license.level !== 'BASIC' && <td className="p-4 text-slate-500">{user.email || '-'}</td>}
                            <td className="p-4 text-center">
                                <div className="flex justify-center gap-2">
                                    <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Edit3 size={18}/></button>
                                    
                                    {/* Botón Activar/Desactivar */}
                                    {user.role !== 'ADMIN' && (
                                        <button 
                                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                                            className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`} 
                                            title={user.isActive ? "Desactivar acceso" : "Reactivar acceso"}
                                        >
                                            {user.isActive ? <Lock size={18}/> : <Unlock size={18}/>}
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Banner de Upsell (Si es básico) */}
        {license.level === 'BASIC' && (
            <div className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white flex justify-between items-center shadow-lg">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2"><Star className="text-yellow-300 fill-yellow-300"/> Pásate a PRO</h3>
                    <p className="opacity-90 text-sm mt-1">Desbloquea roles de Supervisor, Control de Almacén y Gestión Multi-sucursal.</p>
                </div>
                <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-sm">
                    Ver Planes
                </button>
            </div>
        )}
      </div>

      <UserFormModal isOpen={showModal} onClose={() => setShowModal(false)} userToEdit={userToEdit} />
    </div>
  );
};