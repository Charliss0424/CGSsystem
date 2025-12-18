import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Truck, DollarSign, Package, Plus } from 'lucide-react';
import { supabase } from '../services/supabase';
import { CalendarEvent } from '../types';
import { NewExpenseModal } from './NewExpenseModal';

export type CalendarMode = 'PURCHASES' | 'SALES' | 'FINANCE';

interface CalendarWidgetProps {
  mode: CalendarMode;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ mode }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);

  // Configuración dinámica según el modo
  const config = {
    PURCHASES: {
      title: 'Calendario de Recepciones',
      viewName: 'view_calendar_purchases',
      color: 'text-emerald-600',
      headerBg: 'bg-emerald-50',
      icon: <Truck className="text-emerald-600" />,
      description: 'Programación de llegada de mercancía.'
    },
    SALES: {
      title: 'Calendario de Entregas',
      viewName: 'view_calendar_sales',
      color: 'text-blue-600',
      headerBg: 'bg-blue-50',
      icon: <Package className="text-blue-600" />,
      description: 'Pedidos de clientes pendientes de entrega.'
    },
    FINANCE: {
      title: 'Agenda Financiera',
      viewName: 'view_calendar_finance',
      color: 'text-purple-600',
      headerBg: 'bg-purple-50',
      icon: <DollarSign className="text-purple-600" />,
      description: 'Cuentas por pagar, cobrar y gastos operativos.'
    }
  }[mode];

  useEffect(() => {
    fetchEvents();
  }, [currentDate, mode]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(config.viewName as any)
        .select('*');
      
      if (error) {
        console.error("Error cargando calendario:", error);
        return;
      }
      
      if (data) {
        const formattedEvents: CalendarEvent[] = data.map((item: any) => ({
          event_id: item.event_id,
          type: item.type,
          title: item.title,
          start_date: item.start_date,
          amount: item.amount || 0,
          supplier_id: item.supplier_id
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error("Error inesperado:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE FECHAS ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const daysArray = Array.from({ length: days }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(new Date(newDate));
  };

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const eDate = new Date(e.start_date); 
      return (
        eDate.getDate() === day &&
        eDate.getMonth() === currentDate.getMonth() &&
        eDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const renderEventPill = (event: CalendarEvent) => {
    let styles = 'bg-slate-100 text-slate-600 border-slate-200';
    
    switch (event.type) {
      case 'delivery': 
        styles = 'bg-emerald-100 text-emerald-700 border-emerald-200'; 
        break;
      case 'shipping': 
        styles = 'bg-blue-100 text-blue-700 border-blue-200'; 
        break;
      case 'payable': 
        styles = 'bg-red-100 text-red-700 border-red-200'; 
        break;
      case 'expense': 
        styles = 'bg-orange-100 text-orange-700 border-orange-200'; 
        break;
      case 'receivable': 
        styles = 'bg-green-100 text-green-700 border-green-200'; 
        break;
      default: 
        styles = 'bg-slate-100 text-slate-600 border-slate-200';
    }

    return (
      <div 
        key={event.event_id} 
        className={`text-[10px] px-1.5 py-1 rounded border mb-1 truncate cursor-pointer hover:opacity-80 font-medium flex justify-between items-center ${styles}`} 
        title={event.title}
      >
        <span className="truncate flex-1">{event.title}</span>
        {mode === 'FINANCE' && event.amount > 0 && (
          <span className="font-bold text-[9px] ml-1">
            ${event.amount.toLocaleString('es-MX')}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* HEADER */}
      <div className={`p-4 border-b border-slate-100 flex justify-between items-center ${config.headerBg}`}>
        <div>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${config.color}`}>
            {config.icon} {config.title}
          </h2>
          <p className="text-xs text-slate-500">{config.description}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-slate-200 p-1">
          <button 
            onClick={() => changeMonth(-1)} 
            className="p-1 hover:bg-slate-100 rounded text-slate-500"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-bold text-slate-700 w-32 text-center select-none capitalize">
            {currentDate.toLocaleDateString('es-ES', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
          <button 
            onClick={() => changeMonth(1)} 
            className="p-1 hover:bg-slate-100 rounded text-slate-500"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* GRID ENCABEZADOS */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* GRID DÍAS */}
      <div className="flex-1 grid grid-cols-7 overflow-y-auto">
        {emptyDays.map((_, i) => (
          <div 
            key={`empty-${i}`} 
            className="bg-slate-50/50 border-b border-r border-slate-100 min-h-[80px]" 
          />
        ))}
        
        {daysArray.map(day => {
          const dayEvents = getEventsForDay(day);
          const isToday = day === new Date().getDate() && 
                          currentDate.getMonth() === new Date().getMonth() &&
                          currentDate.getFullYear() === new Date().getFullYear();
          
          return (
            <div 
              key={day} 
              className={`border-b border-r border-slate-100 p-1 min-h-[80px] hover:bg-slate-50 transition-colors ${
                isToday ? 'bg-yellow-50' : ''
              }`}
            >
              <div className="text-right mb-1">
                <span className={`text-xs font-bold px-1.5 rounded-full ${
                  isToday ? 'bg-yellow-400 text-yellow-900' : 'text-slate-400'
                }`}>
                  {day}
                </span>
              </div>
              <div className="space-y-0.5">
                {loading ? (
                  <div className="h-4 w-full bg-slate-100 rounded animate-pulse mb-1"></div>
                ) : (
                  dayEvents.map(renderEventPill)
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Botón rápido para Finanzas */}
      {mode === 'FINANCE' && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button 
            onClick={() => setShowExpenseModal(true)}
            className="text-xs bg-slate-900 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            <Plus size={14} /> Registrar Gasto Operativo
          </button>
        </div>
      )}

      {/* MODAL DE GASTOS */}
      <NewExpenseModal 
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSave={() => {
          fetchEvents();
        }}
      />
    </div>
  );
};