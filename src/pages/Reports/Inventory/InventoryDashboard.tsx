import React, { useEffect, useState } from 'react';
import { ArrowLeft, Package, AlertTriangle, TrendingDown, CheckCircle } from 'lucide-react';

// Servicios y Tipos
import { reportService, InventoryValueData } from '../../../services/reportService';

// Componentes Visuales y Utilerías
import { InventoryPieChart } from '../../../components/Reports/Charts/InventoryPieChart';
import { ExportButtons } from '../../../components/Reports/ExportButtons';

interface Props {
  onBack: () => void;
}

const InventoryDashboard: React.FC<Props> = ({ onBack }) => {
  // --- ESTADOS ---
  const [valuationData, setValuationData] = useState<InventoryValueData[]>([]);
  const [lowStockData, setLowStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [valuation, lowStock] = await Promise.all([
          reportService.getInventoryValuation(),
          reportService.getLowStockProducts()
        ]);
        setValuationData(valuation || []);
        setLowStockData(lowStock || []);
      } catch (error) {
        console.error("Error cargando inventario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- KPI CALCULATIONS ---
  const totalInversion = valuationData.reduce((acc, curr) => acc + Number(curr.total_cost_value), 0);
  const ventaPotencial = valuationData.reduce((acc, curr) => acc + Number(curr.potential_sale_value), 0);
  
  const money = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <div className="p-6 bg-slate-50 min-h-full animate-fade-in space-y-6">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
            <button onClick={onBack} className="mr-4 p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Control de Inventario</h1>
                <p className="text-slate-500 text-sm">Estado actual del almacén y valuación</p>
            </div>
        </div>
        
        {/* Botones de Exportación (Para la valuación) */}
        <div>
             <ExportButtons 
                data={valuationData} 
                fileName="Valuacion_Inventario"
                pdfTitle="Reporte de Valuación de Inventario"
                pdfHeaders={['Categoría', 'Items', 'Costo Total', 'Venta Potencial']}
                pdfMapping={(row) => [
                    row.category, 
                    row.total_items, 
                    `$${row.total_cost_value}`, 
                    `$${row.potential_sale_value}`
                ]}
            />
        </div>
      </div>

      {/* 2. TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500 flex justify-between items-center">
            <div>
                <p className="text-slate-500 text-sm font-medium">Inversión (Costo)</p>
                <p className="text-3xl font-bold text-slate-800">{loading ? "..." : money(totalInversion)}</p>
                <p className="text-xs text-slate-400 mt-1">Dinero "parado" en stock</p>
            </div>
            <Package className="text-indigo-200" size={32} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500 flex justify-between items-center">
            <div>
                <p className="text-slate-500 text-sm font-medium">Venta Potencial</p>
                <p className="text-3xl font-bold text-emerald-600">{loading ? "..." : money(ventaPotencial)}</p>
                <p className="text-xs text-emerald-600/70 mt-1">Si se vende todo hoy</p>
            </div>
            <TrendingDown className="text-emerald-200" size={32} />
        </div>

        <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 flex justify-between items-center ${lowStockData.length > 0 ? 'border-amber-500' : 'border-slate-200'}`}>
            <div>
                <p className="text-slate-500 text-sm font-medium">Alertas de Stock</p>
                <p className={`text-3xl font-bold ${lowStockData.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {loading ? "..." : lowStockData.length}
                </p>
                <p className="text-xs text-slate-400 mt-1">Productos por agotarse</p>
            </div>
            <AlertTriangle className={lowStockData.length > 0 ? 'text-amber-200' : 'text-slate-200'} size={32} />
        </div>
      </div>

      {/* 3. GRÁFICA Y STOCK BAJO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica Pastel */}
        <InventoryPieChart data={valuationData} />

        {/* Tabla Stock Bajo */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-[400px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-amber-50/50">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" />
                    Reabastecimiento Urgente
                </h3>
                <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    {lowStockData.length} items
                </span>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2">
                {loading ? (
                    <div className="text-center p-10 text-slate-400">Analizando stock...</div>
                ) : lowStockData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <CheckCircle size={40} className="mb-2 text-emerald-200" />
                        <p>Todo el inventario está saludable</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2">Producto</th>
                                <th className="px-4 py-2 text-center">Stock</th>
                                <th className="px-4 py-2 text-center">Min</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {lowStockData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[150px]" title={item.name}>
                                        {item.name}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {item.stock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-slate-500">{item.min_stock}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
      </div>
      
      {/* 4. TABLA DETALLADA DE VALUACIÓN */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-700">Valuación Detallada por Categoría</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                    <tr>
                        <th className="px-6 py-3">Categoría</th>
                        <th className="px-6 py-3 text-center">Total Artículos</th>
                        <th className="px-6 py-3 text-right">Costo Total (Inversión)</th>
                        <th className="px-6 py-3 text-right">Venta Total (Potencial)</th>
                        <th className="px-6 py-3 text-right">Margen Latente</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {valuationData.map((row, idx) => {
                        const margen = row.potential_sale_value - row.total_cost_value;
                        const margenPorc = row.total_cost_value > 0 ? (margen / row.total_cost_value) * 100 : 0;
                        return (
                            <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-700">{row.category || 'Sin Categoría'}</td>
                                <td className="px-6 py-4 text-center">{row.total_items}</td>
                                <td className="px-6 py-4 text-right font-medium text-slate-600">{money(row.total_cost_value)}</td>
                                <td className="px-6 py-4 text-right text-emerald-600">{money(row.potential_sale_value)}</td>
                                <td className="px-6 py-4 text-right text-purple-600 font-bold">{margenPorc.toFixed(1)}%</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;