import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, DollarSign, TrendingDown, Wallet } from 'lucide-react';
import { reportService, FinancialSummaryData, ExpenseCategoryData } from '../../../services/reportService';
import { FinanceChart } from '../../../components/Reports/Charts/FinanceChart';
import { ExportButtons } from '../../../components/Reports/ExportButtons';

interface Props {
  onBack: () => void;
}

const FinanceDashboard: React.FC<Props> = ({ onBack }) => {
  const [financeData, setFinanceData] = useState<FinancialSummaryData[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [finResult, expResult] = await Promise.all([
        reportService.getFinancialSummary(dateRange.start, dateRange.end),
        reportService.getExpensesByCategory(dateRange.start, dateRange.end)
      ]);
      setFinanceData(finResult || []);
      setExpenseData(expResult || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- CÁLCULOS KPI ---
  const totalIngresos = financeData.reduce((acc, curr) => acc + Number(curr.total_income), 0);
  const totalGastos = financeData.reduce((acc, curr) => acc + Number(curr.total_expenses), 0);
  const balanceNeto = totalIngresos - totalGastos;

  const money = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <div className="p-6 bg-slate-50 min-h-full animate-fade-in space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
            <button onClick={onBack} className="mr-4 p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Finanzas y Flujo</h1>
                <p className="text-slate-500 text-sm">Control de ingresos, gastos y balance</p>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
             <ExportButtons 
                data={financeData} 
                fileName="Reporte_Financiero"
                pdfTitle="Reporte de Flujo de Efectivo"
                pdfHeaders={['Fecha', 'Ingresos', 'Gastos', 'Balance']}
                pdfMapping={(row) => [row.period, `$${row.total_income}`, `$${row.total_expenses}`, `$${row.net_balance}`]}
            />
            {/* Selector de Fechas (Reutilizado) */}
            <div className="flex items-center gap-2 bg-white p-2 px-4 rounded-lg shadow-sm border border-slate-200">
                <Calendar size={18} className="text-slate-400"/>
                <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="text-sm outline-none bg-transparent"/>
                <span className="text-slate-400">➜</span>
                <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="text-sm outline-none bg-transparent"/>
            </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium">Ingresos Totales</p>
            <div className="flex justify-between items-center mt-2">
                <h3 className="text-3xl font-bold text-emerald-600">{money(totalIngresos)}</h3>
                <DollarSign className="text-emerald-100 bg-emerald-50 rounded p-1" size={32} />
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium">Gastos Operativos</p>
            <div className="flex justify-between items-center mt-2">
                <h3 className="text-3xl font-bold text-red-500">{money(totalGastos)}</h3>
                <TrendingDown className="text-red-100 bg-red-50 rounded p-1" size={32} />
            </div>
        </div>

        <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${balanceNeto >= 0 ? 'border-blue-500' : 'border-red-500'}`}>
            <p className="text-slate-500 text-sm font-medium">Balance Neto</p>
            <div className="flex justify-between items-center mt-2">
                <h3 className={`text-3xl font-bold ${balanceNeto >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {money(balanceNeto)}
                </h3>
                <Wallet className="text-slate-400" size={32} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
                {balanceNeto >= 0 ? "Flujo de caja positivo" : "Atención: Gastos superan ingresos"}
            </p>
        </div>
      </div>

      {/* GRÁFICA Y DETALLES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica Principal (2/3) */}
        <div className="lg:col-span-2">
            {loading ? <div className="h-[400px] flex items-center justify-center bg-white rounded-lg">Cargando...</div> : <FinanceChart data={financeData} />}
        </div>

        {/* Lista de Gastos (1/3) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4">Gastos por Categoría</h3>
            <div className="space-y-4">
                {expenseData.length === 0 ? (
                    <p className="text-slate-400 text-center py-10">No hay gastos registrados</p>
                ) : (
                    expenseData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-red-400 rounded-full"></div>
                                <span className="font-medium text-slate-700">{item.category}</span>
                            </div>
                            <span className="font-bold text-slate-800">{money(Number(item.total_amount))}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

    </div>
  );
};

export default FinanceDashboard;