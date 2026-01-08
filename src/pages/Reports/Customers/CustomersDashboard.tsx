import React, { useState } from 'react';
import { 
  BarChart3, ShoppingCart, Package, DollarSign, 
  TrendingUp, Users, FileText, AlertTriangle 
} from 'lucide-react';
import SalesDashboard from './Sales/SalesDashboard';
import InventoryDashboard from './Inventory/InventoryDashboard';

// Definimos las categorías disponibles
type ReportCategory = 'HOME' | 'SALES' | 'INVENTORY' | 'FINANCE' | 'CUSTOMERS';

export const ReportsCenter = () => {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('HOME');

  // Componente de Tarjeta (Reutilizable)
  const ReportCard = ({ title, desc, icon: Icon, color, onClick }: any) => (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer 
                  hover:shadow-md transition-all duration-200 border-l-4 ${color}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gray-50 text-gray-600`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  // Renderizador de vistas
  const renderContent = () => {
    switch (activeCategory) {
      case 'SALES': return <SalesDashboard onBack={() => setActiveCategory('HOME')} />;
      case 'INVENTORY': return <InventoryDashboard onBack={() => setActiveCategory('HOME')} />;
      // ... otros casos
      default:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Centro de Reportes</h1>
            <p className="text-gray-500">Seleccione una categoría para ver métricas detalladas.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ReportCard 
                title="Reportes de Ventas" 
                desc="Ventas por período, producto, vendedor y márgenes."
                icon={TrendingUp}
                color="border-l-blue-500"
                onClick={() => setActiveCategory('SALES')}
              />
              <ReportCard 
                title="Control de Inventario" 
                desc="Valuación, rotación, mermas y productos bajo stock."
                icon={Package}
                color="border-l-purple-500"
                onClick={() => setActiveCategory('INVENTORY')}
              />
              <ReportCard 
                title="Finanzas y Caja" 
                desc="Flujo de efectivo, cortes de caja y gastos operativos."
                icon={DollarSign}
                color="border-l-green-500"
                onClick={() => setActiveCategory('FINANCE')}
              />
              <ReportCard 
                title="Compras a Proveedores" 
                desc="Historial de compras, cuentas por pagar y sugeridos."
                icon={ShoppingCart}
                color="border-l-orange-500"
                onClick={() => console.log("Ir a compras")}
              />
              <ReportCard 
                title="Análisis de Clientes" 
                desc="Top clientes, frecuencia de compra y créditos."
                icon={Users}
                color="border-l-indigo-500"
                onClick={() => console.log("Ir a clientes")}
              />
              <ReportCard 
                title="Reportes Fiscales" 
                desc="Desglose de impuestos, facturación y cancelaciones."
                icon={FileText}
                color="border-l-red-500"
                onClick={() => console.log("Ir a fiscales")}
              />
            </div>
          </div>
        );
    }
  };

  return <div className="p-6 bg-gray-50 min-h-screen">{renderContent()}</div>;
};