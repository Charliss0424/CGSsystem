import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { DollarSign, ShoppingBag, Package, TrendingUp, Sparkles, Loader, ArrowLeft } from 'lucide-react';
import { analyzeSalesData } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ViewState } from '../types';

interface ReportsProps {
    onBack: () => void;
}

export const Reports: React.FC<ReportsProps> = ({ onBack }) => {
  const { sales, products } = useDatabase();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Calculate Metrics
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalOrders = sales.length;
  const lowStockCount = products.filter(p => p.stock < 5).length;
  
  // Calculate today's sales
  const today = new Date().toISOString().split('T')[0];
  const todaysRevenue = sales
    .filter(s => s.date.startsWith(today))
    .reduce((sum, s) => sum + s.total, 0);

  // Prepare Chart Data
  const chartData = sales.slice(0, 7).map(s => ({
    name: new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    amount: s.total
  })).reverse();

  const handleAiAnalysis = async () => {
    setAnalyzing(true);
    const result = await analyzeSalesData(sales, products);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Reportes y Estadísticas</h2>
          <p className="text-slate-500 mt-1">Análisis detallado del rendimiento de tu negocio.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ventas Totales" 
          value={`$${totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Transacciones" 
          value={totalOrders.toString()} 
          icon={ShoppingBag} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Ventas Hoy" 
          value={`$${todaysRevenue.toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Stock Bajo" 
          value={lowStockCount.toString()} 
          icon={Package} 
          color="bg-orange-500" 
          alert={lowStockCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Tendencia de Ventas Recientes</h3>
          <div className="h-64 w-full">
            {sales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(value) => `$${value}`} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                    No hay datos de ventas suficientes.
                </div>
            )}
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-blue-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 bg-indigo-500/30 rounded-lg">
                    <Sparkles className="text-yellow-300" size={24} />
                </div>
                <h3 className="text-xl font-bold">Asistente IA</h3>
            </div>
            
            <p className="text-indigo-200 mb-6 text-sm relative z-10">
                Obtén análisis instantáneos sobre el rendimiento de tu tienda impulsados por Gemini.
            </p>

            {!aiAnalysis ? (
                <button 
                    onClick={handleAiAnalysis}
                    disabled={analyzing}
                    className="w-full py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 relative z-10 disabled:opacity-70"
                >
                    {analyzing ? <Loader className="animate-spin" size={20}/> : <Sparkles size={20} />}
                    {analyzing ? 'Analizando...' : 'Generar Reporte'}
                </button>
            ) : (
                <div className="bg-white/10 p-4 rounded-xl text-sm leading-relaxed backdrop-blur-sm animate-fade-in relative z-10">
                    <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: aiAnalysis }} />
                    <button 
                        onClick={() => setAiAnalysis(null)}
                        className="mt-4 text-xs text-indigo-300 hover:text-white underline"
                    >
                        Generar nuevo reporte
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, alert }: any) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md ${alert ? 'border-orange-200 bg-orange-50' : 'border-slate-100'}`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={alert ? 'text-orange-500' : color.replace('bg-', 'text-')} size={24} />
      </div>
      {alert && <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>}
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className={`text-2xl font-bold mt-1 ${alert ? 'text-orange-700' : 'text-slate-800'}`}>{value}</p>
  </div>
);