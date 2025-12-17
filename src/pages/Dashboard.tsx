import React from 'react';
import { 
  ShoppingCart, 
  ClipboardList, 
  ShoppingBag, 
  Truck, 
  Users, 
  RotateCcw, 
  FileText, 
  CalendarDays, 
  Receipt, 
  Banknote, 
  Package, 
  ArrowRightLeft, 
  BarChart3, 
  Tag, 
  Store, 
  PieChart,
  Wallet,
  Megaphone,
  Gift, 
  Percent,
  Crown,
  Clock,
  BadgeDollarSign,
  Target,
  Printer,
  FileSpreadsheet,
  Database,
  UserCog,
  Globe,
  Smartphone,
  Wifi,
  RefreshCw,
  BoxesIcon
} from 'lucide-react';

import { ViewState } from '../types';

interface DashboardProps {
  setView: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {

  const handleNavigation = (target: ViewState | 'COMING_SOON') => {
    if (target === 'COMING_SOON') {
      alert("Esta funcionalidad estará disponible pronto.");
    } else {
      setView(target);
    }
  };

  return (
    <div className="p-8 animate-fade-in max-w-[1920px] mx-auto bg-slate-50 min-h-screen">

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* --- VENTAS --- */}
        <MenuSection 
          title="Ventas" 
          gradient="bg-gradient-to-r from-blue-600 to-blue-400"
          items={[
            { label: 'Punto de Venta', icon: ShoppingCart, action: () => handleNavigation('POS') },
            { label: 'Presupuestos', icon: ClipboardList, action: () => handleNavigation('PENDING_SALES') },
            { label: 'Pedidos', icon: ShoppingBag, action: () => handleNavigation('ORDERS') },
            { label: 'Venta en Ruta', icon: Truck, action: () => handleNavigation('ROUTE_SALES') },
            { label: 'Clientes', icon: Users, action: () => handleNavigation('CLIENTS_DASHBOARD') },
            { label: 'Historial', icon: RotateCcw, action: () => handleNavigation('SALES') },
          ]}
        />

        {/* --- COMPRAS --- */}
        <MenuSection 
          title="Compras" 
          gradient="bg-gradient-to-r from-emerald-600 to-emerald-400"
          items={[
            { label: 'Órdenes de Compra', icon: ClipboardList, action: () => handleNavigation('PURCHASE_ORDERS') },
            { label: 'Compras', icon: ShoppingBag, action: () => handleNavigation('PURCHASES') },
            { label: 'Proveedores', icon: Users, action: () => handleNavigation('SUPPLIERS') },
            { label: 'Calendario', icon: CalendarDays, action: () => handleNavigation('CALENDAR') },
          ]}
        />

        {/* --- CONTABILIDAD --- */}
        <MenuSection 
          title="Contabilidad" 
          gradient="bg-gradient-to-r from-purple-600 to-purple-400"
          items={[
            { label: 'Facturas', icon: FileText, action: () => handleNavigation('COMING_SOON') },
            { label: 'Recibos', icon: Receipt, action: () => handleNavigation('COMING_SOON') },
            { label: 'Gastos', icon: Banknote, action: () => handleNavigation('COMING_SOON') },
            { label: 'Cobranza', icon: Wallet, action: () => handleNavigation('ACCOUNTS_RECEIVABLE') },
          ]}
        />

        {/* --- INVENTARIOS --- */}
        <MenuSection 
          title="Inventarios" 
          gradient="bg-gradient-to-r from-amber-600 to-amber-400"
          items={[
            { label: 'Catálogo Productos', icon: Package, action: () => handleNavigation(ViewState.INVENTORY) },

            // Movimientos combinados (si lo usas)
            { label: 'Movimientos', icon: ArrowRightLeft, action: () => handleNavigation(ViewState.INVENTORY_MOVEMENTS) },

            { label: 'Auditoría', icon: BarChart3, action: () => handleNavigation(ViewState.INVENTORY_AUDIT) },
            { label: 'Etiquetas', icon: Tag, action: () => handleNavigation(ViewState.INVENTORY_LABELS) },
            { label: 'Sucursales', icon: Store, action: () => handleNavigation(ViewState.INVENTORY_BRANCHES) },

            // Nuevos iconos de tu captura
            { label: 'Stock Mínimo', icon: BoxesIcon, action: () => handleNavigation(ViewState.INVENTORY_MIN_STOCK) },
          ]}
/>

        {/* --- MARKETING --- */}
        <MenuSection 
          title="Marketing y Lealtad" 
          gradient="bg-gradient-to-r from-pink-600 to-pink-400"
          items={[
            { label: 'Promociones', icon: Megaphone, action: () => handleNavigation('COMING_SOON') },
            { label: 'Puntos', icon: Gift, action: () => handleNavigation('COMING_SOON') },
            { label: 'Descuentos', icon: Percent, action: () => handleNavigation('COMING_SOON') },
            { label: 'Clientes VIP', icon: Crown, action: () => handleNavigation('COMING_SOON') },
          ]}
        />

        {/* --- GESTIÓN --- */}
        <MenuSection 
          title="Gestión del Negocio" 
          gradient="bg-gradient-to-r from-cyan-600 to-cyan-400"
          items={[
            { label: 'Reportes Globales', icon: PieChart, action: () => handleNavigation('REPORTS') },
            { label: 'Empleados', icon: Users, action: () => handleNavigation('COMING_SOON') },
            { label: 'Turnos', icon: Clock, action: () => handleNavigation('COMING_SOON') },
            { label: 'Comisiones', icon: BadgeDollarSign, action: () => handleNavigation('COMING_SOON') },
            { label: 'Metas', icon: Target, action: () => handleNavigation('COMING_SOON') },
          ]}
        />

        {/* --- TIENDA ONLINE --- */}
        <MenuSection 
          title="Tienda Online" 
          gradient="bg-gradient-to-r from-indigo-600 to-indigo-400"
          items={[
            { label: 'Pedidos Web', icon: Globe, action: () => handleNavigation('COMING_SOON') },
            { label: 'Apps Delivery', icon: Smartphone, action: () => handleNavigation('COMING_SOON') },
            { label: 'Sincronización', icon: RefreshCw, action: () => handleNavigation('COMING_SOON') },
            { label: 'Conexiones API', icon: Wifi, action: () => handleNavigation('COMING_SOON') },
          ]}
        />

        {/* --- CONFIGURACIÓN --- */}
        <MenuSection 
          title="Configuración Sistema" 
          gradient="bg-gradient-to-r from-slate-700 to-slate-500"
          items={[
            { label: 'Hardware / Imp.', icon: Printer, action: () => setView('CONF_HARDWARE') },
            { label: 'Impuestos', icon: FileSpreadsheet, action: () => setView('CONF_TAXES') },
            { label: 'Base de Datos', icon: Database, action: () => setView('CONF_DATABASE') },
            { label: 'Usuarios Sistema', icon: UserCog, action: () => setView('CONF_USERS') },
          ]}
        />

      </div>
    </div>
  );
};

interface MenuItem {
  label: string;
  icon: React.ElementType;
  action: () => void;
}

const MenuSection = ({ title, gradient, items }: { title: string, gradient: string, items: MenuItem[] }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
    <div className={`${gradient} px-6 py-4 border-b border-white/10 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:translate-x-5 transition-transform"></div>
      <h3 className="text-white font-bold text-lg tracking-wide flex items-center gap-2 relative z-10">
        {title}
      </h3>
    </div>

    <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4 flex-1 content-start bg-gradient-to-b from-white to-slate-50">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <button 
            key={idx} 
            onClick={item.action}
            className="flex flex-col items-center justify-start gap-3 group/item text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-500 group-hover/item:scale-110 group-hover/item:text-white group-hover/item:bg-slate-800 group-hover/item:border-transparent group-hover/item:shadow-md transition-all duration-200">
              <Icon size={22} strokeWidth={1.5} />
            </div>
            <span className="text-xs font-semibold text-slate-600 group-hover/item:text-slate-900 leading-tight">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);