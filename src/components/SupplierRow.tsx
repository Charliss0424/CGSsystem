import React from 'react';
import { Building2, Star, FileText, CheckSquare, AlertTriangle } from 'lucide-react';
import { Supplier } from '../types';

interface SupplierRowProps {
  supplier: Supplier;
}

export const SupplierRow: React.FC<SupplierRowProps> = ({ supplier }) => {
  // Helper to determine status style
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'activo':
        return 'bg-green-100 text-green-700';
      case 'inactive':
      case 'inactivo':
        return 'bg-gray-100 text-gray-700';
      case 'pending':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="group hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 p-4 grid grid-cols-12 gap-4 items-center">
      
      {/* Proveedor Info */}
      <div className="col-span-12 md:col-span-4 flex items-start gap-3">
        <div className="p-3 bg-blue-50 rounded-lg text-blue-600 shrink-0">
          <Building2 size={24} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{supplier.name}</h4>
          <p className="text-sm text-gray-500 mt-0.5">
            Solicitud de comentarios: {supplier.tax_id || 'N/A'}
          </p>
        </div>
      </div>

      {/* Contacto */}
      <div className="col-span-6 md:col-span-3">
        <p className="text-sm font-medium text-gray-700">{supplier.contact || 'No contact'}</p>
        <p className="text-xs text-gray-500 mt-0.5">Teléfono: {supplier.phone || 'N/A'}</p>
      </div>

      {/* Categoría */}
      <div className="col-span-6 md:col-span-2">
        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
          {supplier.category || 'General'}
        </span>
      </div>

      {/* Desempeño (Visual Mock based on design) */}
      <div className="col-span-6 md:col-span-1 flex items-center gap-1">
        <Star size={16} className="text-yellow-400 fill-yellow-400" />
        <span className="text-sm font-bold text-gray-700">{supplier.rating || 4.5}</span>
      </div>

      {/* Estado */}
      <div className="col-span-6 md:col-span-1">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${getStatusStyle(supplier.status)}`}>
          {supplier.status === 'Active' ? 'Activo' : supplier.status}
        </span>
      </div>

      {/* Acciones */}
      <div className="col-span-12 md:col-span-1 flex items-center justify-end md:justify-start gap-3 text-gray-400">
        <button className="hover:text-blue-600 transition-colors" title="Documentos">
            <FileText size={18} />
        </button>
        <button className="hover:text-green-600 transition-colors" title="Validar">
            <CheckSquare size={18} />
        </button>
        <button className="hover:text-orange-500 transition-colors" title="Reportar">
            <AlertTriangle size={18} />
        </button>
      </div>
    </div>
  );
};