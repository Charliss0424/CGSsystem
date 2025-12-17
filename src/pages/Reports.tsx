import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Calendar, TrendingUp, DollarSign, 
  CreditCard, Wallet, ShoppingBag, ArrowUpRight, 
  Package, AlertTriangle, User, Clock, Printer,
  FileText, PieChart, Layers, Download
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ViewState } from '../types';
import { printElement } from '../utils/printHelper';

interface ReportsProps {
  setView: (view: ViewState) => void;
}

export const Reports: React.FC<ReportsProps> = ({ setView }) => {
  const { sales, products, clients } = useDatabase();
  
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState<'SALES' | 'INVENTORY' | 'FINANCE' | 'CLIENTS'>('SALES');
  const [dateRange, setDateRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'ALL'>('MONTH');

  // --- FILTROS DE FECHA ---
  const filteredSales = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0,0,0,0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    return sales.filter(s => {
        const d = new Date(s.date);
        if (dateRange === 'ALL') return true;
        if (dateRange === 'TODAY') return d >= startOfDay;
        if (dateRange === 'WEEK') return d >= startOfWeek;
        if (dateRange === 'MONTH') return d >= startOfMonth;
        if (dateRange === 'YEAR') return d >= startOfYear;
        return true;
    });
  }, [sales, dateRange]);

  // --- CÁLCULOS CATEGORÍA 1: VENTAS ---
  const salesStats = useMemo(() => {
    const total = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const count = filteredSales.length;
    const ticketAvg = count > 0 ? total / count : 0;
    
    const byMethod = {
        cash: filteredSales.filter(s => s.paymentMethod === 'cash').reduce((acc, s) => acc + s.total, 0),
        card: filteredSales.filter(s => s.paymentMethod === 'card').reduce((acc, s) => acc + s.total, 0),
        credit: filteredSales.filter(s => s.paymentMethod === 'credit').reduce((acc, s) => acc + s.total, 0),
    };

    // Ventas por Hora (Heatmap simple)
    const byHour = new Array(24).fill(0);
    filteredSales.forEach(s => {
        const hour = new Date(s.date).getHours();
        byHour[hour] += s.total;
    });

    return { total, count, ticketAvg, byMethod, byHour };
  }, [filteredSales]);

  // --- CÁLCULOS CATEGORÍA 2: INVENTARIO ---
  const inventoryStats = useMemo(() => {
    // Valor del inventario (Costo vs Venta)
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const totalCost = products.reduce((acc, p) => acc + ((p.costPrice || 0) * p.stock), 0);
    
    // Stock Bajo
    const lowStockItems = products.filter(p => p.stock <= (p.minStock || 5));
    
    // Top Sellers (Basado en historial completo para mayor precisión)
    const productSales: Record<string, number> = {};
    sales.forEach(s => s.items.forEach(i => {
        productSales[i.productId] = (productSales[i.productId] || 0) + i.quantity;
    }));
    
    const topSellers = products
        .map(p => ({ ...p, sold: productSales[p.id] || 0 }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10);

    // Lenta Rotación (Productos con 0 ventas en el periodo actual filtrado)
    const soldIdsInPeriod = new Set();
    filteredSales.forEach(s => s.items.forEach(i => soldIdsInPeriod.add(i.productId)));
    const slowMovers = products.filter(p => !soldIdsInPeriod.has(p.id) && p.stock > 0).slice(0, 10);

    return { totalValue, totalCost, lowStockItems, topSellers, slowMovers };
  }, [products, filteredSales, sales]);

  // --- CÁLCULOS CATEGORÍA 3: FINANCIEROS ---
  const financeStats = useMemo(() => {
    // Estimación de costo de lo vendido (COGS) en el periodo
    // Nota: Esto asume que el costo actual del producto es el mismo que cuando se vendió.
    let cogs = 0;
    filteredSales.forEach(s => {
        s.items.forEach(i => {
            const product = products.find(p => p.id === i.productId);
            if (product && product.costPrice) {
                cogs += product.costPrice * i.quantity;
            }
        });
    });

    const grossProfit = salesStats.total - cogs;
    const margin = salesStats.total > 0 ? (grossProfit / salesStats.total) * 100 : 0;
    
    // Cuentas por Cobrar
    const receivables = clients.reduce((acc, c) => acc + (c.currentBalance || 0), 0);

    return { cogs, grossProfit, margin, receivables };
  }, [salesStats, filteredSales, products, clients]);

  // --- UI COMPONENTS ---
  const KpiCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
            <Icon size={24} className={color.replace('bg-', 'text-').split(' ')[0]} />
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* HEADER Y FILTROS */}
      <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="text-indigo-600"/> Reportes Inteligentes
            </h1>
            <p className="text-slate-500 text-sm">Análisis estratégico de tu negocio</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
            {['TODAY', 'WEEK', 'MONTH', 'YEAR', 'ALL'].map((range) => (
                <button 
                    key={range}
                    onClick={() => setDateRange(range as any)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${dateRange === range ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {range === 'TODAY' ? 'Hoy' : range === 'WEEK' ? 'Semana' : range === 'MONTH' ? 'Mes' : range === 'YEAR' ? 'Año' : 'Todo'}
                </button>
            ))}
        </div>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="px-6 pt-4 flex gap-6 border-b border-slate-200 bg-white shrink-0 overflow-x-auto">
        <TabButton label="Ventas y Caja" active={activeTab === 'SALES'} onClick={() => setActiveTab('SALES')} icon={DollarSign} />
        <TabButton label="Inventario y Stock" active={activeTab === 'INVENTORY'} onClick={() => setActiveTab('INVENTORY')} icon={Package} />
        <TabButton label="Finanzas y Utilidad" active={activeTab === 'FINANCE'} onClick={() => setActiveTab('FINANCE')} icon={PieChart} />
        <TabButton label="Clientes" active={activeTab === 'CLIENTS'} onClick={() => setActiveTab('CLIENTS')} icon={User} />
      </div>

      {/* CONTENIDO SCROLLEABLE */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* --- CATEGORÍA 1: VENTAS --- */}
        {activeTab === 'SALES' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <KpiCard title="Ventas Totales" value={`$${salesStats.total.toFixed(2)}`} icon={DollarSign} color="bg-blue-600" />
                    <KpiCard title="Transacciones" value={salesStats.count} icon={FileText} color="bg-purple-600" />
                    <KpiCard title="Ticket Promedio" value={`$${salesStats.ticketAvg.toFixed(2)}`} icon={TrendingUp} color="bg-green-500" />
                    <KpiCard title="Devoluciones" value="N/A" subtext="Próximamente" icon={AlertTriangle} color="bg-red-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Desglose Métodos Pago */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4">Métodos de Pago</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="flex items-center gap-2"><Wallet size={16} className="text-green-600"/> Efectivo</span>
                                <span className="font-bold">${salesStats.byMethod.cash.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="flex items-center gap-2"><CreditCard size={16} className="text-blue-600"/> Tarjeta</span>
                                <span className="font-bold">${salesStats.byMethod.card.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="flex items-center gap-2"><FileText size={16} className="text-purple-600"/> Crédito</span>
                                <span className="font-bold">${salesStats.byMethod.credit.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Ventas por Hora (Gráfica simulada) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4">Actividad por Hora (0-23h)</h3>
                        <div className="flex items-end gap-1 h-40">
                            {salesStats.byHour.map((val, idx) => {
                                const max = Math.max(...salesStats.byHour) || 1;
                                const height = (val / max) * 100;
                                return (
                                    <div key={idx} className="flex-1 bg-indigo-100 rounded-t-sm hover:bg-indigo-300 relative group" style={{height: `${height}%`}}>
                                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none">
                                            {idx}h: ${val}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                            <span>00:00</span><span>12:00</span><span>23:59</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CATEGORÍA 2: INVENTARIO --- */}
        {activeTab === 'INVENTORY' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-slate-500 text-xs font-bold uppercase">Valor del Inventario (Costo)</h3>
                        <p className="text-3xl font-bold text-slate-800">${inventoryStats.totalCost.toFixed(2)}</p>
                        <p className="text-xs text-green-600 mt-1">Potencial de Venta: ${inventoryStats.totalValue.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-red-800 font-bold mb-1">Stock Bajo / Crítico</h3>
                            <p className="text-sm text-red-600">Productos que necesitan reorden urgente.</p>
                        </div>
                        <div className="text-4xl font-bold text-red-600">{inventoryStats.lowStockItems.length}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* TOP SELLERS */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ArrowUpRight className="text-green-500"/> Productos Más Vendidos</h3>
                        <div className="space-y-3">
                            {inventoryStats.topSellers.map((p, i) => (
                                <div key={i} className="flex justify-between text-sm border-b border-slate-50 pb-2">
                                    <span className="font-medium text-slate-700">{i+1}. {p.name}</span>
                                    <span className="font-bold text-indigo-600">{p.sold} vendidos</span>
                                </div>
                            ))}
                            {inventoryStats.topSellers.length === 0 && <p className="text-slate-400 text-sm">Sin datos suficientes.</p>}
                        </div>
                    </div>

                    {/* LOW ROTATION */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock className="text-orange-500"/> Lenta Rotación (Sin ventas este periodo)</h3>
                        <div className="space-y-3">
                            {inventoryStats.slowMovers.map((p, i) => (
                                <div key={i} className="flex justify-between text-sm border-b border-slate-50 pb-2">
                                    <span className="font-medium text-slate-600">{p.name}</span>
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Stock: {p.stock}</span>
                                </div>
                            ))}
                            {inventoryStats.slowMovers.length === 0 && <p className="text-slate-400 text-sm">Todo se está vendiendo bien.</p>}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CATEGORÍA 3: FINANCIEROS --- */}
        {activeTab === 'FINANCE' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 text-center border-b pb-4">Estado de Resultados (Aproximado)</h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between text-lg">
                            <span className="font-medium text-slate-600">Ventas Totales</span>
                            <span className="font-bold text-slate-800">${salesStats.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-red-500">
                            <span>(-) Costo de lo Vendido (COGS)</span>
                            <span>-${financeStats.cogs.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-red-500">
                            <span>(-) Gastos Operativos (Caja)</span>
                            <span>$0.00</span> {/* Aquí podrías sumar cashOut del contexto si lo tuviéramos global */}
                        </div>
                        
                        <div className="border-t border-slate-300 my-4 pt-4 flex justify-between text-2xl font-bold">
                            <span className="text-indigo-900">Utilidad Bruta</span>
                            <span className="text-green-600">${financeStats.grossProfit.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-center gap-4 mt-6">
                            <div className="text-center bg-green-50 p-4 rounded-xl">
                                <p className="text-xs text-green-700 font-bold uppercase">Margen</p>
                                <p className="text-2xl font-bold text-green-600">{financeStats.margin.toFixed(1)}%</p>
                            </div>
                            <div className="text-center bg-red-50 p-4 rounded-xl">
                                <p className="text-xs text-red-700 font-bold uppercase">Cuentas por Cobrar</p>
                                <p className="text-2xl font-bold text-red-600">${financeStats.receivables.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CATEGORÍA 4: CLIENTES --- */}
        {activeTab === 'CLIENTS' && (
            <div className="space-y-6 animate-in fade-in text-center py-20">
                <User size={64} className="mx-auto text-slate-200 mb-4"/>
                <h3 className="text-xl font-bold text-slate-500">Reportes de Clientes</h3>
                <p className="text-slate-400">
                    Visita el módulo <strong>"Gestión de Clientes"</strong> para ver análisis detallado de CRM, 
                    frecuencia de compra y segmentación.
                </p>
                <button onClick={() => setView('CLIENTS_DASHBOARD')} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700">Ir a Clientes</button>
            </div>
        )}

      </div>
    </div>
  );
};

// Componente auxiliar para Tabs
const TabButton = ({ label, active, onClick, icon: Icon }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors ${active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
    >
        <Icon size={18} /> {label}
    </button>
);