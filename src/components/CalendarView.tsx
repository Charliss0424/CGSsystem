import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Truck, DollarSign } from 'lucide-react';
import { CalendarEvent } from '../types';

interface CalendarViewProps {
  onBack: () => void;
}

const events: CalendarEvent[] = [
  { id: '1', title: 'Entrega Tech Solutions', date: '2023-10-25', type: 'Delivery' },
  { id: '2', title: 'Pago Office Depot', date: '2023-10-26', type: 'Payment' },
  { id: '3', title: 'Reunión Proveedores', date: '2023-10-28', type: 'Meeting' },
];

const CalendarView: React.FC<CalendarViewProps> = ({ onBack }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentMonth = "Octubre 2023";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Calendario de Compras</h1>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
          <button className="p-1 hover:bg-slate-100 rounded"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
          <span className="px-4 font-medium text-slate-700">{currentMonth}</span>
          <button className="p-1 hover:bg-slate-100 rounded"><ChevronRight className="w-5 h-5 text-slate-500" /></button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-7 gap-4 mb-4 text-center text-sm font-semibold text-slate-400">
          <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {/* Empty slots for start of month alignment (mock) */}
          <div className="h-32 bg-slate-50 rounded-lg opacity-50"></div>
          <div className="h-32 bg-slate-50 rounded-lg opacity-50"></div>

          {days.map(day => {
            // Very simple date matching logic for demo purposes
            const dayEvents = events.filter(e => parseInt(e.date.split('-')[2]) === day);
            
            return (
              <div key={day} className="h-32 border border-slate-100 rounded-lg p-2 hover:border-emerald-200 transition-colors relative">
                <span className="text-sm font-medium text-slate-500">{day}</span>
                <div className="mt-2 space-y-1">
                  {dayEvents.map(event => (
                    <div key={event.id} className={`text-xs p-1.5 rounded border flex items-center gap-1
                      ${event.type === 'Delivery' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                        event.type === 'Payment' ? 'bg-green-50 border-green-100 text-green-700' : 
                        'bg-purple-50 border-purple-100 text-purple-700'}`}>
                      {event.type === 'Delivery' && <Truck className="w-3 h-3" />}
                      {event.type === 'Payment' && <DollarSign className="w-3 h-3" />}
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;