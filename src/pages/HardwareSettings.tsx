import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Store, Save, Phone } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

export const HardwareSettings = ({ setView }: any) => {
  const { settings, updateSettings } = useDatabase();
  const [formData, setFormData] = useState({ storeName: '', address: '', phone: '', ticketFooter: '' });

  useEffect(() => {
    if (settings) setFormData({ storeName: settings.storeName, address: settings.address, phone: settings.phone, ticketFooter: settings.ticketFooter });
  }, [settings]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-800">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2"><Printer/> Datos de Impresión y Tienda</h1>
            <button onClick={() => setView('DASHBOARD')}><X/></button>
        </div>
        <div className="p-8 space-y-6">
            <div><label className="font-bold block mb-1 text-sm">Nombre del Negocio</label><input className="w-full p-3 border rounded-lg" value={formData.storeName} onChange={e=>setFormData({...formData, storeName: e.target.value})}/></div>
            <div><label className="font-bold block mb-1 text-sm">Dirección</label><input className="w-full p-3 border rounded-lg" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})}/></div>
            <button onClick={() => updateSettings(formData)} className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold">Guardar</button>
        </div>
      </div>
    </div>
  );
};