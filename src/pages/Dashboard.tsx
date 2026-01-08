import React, { useState } from 'react';
import { 
  ShoppingCart, FileText, ShoppingBag, Truck, Users, History, Calendar, 
  ClipboardList, Wallet, Settings, Package, BarChart2, Tag, Layers, 
  Globe, CreditCard, Gift, Percent, Crown, Megaphone, UserCheck, 
  Clock, Target, Wifi, Smartphone, RefreshCw, Database, Printer, FileDigit,
  DollarSign 
} from 'lucide-react';
import { ViewState } from '../types';
import { ShiftManager } from '../components/ShiftManager';

interface DashboardProps {
  setView: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  // Estado para controlar la ventana de Turnos (Corte X/Z)
  const [isShiftManagerOpen, setIsShiftManagerOpen] = useState(false);

  // Componente de Botón (Compacto)
  const MenuOption = ({ icon: Icon, label, onClick }: any) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-start p-2 rounded-lg hover:bg-slate-50 transition-all duration-200 group w-full"
    >
      <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 mb-1.5 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm border border-transparent group-hover:border-slate-100 transition-all">
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <span className="text-xs font-medium text-slate-600 text-center leading-tight group-hover:text-slate-900">
        {label}
      </span>
    </button>
  );

  // Componente de Tarjeta
  const DashboardCard = ({ title, headerColor, children }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300">
      <div className={`${headerColor} px-4 py-3 border-b border-white/10`}>
        <h3 className="font-bold text-white text-sm tracking-wide">{title}</h3>
      </div>
      <div className="p-3 grid grid-cols-2 gap-x-2 gap-y-1 content-start flex-1">
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-full pb-32 animate-fade-in">
      
      {/* MODAL DE GESTIÓN DE TURNOS (Invisible hasta que se activa) */}
      <ShiftManager 
         isOpen={isShiftManagerOpen} 
         onClose={() => setIsShiftManagerOpen(false)} 
      />

      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. VENTAS (Azul) */}
        <DashboardCard title="Ventas" headerColor="bg-blue-500">
          <MenuOption icon={ShoppingCart} label="Punto de Venta" onClick={() => setView(ViewState.POS)} />
          <MenuOption icon={FileText} label="Presupuestos" onClick={() => console.log('Presupuestos')} />
          <MenuOption icon={ShoppingBag} label="Pedidos" onClick={() => setView(ViewState.ORDERS)} />
          <MenuOption icon={Truck} label="Venta en Ruta" onClick={() => setView(ViewState.ROUTE_SALES)} />
          <MenuOption icon={Users} label="Clientes" onClick={() => setView(ViewState.CLIENTS_DASHBOARD)} />
          <MenuOption icon={History} label="Historial" onClick={() => setView(ViewState.SALES)} />
          <MenuOption icon={Calendar} label="Agenda Entregas" onClick={() => setView(ViewState.SALES_CALENDAR)} />
        </DashboardCard>

        {/* 2. COMPRAS (Verde) */}
        <DashboardCard title="Compras" headerColor="bg-emerald-500">
          <MenuOption icon={ClipboardList} label="Órdenes Compra" onClick={() => setView(ViewState.PURCHASE_ORDERS)} />
          <MenuOption icon={ShoppingBag} label="Compras" onClick={() => setView(ViewState.PURCHASES)} />
          <MenuOption icon={Users} label="Proveedores" onClick={() => setView(ViewState.SUPPLIERS)} />
          <MenuOption icon={Truck} label="Agenda Recepción" onClick={() => setView(ViewState.PURCHASE_CALENDAR)} />
        </DashboardCard>

        {/* 3. CONTABILIDAD (Morado) */}
        <DashboardCard title="Contabilidad" headerColor="bg-purple-500">
          <MenuOption icon={FileDigit} label="Facturas" onClick={() => console.log('Facturas')} />
          <MenuOption icon={Wallet} label="Gastos" onClick={() => console.log('Gastos')} />
          <MenuOption icon={CreditCard} label="Ctas. por Pagar" onClick={() => setView(ViewState.ACCOUNTS_PAYABLE)} />
          <MenuOption icon={Wallet} label="Ctas. por Cobrar" onClick={() => setView(ViewState.ACCOUNTS_RECEIVABLE)} />
          <MenuOption icon={Calendar} label="Agenda Financiera" onClick={() => setView(ViewState.FINANCE_CALENDAR)} />
        </DashboardCard>

        {/* 4. INVENTARIOS (Naranja/Amarillo) */}
        <DashboardCard title="Inventarios" headerColor="bg-amber-500">
          <MenuOption icon={Package} label="Catálogo Productos" onClick={() => setView(ViewState.INVENTORY)} />
          <MenuOption icon={RefreshCw} label="Movimientos" onClick={() => setView(ViewState.INVENTORY_MOVEMENTS)} />
          <MenuOption icon={BarChart2} label="Auditoría" onClick={() => setView(ViewState.INVENTORY_AUDIT)} />
          <MenuOption icon={Tag} label="Etiquetas" onClick={() => console.log('Etiquetas')} />
          <MenuOption icon={Layers} label="Sucursales" onClick={() => console.log('Sucursales')} />
          <MenuOption icon={Package} label="Stock Mínimo" onClick={() => console.log('Stock')} />
        </DashboardCard>

        {/* 5. MARKETING (Rosa) */}
        <DashboardCard title="Marketing y Lealtad" headerColor="bg-pink-500">
          <MenuOption icon={Megaphone} label="Promociones" onClick={() => console.log('Promociones')} />
          <MenuOption icon={Gift} label="Puntos" onClick={() => console.log('Puntos')} />
          <MenuOption icon={Percent} label="Descuentos" onClick={() => console.log('Descuentos')} />
          <MenuOption icon={Crown} label="Clientes VIP" onClick={() => console.log('VIP')} />
        </DashboardCard>

        {/* 6. GESTIÓN DEL NEGOCIO (Cyan) */}
        <DashboardCard title="Gestión del Negocio" headerColor="bg-cyan-500">
          <MenuOption icon={BarChart2} label="Reportes Globales" onClick={() => setView(ViewState.REPORTS)} />
          <MenuOption icon={UserCheck} label="Empleados" onClick={() => console.log('Empleados')} />
          
          {/* BOTÓN TURNOS CONECTADO */}
          <MenuOption icon={Clock} label="Turnos" onClick={() => setIsShiftManagerOpen(true)} />
          
          <MenuOption icon={DollarSign} label="Comisiones" onClick={() => console.log('Comisiones')} />
          <MenuOption icon={Target} label="Metas" onClick={() => console.log('Metas')} />
        </DashboardCard>

        {/* 7. TIENDA ONLINE (Indigo) */}
        <DashboardCard title="Tienda Online" headerColor="bg-indigo-500">
          <MenuOption icon={Globe} label="Pedidos Web" onClick={() => console.log('Web')} />
          <MenuOption icon={Smartphone} label="Apps Delivery" onClick={() => console.log('Apps')} />
          <MenuOption icon={RefreshCw} label="Sincronización" onClick={() => console.log('Sync')} />
          <MenuOption icon={Wifi} label="Conexiones API" onClick={() => console.log('API')} />
        </DashboardCard>

        {/* 8. CONFIGURACIÓN (Gris Azulado) */}
        <DashboardCard title="Configuración Sistema" headerColor="bg-slate-600">
          <MenuOption icon={Printer} label="Hardware / Imp." onClick={() => setView(ViewState.CONF_HARDWARE)} />
          <MenuOption icon={FileText} label="Impuestos" onClick={() => setView(ViewState.CONF_TAXES)} />
          <MenuOption icon={Database} label="Base de Datos" onClick={() => console.log('DB')} />
          <MenuOption icon={Users} label="Usuarios Sistema" onClick={() => setView(ViewState.CONF_USERS)} />
        </DashboardCard>

      </div>
    </div>
  );
};