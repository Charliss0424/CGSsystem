import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  data: any[];
}

export const FinanceChart: React.FC<Props> = ({ data }) => {
  const money = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-[400px]">
      <h3 className="text-lg font-bold text-slate-700 mb-4">Flujo de Efectivo (Ingresos vs Gastos)</h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="period" 
            tickFormatter={(str) => format(parseISO(str), 'dd MMM', { locale: es })}
            tick={{ fontSize: 12 }} 
          />
          <YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => money(value)} />
          <Legend />
          <Bar dataKey="total_income" name="Ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="total_expenses" name="Gastos" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};