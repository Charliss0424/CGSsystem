import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, TrendingUp, DollarSign, Percent } from 'lucide-react';

// Servicios y Tipos
import { reportService, SalesReportData, TopProductData } from '../../../services/reportService';

// Componentes Visuales y Utilerías
import { SalesTrendChart } from '../../../components/Reports/Charts/SalesTrendChart';
import { TopProductsTable } from '../../../components/Reports/TopProductsTable';
import { ExportButtons } from '../../../components/Reports/ExportButtons';

interface Props {
  onBack: () => void;
}

const SalesDashboard: React.FC<Props> = ({ onBack }) => {
  // --- ESTADOS ---
  const [salesData, setSalesData] = useState<SalesReportData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para fechas: (Default: Del día 1 del mes actual hasta hoy)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // --- EFECTO DE CARGA ---
  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Carga paralela de datos
      const [salesResult, topResult] = await Promise.all([
        reportService.getSalesReport(dateRange.start, dateRange.end),
        reportService.getTopProducts(dateRange.start, dateRange.end, 5) // Top 5
      ]);

      setSalesData(salesResult || []);
      setTopProducts(topResult || []);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- CÁLCULOS DE KPIs ---
  const totalVentas = salesData.reduce((acc, curr) => acc + Number(curr.total_sales), 0);
  const totalUtilidad = salesData.reduce((acc, curr) => acc + Number(curr.net_profit), 0);
  const totalTransacciones = salesData.reduce((acc, curr) => acc + Number(curr.transaction_count), 0);
  const margenPromedio = totalVentas > 0 ? ((totalUtilidad / totalVentas) * 100) : 0;

  // Formateador de moneda
  const money = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <div className="p-6 bg-slate-50 min-h-full animate-fade-in space-y-6">
      
      {/* 1. HEADER Y CONTROLES */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center">
            <button 
              onClick={onBack} 
              className="mr-4 p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
              title="Volver al menú"
            >
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard de Ventas</h1>
                <p className="text-slate-500 text-sm">Resumen financiero y operativo</p>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            {/* Botones Exportar */}
            <ExportButtons 
                data={salesData} 
                fileName="Reporte_Ventas"
                pdfTitle={`Reporte de Ventas (${dateRange.start} al ${dateRange.end})`}
                pdfHeaders={['Fecha', 'Transacciones', 'Venta Total', 'Costo', 'Utilidad']}
                pdfMapping={(row) => [
                    row.period, 
                    row.transaction_count, 
                    `$${row.total_sales}`, 
                    `$${row.total_cost}`, 
                    `$${row.net_profit}`
                ]}
            />

            {/* Selector de Fechas */}
            <div className="flex items-center gap-2 bg-white p-2 px-4 rounded-lg shadow-sm border border-slate-200">
                <Calendar size={18} className="text-slate-400"/>
                <div className="flex items-center gap-2">
                    <input 
                        type="date" 
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        className="text-sm font-medium text-slate-700 outline-none cursor-pointer bg-transparent"
                    />
                    <span className="text-slate-400">➜</span>
                    <input 
                        type="date" 
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        className="text-sm font-medium text-slate-700 outline-none cursor-pointer bg-transparent"
                    />
                </div>
            </div>
        </div>
      </div>

      {/* 2. TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-slate-500 font-medium text-sm mb-1">Ventas Totales</p>
                <h3 className="text-3xl font-bold text-slate-800">{loading ? "..." : money(totalVentas)}</h3>
                <p className="text-xs text-slate-400 mt-2">{totalTransacciones} transacciones</p>
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={28} /></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-slate-500 font-medium text-sm mb-1">Utilidad Neta</p>
                <h3 className="text-3xl font-bold text-emerald-600">{loading ? "..." : money(totalUtilidad)}</h3>
                <p className="text-xs text-emerald-600/70 mt-2 font-medium">Ganancia real</p>
            </div>
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={28} /></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-slate-500 font-medium text-sm mb-1">Margen Promedio</p>
                <h3 className="text-3xl font-bold text-purple-600">{loading ? "..." : `${margenPromedio.toFixed(1)}%`}</h3>
                <p className="text-xs text-slate-400 mt-2">Rentabilidad global</p>
            </div>
            <div className="p-4 bg-purple-50 text-purple-600 rounded-lg"><Percent size={28} /></div>
        </div>
      </div>

      {/* 3. GRÁFICA Y TOP PRODUCTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           {loading ? (
             <div className="h-[400px] bg-white rounded-lg border border-slate-100 animate-pulse flex items-center justify-center text-slate-400">
                Cargando gráfica...
             </div>
           ) : (
             <SalesTrendChart data={salesData} />
           )}
        </div>
        <div className="lg:col-span-1 h-full">
           <TopProductsTable data={topProducts} loading={loading} />
        </div>
      </div>

      {/* 4. TABLA DETALLADA */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-700">Desglose Diario</h3>
        </div>
        <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm text-left relative">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-3">Fecha</th>
                        <th className="px-6 py-3 text-right">Transacciones</th>
                        <th className="px-6 py-3 text-right">Ingreso</th>
                        <th className="px-6 py-3 text-right">Costo</th>
                        <th className="px-6 py-3 text-right">Utilidad</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">Cargando datos...</td></tr>
                    ) : salesData.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">No hay movimientos en este rango.</td></tr>
                    ) : (
                        salesData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{row.period}</td>
                                <td className="px-6 py-4 text-right">{row.transaction_count}</td>
                                <td className="px-6 py-4 text-right font-medium text-blue-600">{money(Number(row.total_sales))}</td>
                                <td className="px-6 py-4 text-right text-slate-500">{money(Number(row.total_cost))}</td>
                                <td className="px-6 py-4 text-right font-bold text-emerald-600">{money(Number(row.net_profit))}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;