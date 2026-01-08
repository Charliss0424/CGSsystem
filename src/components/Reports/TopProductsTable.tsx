import React from 'react';
import { TopProductData } from '../../services/reportService';

interface Props {
  data: TopProductData[];
  loading: boolean;
}

export const TopProductsTable: React.FC<Props> = ({ data, loading }) => {
  // Encontrar el valor máximo para calcular el ancho de la barra (100%)
  const maxRevenue = data.length > 0 ? Math.max(...data.map(d => d.total_revenue)) : 0;

  const money = (val: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-full">
      <h3 className="text-lg font-bold text-slate-700 mb-4">🏆 Productos Más Vendidos</h3>
      
      <div className="overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3 text-right">Cant.</th>
              <th className="px-4 py-3 text-right">Venta Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr><td colSpan={3} className="p-4 text-center text-slate-400">Calculando ranking...</td></tr>
            ) : data.length === 0 ? (
               <tr><td colSpan={3} className="p-4 text-center text-slate-400">Sin datos</td></tr>
            ) : (
              data.map((item, idx) => {
                // Calcular porcentaje para la barra visual
                const percentage = maxRevenue > 0 ? (item.total_revenue / maxRevenue) * 100 : 0;
                
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 align-middle relative">
                      {/* Nombre del producto */}
                      <div className="font-medium text-slate-800 z-10 relative truncate max-w-[180px]" title={item.product_name}>
                        {idx + 1}. {item.product_name}
                      </div>
                      
                      {/* Barra de progreso visual (Fondo sutil) */}
                      <div 
                        className="absolute bottom-1 left-4 h-1 bg-blue-500/20 rounded-full transition-all duration-500"
                        style={{ width: `${percentage * 0.6}%` }} // *0.6 para que no ocupe toda la celda
                      ></div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {item.quantity_sold} u.
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700 group-hover:text-blue-600">
                      {money(item.total_revenue)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-right">
        <button className="text-xs text-blue-600 hover:underline font-medium">Ver catálogo completo →</button>
      </div>
    </div>
  );
};