import React, { useState } from 'react';
import { 
  TrendingUp, Package, DollarSign, 
  ShoppingCart, Users, FileText 
} from 'lucide-react';

// --- IMPORTACIÓN DE LOS DASHBOARDS ---
import SalesDashboard from './Sales/SalesDashboard'; 
import InventoryDashboard from './Inventory/InventoryDashboard';
import FinanceDashboard from './Finance/FinanceDashboard'; // <--- ESTE ES EL QUE FALTABA CONECTAR

// Definición de las categorías posibles
type ReportCategory = 'HOME' | 'SALES' | 'INVENTORY' | 'FINANCE' | 'PURCHASES' | 'CUSTOMERS' | 'TAXES';

export const ReportsCenter = () => {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('HOME');

  // Componente de Tarjeta (Reutilizable)
  const ReportCard = ({ title, desc, icon: Icon, color, onClick }: any) => (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer 
                  hover:shadow-md transition-all duration-200 border-l-4 ${color} group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-blue-700 transition-colors">{title}</h3>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  // Renderizador de vistas (El "Router" interno)
  const renderContent = () => {
    switch (activeCategory) {
      
      // 1. MÓDULO DE VENTAS
      case 'SALES':
        return <SalesDashboard onBack={() => setActiveCategory('HOME')} />;
        
      // 2. MÓDULO DE INVENTARIO
      case 'INVENTORY':
        return <InventoryDashboard onBack={() => setActiveCategory('HOME')} />;

      // 3. MÓDULO DE FINANZAS (Aquí estaba el problema antes)
      case 'FINANCE':
        return <FinanceDashboard onBack={() => setActiveCategory('HOME')} />;

      // ... Aquí irán Compras y Clientes cuando los creemos ...

      // PANTALLA PRINCIPAL (MENÚ)
      default:
        return (
          <div className="p-6 bg-slate-50 min-h-full animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Centro de Reportes</h1>
                <p className="text-slate-500 mt-1">Seleccione una categoría para ver métricas detalladas.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Tarjeta Ventas */}
              <ReportCard 
                title="Reportes de Ventas" 
                desc="Ventas por período, producto, vendedor y márgenes."
                icon={TrendingUp}
                color="border-l-blue-500"
                onClick={() => setActiveCategory('SALES')}
              />
              
              {/* Tarjeta Inventario */}
              <ReportCard 
                title="Control de Inventario" 
                desc="Valuación, rotación, mermas y productos bajo stock."
                icon={Package}
                color="border-l-indigo-500"
                onClick={() => setActiveCategory('INVENTORY')}
              />
              
              {/* Tarjeta Finanzas */}
              <ReportCard 
                title="Finanzas y Caja" 
                desc="Flujo de efectivo, cortes de caja y gastos operativos."
                icon={DollarSign}
                color="border-l-emerald-500"
                onClick={() => setActiveCategory('FINANCE')} // <--- Esto activa el caso 'FINANCE'
              />
              
              {/* Tarjeta Compras (Pendiente) */}
              <ReportCard 
                title="Compras a Proveedores" 
                desc="Historial de compras, cuentas por pagar y sugeridos."
                icon={ShoppingCart}
                color="border-l-orange-500"
                onClick={() => console.log("Próximamente: Módulo de Compras")}
              />
              
              {/* Tarjeta Clientes (Pendiente) */}
              <ReportCard 
                title="Análisis de Clientes" 
                desc="Top clientes, frecuencia de compra y créditos."
                icon={Users}
                color="border-l-purple-500"
                onClick={() => console.log("Próximamente: Módulo de Clientes")}
              />
              
              {/* Tarjeta Fiscal (Pendiente) */}
              <ReportCard 
                title="Reportes Fiscales" 
                desc="Desglose de impuestos, facturación y cancelaciones."
                icon={FileText}
                color="border-l-red-500"
                onClick={() => console.log("Próximamente: Módulo Fiscal")}
              />
            </div>
          </div>
        );
    }
  };

  return <div className="h-full bg-slate-50">{renderContent()}</div>;
};

// Exportación correcta para evitar errores de importación
export default ReportsCenter;