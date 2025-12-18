import React, { useState } from 'react';
import { 
  Truck, Star, History, UserPlus, 
  Tags, FileSpreadsheet, AlertTriangle, BarChart3, 
  Briefcase, DollarSign 
} from 'lucide-react';
import { NewSupplierModal } from '../components/NewSupplierModal';

// === AQUÍ ESTABA EL ERROR, AHORA YA TIENE EL NOMBRE CORRECTO ===
export const SuppliersDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const actionCards = [
    {
      title: "Directorio de Proveedores",
      description: "Gestión completa de la base de proveedores.",
      icon: <Truck size={24} />,
      color: "border-blue-500",
      iconBg: "bg-blue-600",
      textColor: "text-blue-600"
    },
    {
      title: "Evaluación de Desempeño",
      description: "Calificación de calidad y tiempos de entrega.",
      icon: <Star size={24} />,
      color: "border-purple-500",
      iconBg: "bg-purple-600",
      textColor: "text-purple-600"
    },
    {
      title: "Contratos y Acuerdos",
      description: "Repositorio de documentos legales.",
      icon: <Briefcase size={24} />,
      color: "border-teal-500",
      iconBg: "bg-teal-600",
      textColor: "text-teal-600"
    },
    {
      title: "Historial de Pedidos",
      description: "Registro detallado de órdenes de compra.",
      icon: <History size={24} />,
      color: "border-emerald-500",
      iconBg: "bg-emerald-600",
      textColor: "text-emerald-600"
    },
    {
      title: "Alta de Proveedores",
      description: "Registro y onboarding de nuevos socios.",
      icon: <UserPlus size={24} />,
      color: "border-red-500",
      iconBg: "bg-red-600",
      textColor: "text-red-600",
      onClick: () => setIsModalOpen(true)
    },
    {
      title: "Rubros y Categorías",
      description: "Clasificación por tipo de insumo o servicio.",
      icon: <Tags size={24} />,
      color: "border-indigo-500",
      iconBg: "bg-indigo-600",
      textColor: "text-indigo-600"
    },
    {
      title: "Listas de Precios",
      description: "Gestión de costos y vigencias pactadas.",
      icon: <FileSpreadsheet size={24} />,
      color: "border-pink-500",
      iconBg: "bg-pink-600",
      textColor: "text-pink-600"
    },
    {
      title: "Análisis de Gastos",
      description: "Métricas de compras y variaciones de costo.",
      icon: <BarChart3 size={24} />,
      color: "border-cyan-600",
      iconBg: "bg-cyan-700",
      textColor: "text-cyan-700"
    },
    {
      title: "Incidencias y Reclamos",
      description: "Gestión de devoluciones y garantías.",
      icon: <AlertTriangle size={24} />,
      color: "border-orange-600",
      iconBg: "bg-orange-700",
      textColor: "text-orange-700"
    }
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Gestión de Proveedores</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {actionCards.map((card, index) => (
          <div 
            key={index} 
            onClick={card.onClick}
            className={`bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-t-4 ${card.color} flex flex-col justify-between h-32`}
          >
            <div className="flex items-start gap-4">
              <div className={`${card.iconBg} p-2 rounded-lg text-white shadow-sm shrink-0`}>
                {card.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{card.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 text-sm">Resumen de Proveedores</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Proveedores Totales</span>
              <span className="font-bold text-slate-800">142</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 text-sm">Estado de Pagos</h3>
          <div className="space-y-3">
             <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Monto por Pagar</span>
              <span className="font-bold text-slate-800">$45,230.00</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 text-sm">Métricas de Compra</h3>
          <div className="space-y-3">
             <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Gasto del Mes</span>
              <span className="font-bold text-slate-800">$123,456</span>
            </div>
          </div>
        </div>
      </div>

      <NewSupplierModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={() => setIsModalOpen(false)}
      />
    </div>
  );
};