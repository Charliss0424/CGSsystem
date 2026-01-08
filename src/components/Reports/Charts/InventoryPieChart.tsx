import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: any[];
}

// Colores profesionales para las categorías
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

export const InventoryPieChart: React.FC<Props> = ({ data }) => {
  
  const money = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-[400px]">
      <h3 className="text-lg font-bold text-slate-700 mb-2">Valor de Inventario por Categoría</h3>
      
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-slate-400">Sin datos de inventario</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60} // Efecto Donut
              outerRadius={100}
              paddingAngle={5}
              dataKey="total_cost_value" // Graficamos por VALOR ($), no por cantidad
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => money(value)}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};