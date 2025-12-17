import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, Edit, Trash2 } from 'lucide-react';
import { Client } from '../types';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onEdit: () => void;
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ isOpen, onClose, client, onEdit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in zoom-in-95">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 flex justify-between items-start border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Detalles del cliente</h2>
          <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
            
            {/* Columna Izquierda: Info Personal */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-2xl">
                        {client.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{client.name}</h3>
                        <div className="flex gap-2 mt-1">
                             <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded uppercase">{client.level || 'PLATA'}</span>
                             <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 text-xs font-bold rounded uppercase">REGULAR</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-3"><Mail size={18} className="text-slate-400"/> {client.email || 'Sin correo'}</div>
                    <div className="flex items-center gap-3"><Phone size={18} className="text-slate-400"/> {client.phone || 'Sin teléfono'}</div>
                    <div className="flex items-center gap-3"><MapPin size={18} className="text-slate-400"/> {client.address || 'Sin dirección registrada'}</div>
                    <div className="flex items-center gap-3"><Calendar size={18} className="text-slate-400"/> Cliente desde: {new Date(client.since).toLocaleDateString()}</div>
                </div>

                <div>
                    <p className="font-bold text-slate-800 mb-2 text-sm">Etiquetas</p>
                    <div className="flex flex-wrap gap-2">
                        {(client.tags || []).map((tag, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                                {tag}
                            </span>
                        ))}
                        {(!client.tags || client.tags.length === 0) && <span className="text-slate-400 text-xs italic">Sin etiquetas</span>}
                    </div>
                </div>
            </div>

            {/* Columna Derecha: Estadísticas y Notas */}
            <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                    <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Estadísticas</h4>
                    <div className="flex justify-between text-sm"><span>Total de Compras:</span><span className="font-bold text-slate-700">15</span></div>
                    <div className="flex justify-between text-sm"><span>Valor Promedio:</span><span className="font-bold text-slate-700">$ 450</span></div>
                    <div className="flex justify-between text-sm"><span>Puntos de Lealtad:</span><span className="font-bold text-purple-600">{client.points || 0} pts</span></div>
                    <div className="flex justify-between text-sm"><span>Última Compra:</span><span className="font-bold text-slate-700">--/--/--</span></div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                    <h4 className="font-bold text-yellow-800 mb-2">Notas</h4>
                    <p className="text-sm text-yellow-700 leading-relaxed italic">
                        "Cliente registrado en el sistema."
                    </p>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 mt-auto">
            <button onClick={() => alert("Función de eliminar pendiente")} className="px-6 py-2.5 rounded-lg border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center gap-2">
                <Trash2 size={18}/> Eliminar
            </button>
            <button onClick={() => { onClose(); onEdit(); }} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200">
                <Edit size={18}/> Editar Cliente
            </button>
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition-colors">
                Cerrar
            </button>
        </div>

      </div>
    </div>
  );
};