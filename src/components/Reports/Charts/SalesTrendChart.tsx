import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  data: any[];
}

export const SalesTrendChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No hay datos para mostrar en este período
      </div>
    );
  }

  // Formateador para el eje X (Fechas)
  const formatXAxis = (tickItem: string) => {
    try {
      return format(parseISO(tickItem), 'dd MMM', { locale: es });
    } catch {
      return tickItem;
    }
  };

  // Formateador para el Tooltip (Moneda)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  };

  return (
    <div className="h-[400px] w-full bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-700 mb-4">Tendencia de Ingresos</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="period" 
            tickFormatter={formatXAxis} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(value) => `$${value / 1000}k`} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Monto']}
            labelFormatter={(label) => {
                try { return format(parseISO(label), 'eeee, dd MMMM yyyy', { locale: es }); }
                catch { return label; }
            }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Bar 
            dataKey="total_sales" 
            name="Ventas Totales" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
            barSize={40}
          />
          <Bar 
            dataKey="net_profit" 
            name="Utilidad Neta" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]} 
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};