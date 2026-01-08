import { useEffect, useState } from 'react';
import { ReportLayout } from '../../components/reports/ReportLayout';
import { ReportService } from '../../services/reportService';
import { SalesSummary } from '../../types/reportTypes';
// Recomiendo usar librerías como 'recharts' para gráficas
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const SalesReports = () => {
  const [data, setData] = useState<SalesSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (dates: any) => {
    setLoading(true);
    try {
      // Aquí simulo fechas, pero vendrían del filtro
      const result = await ReportService.getSalesByPeriod({ 
        startDate: new Date('2024-01-01'), 
        endDate: new Date() 
      });
      setData(result);
    } catch (error) {
      console.error("Error cargando reporte", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(null);
  }, []);

  return (
    <ReportLayout title="Reporte General de Ventas">
      {loading ? (
        <p>Calculando métricas...</p>
      ) : (
        <div className="space-y-8">
          {/* Sección de Gráfica */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_sales" fill="#4F46E5" name="Ventas ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sección de Tabla (Resumen) */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ventas Totales</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Utilidad</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">{row.period}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">${row.total_sales.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-green-600 font-bold">${row.total_profit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReportLayout>
  );
};