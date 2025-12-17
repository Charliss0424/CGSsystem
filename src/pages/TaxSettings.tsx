import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Percent, FileText, CheckCircle } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ViewState } from '../types';

export const TaxSettings = ({ setView }: { setView: (v: ViewState) => void }) => {
  const { taxes, addTax, deleteTax } = useDatabase();
  
  // Estado para el formulario de nuevo impuesto
  const [newTax, setNewTax] = useState({ name: '', rate: '', code: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTax.name || newTax.rate === '') return alert("Nombre y Tasa son obligatorios");
    
    await addTax(newTax.name, parseFloat(newTax.rate), newTax.code);
    setNewTax({ name: '', rate: '', code: '' }); // Limpiar
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setView('DASHBOARD')} className="p-2 hover:bg-white rounded-full transition-colors text-slate-500">
                <ArrowLeft size={24}/>
            </button>
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Configuración de Impuestos</h1>
                <p className="text-slate-500">Administra las tasas fiscales aplicables (IVA, IEPS, Retenciones).</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMNA IZQUIERDA: FORMULARIO */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-purple-600"/> Nuevo Impuesto
                </h2>
                
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Impuesto</label>
                        <input 
                            value={newTax.name}
                            onChange={e => setNewTax({...newTax, name: e.target.value})}
                            className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-purple-500 transition-colors"
                            placeholder="Ej. IEPS Bebidas"
                            autoFocus
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tasa / Porcentaje</label>
                        <div className="relative">
                            <input 
                                type="number"
                                step="0.01"
                                value={newTax.rate}
                                onChange={e => setNewTax({...newTax, rate: e.target.value})}
                                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-purple-500 transition-colors font-bold text-slate-800"
                                placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código SAT / Interno (Opcional)</label>
                        <input 
                            value={newTax.code}
                            onChange={e => setNewTax({...newTax, code: e.target.value.toUpperCase()})}
                            className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-purple-500 transition-colors uppercase font-mono text-sm"
                            placeholder="Ej. IEPS_8"
                        />
                    </div>

                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
                        <Save size={18}/> Agregar Impuesto
                    </button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl text-blue-700 text-xs leading-relaxed flex gap-2">
                    <FileText size={32} className="shrink-0"/>
                    <p>Estos impuestos estarán disponibles en el <strong>Catálogo de Productos</strong>. Podrás asignar uno o varios a cada producto individualmente.</p>
                </div>
            </div>

            {/* COLUMNA DERECHA: LISTA */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700">Tasas Activas</h3>
                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{taxes.length} Registros</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {taxes.length === 0 ? (
                            <div className="p-10 text-center text-slate-400">No hay impuestos configurados.</div>
                        ) : (
                            taxes.map((tax) => (
                                <div key={tax.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold border border-purple-100">
                                            {tax.rate}%
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{tax.name}</p>
                                            <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                                                <span>Código: {tax.code || 'N/A'}</span>
                                                <span className="text-green-600 flex items-center gap-1 bg-green-50 px-1.5 rounded"><CheckCircle size={10}/> Activo</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => { if(confirm("¿Eliminar este impuesto?")) deleteTax(tax.id); }}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Eliminar Impuesto"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};