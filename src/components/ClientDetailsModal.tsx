import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, ShoppingBag, FileText, DollarSign, Calendar, Clock, CreditCard } from 'lucide-react';
import { Client } from '../types';
import { useDatabase } from '../context/DatabaseContext';

interface Props {
  client: Client;
  onClose: () => void;
}

type DetailTab = 'resumen' | 'pedidos' | 'historial' | 'facturas';

export const ClientDetailsModal: React.FC<Props> = ({ client, onClose }) => {
  const { orders, sales } = useDatabase();
  const [activeTab, setActiveTab] = useState<DetailTab>('resumen');

  // Filtrar datos relacionados al cliente (usamos ID y fallback a nombre)
  const clientOrders = orders.filter(o => o.customerName.includes(client.name)); // Ajustar lógica según tus IDs reales
  const clientSales = sales.filter(s => s.clientId === client.id || s.customerName === client.name);

  // Calcular métricas financieras
  const totalSpent = clientSales.reduce((acc, curr) => acc + curr.total, 0);
  const lastPurchaseDate = clientSales.length > 0 ? new Date(clientSales[0].date).toLocaleDateString() : 'N/A';
  const pendingOrdersCount = clientOrders.filter(o => o.status !== 'DELIVERED').length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* HEADER PRINCIPAL */}
        <div className="bg-slate-50 p-6 border-b border-gray-200 flex justify-between items-start">
          <div className="flex gap-5 items-center">
            {/* Avatar con Iniciales */}
            <div className={`h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-sm
                ${client.level === 'WHOLESALE' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
              {client.name.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {client.name}
                {client.parentId && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full uppercase tracking-wider">Sucursal</span>}
              </h2>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1"><Mail size={14}/> {client.email || 'Sin correo'}</span>
                <span className="flex items-center gap-1"><Phone size={14}/> {client.phone || 'Sin teléfono'}</span>
                <span className="flex items-center gap-1"><MapPin size={14}/> {client.city || 'Ubicación desconocida'}</span>
              </div>

              <div className="flex gap-2 mt-3">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold border ${client.level === 'WHOLESALE' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    NIVEL: {client.level === 'WHOLESALE' ? 'MAYORISTA VIP' : 'ESTÁNDAR'}
                 </span>
                 <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                    <CreditCard size={12}/> LÍMITE: ${client.creditLimit?.toLocaleString() || 0}
                 </span>
              </div>
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* TABS DE NAVEGACIÓN */}
        <div className="flex border-b border-gray-200 px-6 bg-white shrink-0">
          {[
            { id: 'resumen', label: 'Resumen 360°', icon: User },
            { id: 'pedidos', label: `Pedidos Activos (${pendingOrdersCount})`, icon: ShoppingBag },
            { id: 'historial', label: 'Historial Ventas', icon: Clock },
            { id: 'facturas', label: 'Facturación / RFC', icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DetailTab)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          
          {/* 1. VISTA RESUMEN (DASHBOARD CLIENTE) */}
          {activeTab === 'resumen' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Tarjeta Saldo */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-3 lg:col-span-1">
                 <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Saldo Actual</h3>
                 <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-800">${client.currentBalance?.toLocaleString() || '0.00'}</span>
                    <span className="text-sm text-gray-400">MXN</span>
                 </div>
                 <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (client.currentBalance / client.creditLimit) * 100)}%` }}></div>
                 </div>
                 <p className="text-xs text-gray-400 mt-2 text-right">
                    {(client.creditLimit - client.currentBalance).toLocaleString()} disponible
                 </p>
              </div>

              {/* KPIs Rápidos */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-3 lg:col-span-2 grid grid-cols-3 gap-4">
                 <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs text-green-600 font-bold uppercase mb-1">Total Comprado</p>
                    <p className="text-2xl font-bold text-gray-800">${totalSpent.toLocaleString()}</p>
                 </div>
                 <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-xs text-purple-600 font-bold uppercase mb-1">Días Crédito</p>
                    <p className="text-2xl font-bold text-gray-800">{client.paymentDays || 0} días</p>
                 </div>
                 <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="text-xs text-orange-600 font-bold uppercase mb-1">Última Visita</p>
                    <p className="text-lg font-bold text-gray-800 truncate">{lastPurchaseDate}</p>
                 </div>
              </div>

              {/* Dirección y Mapa */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-2">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="text-red-500" size={18}/> Dirección de Entrega
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed p-4 bg-gray-50 rounded-xl border border-gray-200">
                    {client.address || `${client.street} ${client.exteriorNumber}, ${client.colony}, ${client.city}, ${client.state}`}
                </p>
                <div className="mt-4 flex gap-2">
                    <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                        Ver en Google Maps
                    </button>
                </div>
              </div>

              {/* Notas */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                 <h3 className="font-bold text-gray-800 mb-2">Notas Internas</h3>
                 <p className="text-sm text-gray-500 italic bg-yellow-50 p-3 rounded-lg border border-yellow-100 h-32 overflow-y-auto">
                    {client.notes || 'No hay notas registradas para este cliente.'}
                 </p>
              </div>
            </div>
          )}

          {/* 2. VISTA PEDIDOS ACTIVOS */}
          {activeTab === 'pedidos' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
               <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-200">
                    <tr>
                      <th className="p-4">Folio</th>
                      <th className="p-4">Fecha Entrega</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4">Progreso</th>
                      <th className="p-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientOrders.length === 0 ? (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-400">Este cliente no tiene pedidos en curso.</td></tr>
                    ) : (
                        clientOrders.map(order => (
                            <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="p-4 font-mono font-bold text-blue-600">#{order.orderFolio}</td>
                                <td className="p-4 text-gray-600">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border
                                        ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                                          order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                          order.status === 'READY' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                          'bg-green-100 text-green-700 border-green-200'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full ${order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-blue-500'}`} 
                                             style={{width: order.status === 'DELIVERED' ? '100%' : order.status === 'READY' ? '75%' : '25%'}}></div>
                                    </div>
                                </td>
                                <td className="p-4 text-right font-bold text-gray-800">${order.total.toLocaleString()}</td>
                            </tr>
                        ))
                    )}
                  </tbody>
               </table>
            </div>
          )}

          {/* 3. VISTA HISTORIAL VENTAS */}
          {activeTab === 'historial' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
               <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b border-gray-200">
                    <tr>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Método Pago</th>
                      <th className="p-4">Artículos</th>
                      <th className="p-4 text-right">Total</th>
                      <th className="p-4 text-center">Ticket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clientSales.length === 0 ? (
                        <tr><td colSpan={5} className="p-10 text-center text-gray-400">No hay historial de ventas cerradas.</td></tr>
                    ) : (
                        clientSales.map(sale => (
                            <tr key={sale.id} className="hover:bg-gray-50">
                                <td className="p-4 text-gray-600">{new Date(sale.date).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(sale.date).toLocaleTimeString()}</span></td>
                                <td className="p-4"><span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-medium">{sale.paymentMethod}</span></td>
                                <td className="p-4 text-gray-500">{sale.items.length} productos</td>
                                <td className="p-4 text-right font-bold text-gray-800">${sale.total.toLocaleString()}</td>
                                <td className="p-4 text-center"><button className="text-blue-600 hover:underline text-xs font-bold">Ver PDF</button></td>
                            </tr>
                        ))
                    )}
                  </tbody>
               </table>
            </div>
          )}

          {/* 4. VISTA FACTURAS (Placeholder) */}
          {activeTab === 'facturas' && (
             <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border-2 border-dashed border-gray-300 animate-in fade-in">
                <div className="bg-blue-50 p-4 rounded-full mb-4">
                    <FileText size={32} className="text-blue-400"/>
                </div>
                <h3 className="text-lg font-bold text-gray-700">Datos Fiscales</h3>
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 w-full max-w-md">
                   <div className="flex justify-between py-2 border-b border-gray-200">
                       <span className="text-gray-500 text-sm">RFC:</span>
                       <span className="font-mono font-bold text-gray-800">{client.rfc || 'XAXX010101000'}</span>
                   </div>
                   <div className="flex justify-between py-2 border-b border-gray-200">
                       <span className="text-gray-500 text-sm">Razón Social:</span>
                       <span className="font-bold text-gray-800">{client.name}</span>
                   </div>
                   <div className="flex justify-between py-2">
                       <span className="text-gray-500 text-sm">Régimen:</span>
                       <span className="font-bold text-gray-800">601 - General de Ley</span>
                   </div>
                </div>
                <p className="mt-4 text-xs text-gray-400">El módulo de facturación CFDI 4.0 está en construcción.</p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};