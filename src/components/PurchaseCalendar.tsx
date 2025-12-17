import React from 'react';
import { Calendar, Plus, Clock, CheckCircle } from 'lucide-react';

interface PurchaseCalendarProps {
  onDateSelect: (date: string) => void;
}

export const PurchaseCalendar: React.FC<PurchaseCalendarProps> = ({ onDateSelect }) => {
  const today = new Date();
  const events = [
    { date: '2024-01-20', title: 'Entrega Bosch', type: 'delivery', supplier: 'Bosch México' },
    { date: '2024-01-22', title: 'Pago a proveedor', type: 'payment', supplier: 'Delphi' },
    { date: '2024-01-25', title: 'Recepción programada', type: 'receiving', supplier: 'Mopar' }
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="text-emerald-600"/>
                Calendario de Compras
              </h3>
              <p className="text-sm text-slate-500">Programación y recordatorios</p>
            </div>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
              <Plus size={16}/>
              Nuevo Recordatorio
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="text-center font-bold text-slate-600 text-sm py-2">
                {day}
              </div>
            ))}
            
            {/* Días del mes (ejemplo simplificado) */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
              const date = `2024-01-${day.toString().padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.date === date);
              const isToday = day === today.getDate();
              
              return (
                <div 
                  key={day}
                  className={`min-h-24 p-2 border border-slate-200 rounded-lg cursor-pointer hover:border-emerald-300 hover:bg-emerald-50 ${
                    isToday ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => onDateSelect(date)}
                >
                  <div className="flex justify-between items-start">
                    <span className={`font-bold ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                  
                  {dayEvents.map((event, idx) => (
                    <div key={idx} className="mt-1 text-xs p-1 rounded bg-slate-100 truncate">
                      <div className="flex items-center gap-1">
                        {event.type === 'delivery' && <Clock size={10} className="text-amber-500"/>}
                        {event.type === 'receiving' && <CheckCircle size={10} className="text-emerald-500"/>}
                        <span className="truncate">{event.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="flex gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span>Entregas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Recepciones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Pagos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};