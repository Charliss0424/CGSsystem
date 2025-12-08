import React, { useState } from 'react';
import { X, Search, User, UserPlus, CreditCard, AlertCircle } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Client } from '../types';

interface ClientSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient: (client: Client) => void;
}

export const ClientSearchModal: React.FC<ClientSearchModalProps> = ({ isOpen, onClose, onSelectClient }) => {
  const { clients, addClient } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  
  // Estado para nuevo cliente rápido
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  if (!isOpen) return null;

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newClientName.trim()) {
        await addClient({
            name: newClientName,
            phone: newClientPhone,
            creditLimit: 0, // Por defecto sin crédito hasta que el admin lo apruebe
            currentBalance: 0
        });
        setNewClientName('');
        setNewClientPhone('');
        setShowNewClientForm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* HEADER */}
        <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <User className="text-indigo-600"/> Asignar Cliente
            </h2>
            <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        {/* CONTENIDO */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
            
            {/* BARRA DE BÚSQUEDA */}
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Buscar cliente por nombre o teléfono..." 
                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setShowNewClientForm(!showNewClientForm)}
                    className="bg-indigo-100 text-indigo-700 px-4 rounded-xl font-bold hover:bg-indigo-200 transition-colors flex items-center gap-2"
                >
                    <UserPlus size={20}/> Nuevo
                </button>
            </div>

            {/* FORMULARIO NUEVO CLIENTE RAPIDO */}
            {showNewClientForm && (
                <form onSubmit={handleCreateClient} className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 animate-in slide-in-from-top-2">
                    <h3 className="font-bold text-indigo-800 mb-2">Registro Rápido</h3>
                    <div className="flex gap-2">
                        <input required placeholder="Nombre Completo" className="flex-1 p-2 border rounded-lg" value={newClientName} onChange={e => setNewClientName(e.target.value)} />
                        <input placeholder="Teléfono" className="w-1/3 p-2 border rounded-lg" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} />
                        <button type="submit" className="bg-indigo-600 text-white px-4 rounded-lg font-bold">Guardar</button>
                    </div>
                </form>
            )}

            {/* LISTA DE CLIENTES */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredClients.map(client => {
                    const creditAvailable = client.creditLimit - client.currentBalance;
                    const hasCredit = creditAvailable > 0;
                    
                    return (
                        <button 
                            key={client.id}
                            onClick={() => onSelectClient(client)}
                            className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{client.name}</h3>
                                <p className="text-sm text-slate-500">{client.phone || 'Sin teléfono'}</p>
                            </div>

                            <div className="text-right">
                                {client.creditLimit > 0 ? (
                                    <>
                                        <div className="text-xs text-slate-500 mb-1">Crédito Disponible</div>
                                        <div className={`font-bold text-lg ${hasCredit ? 'text-green-600' : 'text-red-500'}`}>
                                            ${creditAvailable.toFixed(2)}
                                        </div>
                                        <div className="text-[10px] text-slate-400">Deuda: ${client.currentBalance.toFixed(2)}</div>
                                    </>
                                ) : (
                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">Contado</span>
                                )}
                            </div>
                        </button>
                    )
                })}
                
                {filteredClients.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                        <User size={48} className="mx-auto mb-2 opacity-20"/>
                        <p>No se encontraron clientes</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};