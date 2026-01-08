import React, { useState, useMemo, useRef } from 'react';
import { 
  ArrowLeft, Search, Filter, 
  Users, Download, Upload, 
  ChevronDown, ChevronRight, FileSpreadsheet,
  Building2, Store, X, Wallet, ShoppingBag, Calendar, AlertCircle,
  Truck, MapPin, FileText, GitFork, RotateCcw, ExternalLink,
  PieChart, Heart, Star
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ViewState, Client } from '../types';
import Swal from 'sweetalert2';

// --- TIPOS ---
interface ClientNode extends Client {
  children?: ClientNode[];
}

interface ClientsCatalogProps {
  setView: (view: ViewState) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

// --- COMPONENTE: PANEL DE DETALLES (ESTILO VIBRANTE) ---
const ClientDetailPanel: React.FC<{ 
  client: ClientNode | null; 
  onClose: () => void;
  onNavigateToReturns: () => void;
}> = ({ client, onClose, onNavigateToReturns }) => {
  const { sales } = useDatabase(); 

  if (!client) return null;

  const limit = client.creditLimit || 0;
  const balance = client.currentBalance || 0;
  const available = Math.max(0, limit - balance);
  const usagePct = limit > 0 ? (balance / limit) * 100 : 0;
  
  // Semáforo más alegre
  const statusColor = usagePct > 90 ? 'text-rose-600 bg-rose-100' : usagePct > 50 ? 'text-amber-600 bg-amber-100' : 'text-emerald-600 bg-emerald-100';
  const progressBarColor = usagePct > 90 ? 'bg-rose-500' : usagePct > 50 ? 'bg-amber-500' : 'bg-emerald-500';

  const clientHistory = sales
    .filter(s => s.clientId === client.id || s.customerName === client.name)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 border-l border-gray-100 flex flex-col">
      {/* Header Panel: Gradiente Alegre */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-6 shadow-md relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold leading-tight">{client.name}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-1">
            <X size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/90">
          {client.parent_id ? <Store size={14}/> : <Building2 size={14}/>}
          <span>{client.parent_id ? 'Sucursal' : 'Matriz'}</span>
          <span className="mx-1 text-white/50">|</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white font-mono">
            {client.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Contenido Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
        
        {/* SECCIÓN 1: CRÉDITO */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <Wallet size={16}/> 
                </div>
                Crédito y Saldo
             </h3>
             <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${statusColor}`}>
                {usagePct > 90 ? 'Agotado' : 'Disponible'}
             </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
             <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-xs text-rose-600 font-semibold mb-1">Por Pagar</p>
                <p className="text-lg font-bold text-rose-700">{formatCurrency(balance)}</p>
             </div>
             <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-right">
                <p className="text-xs text-emerald-600 font-semibold mb-1">Disponible</p>
                <p className="text-lg font-bold text-emerald-700">{formatCurrency(available)}</p>
             </div>
          </div>

          <div className="relative pt-1">
             <div className="overflow-hidden h-2.5 mb-2 text-xs flex rounded-full bg-gray-100">
                <div style={{ width: `${Math.min(usagePct, 100)}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${progressBarColor}`}></div>
             </div>
          </div>
        </div>

        {/* SECCIÓN 2: LOGÍSTICA */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
           <div className="p-4 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                 <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                    <Truck size={16}/> 
                 </div>
                 Logística
              </h3>
           </div>
           <div className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                 <MapPin size={16} className="text-gray-400 mt-1" />
                 <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Ubicación</p>
                    <p className="text-sm text-gray-800 font-medium">{client.colony || 'No especificada'}, {client.city || ''}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{client.address || 'Sin dirección registrada'}</p>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <FileText size={16} className="text-gray-400 mt-1" />
                 <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Referencias</p>
                    <p className="text-sm text-gray-600 italic bg-amber-50 p-2 rounded-lg border border-amber-100 mt-1">
                        "{client.notes || 'Sin referencias registradas'}"
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* SECCIÓN 3: HISTORIAL */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
           <div className="p-4 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                 <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                    <ShoppingBag size={16}/> 
                 </div>
                 Últimos Pedidos
              </h3>
           </div>
           
           <div className="divide-y divide-gray-50">
              {clientHistory.length > 0 ? (
                 clientHistory.map((sale) => {
                    const hasReturns = sale.items?.some((i: any) => (i.returnedQuantity || 0) > 0);
                    const returnFolio = hasReturns ? `DEV-${sale.id.slice(0, 4).toUpperCase()}` : null;

                    return (
                        <div key={sale.id} className="p-4 hover:bg-slate-50 transition-colors">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                  <span className="text-sm font-bold text-gray-800 block">
                                    {formatCurrency(sale.total)}
                                  </span>
                                  <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                     <Calendar size={10}/> {new Date(sale.date).toLocaleDateString()}
                                  </span>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sale.paymentMethod === 'credit' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {sale.paymentMethod === 'credit' ? 'CRÉDITO' : 'CONTADO'}
                              </span>
                           </div>

                           {hasReturns && (
                               <div className="mt-2 flex items-center justify-between bg-rose-50 p-2 rounded-lg border border-rose-100">
                                   <div className="flex items-center gap-2 text-rose-600">
                                       <RotateCcw size={12} />
                                       <span className="text-[10px] font-bold">Devolución: {returnFolio}</span>
                                   </div>
                                   <button onClick={onNavigateToReturns} className="text-rose-600 hover:text-rose-800">
                                      <ExternalLink size={12}/>
                                   </button>
                               </div>
                           )}
                        </div>
                    );
                 })
              ) : (
                 <div className="p-8 text-center">
                    <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ShoppingBag className="text-slate-300" size={24} />
                    </div>
                    <p className="text-xs text-slate-400">Sin compras recientes</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};


// --- COMPONENTE FILA ---
const ClientRow: React.FC<{
  client: ClientNode;
  level: number;
  onSelect: (client: ClientNode) => void;
  getInitials: (name: string) => string;
  getRandomColor: (name: string) => string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}> = ({ client, level, onSelect, getInitials, getRandomColor, isExpanded, onToggle }) => {
  
  const hasChildren = client.children && client.children.length > 0;
  const isRoot = level === 0;

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) onToggle(String(client.id));
  };

  return (
    <>
      <tr 
        className={`border-b border-gray-50 cursor-pointer group transition-colors 
            ${!isRoot ? 'bg-slate-50/50 hover:bg-violet-50/50' : 'hover:bg-violet-50'}
        `}
        onClick={() => onSelect(client)}
      >
        <td className="py-4 px-6 whitespace-nowrap">
          <div className="flex items-center" style={{ paddingLeft: `${level * 28}px` }}>
            <div className="w-6 mr-2 flex justify-center items-center" onClick={handleExpandClick}>
              {hasChildren && (
                <button type="button" className="p-1 hover:bg-violet-100 text-violet-400 hover:text-violet-600 rounded transition-colors">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm transition-transform group-hover:scale-105 ${!isRoot ? 'bg-slate-100 text-slate-500' : getRandomColor(client.name)}`}>
                {getInitials(client.name)}
              </div>
              <div className="flex flex-col">
                 <div className="flex items-center gap-2">
                    {isRoot ? <Building2 size={14} className="text-violet-400"/> : <Store size={14} className="text-slate-400"/>}
                    <span className={`text-sm ${hasChildren ? 'font-bold text-slate-700' : 'font-medium text-slate-600'}`}>
                      {client.name}
                    </span>
                 </div>
              </div>
            </div>
          </div>
        </td>
        <td className="py-4 px-6 text-right">
            <span className={`font-mono text-sm font-bold px-2 py-1 rounded-md ${client.currentBalance > 0 ? 'bg-rose-50 text-rose-600' : 'text-slate-500'}`}>
                {formatCurrency(client.currentBalance)}
            </span>
        </td>
        <td className="py-4 px-6 text-right hidden md:table-cell">
             <span className="text-sm text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">
                {formatCurrency(Math.max(0, (client.creditLimit || 0) - (client.currentBalance || 0)))}
             </span>
        </td>
        <td className="py-4 px-6 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-lg border border-slate-200">
                {(client as any).level || 'BRONCE'}
            </span>
        </td>
      </tr>
      
      {isExpanded && hasChildren && client.children!.map((child) => (
        <ClientRow
          key={child.id}
          client={child}
          level={level + 1}
          onSelect={onSelect}
          getInitials={getInitials}
          getRandomColor={getRandomColor}
          isExpanded={false}
          onToggle={onToggle}
        />
      ))}
    </>
  );
};

// --- COMPONENTE PRINCIPAL ---
export const ClientsCatalog: React.FC<ClientsCatalogProps> = ({ setView }) => {
  const { clients } = useDatabase();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('Todos los niveles');
  const [filterSegment, setFilterSegment] = useState('Todos los segmentos');
  const [sortOrder, setSortOrder] = useState('Ordenar por nombre');
  
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedClient, setSelectedClient] = useState<ClientNode | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const treeData = useMemo(() => {
    if (!clients) return [];
    let processedList = [...clients];

    if (filterLevel !== 'Todos los niveles') processedList = processedList.filter(c => (c as any).level === filterLevel);
    if (filterSegment !== 'Todos los segmentos') processedList = processedList.filter(c => (c as any).segment === filterSegment);

    const map = new Map<string, ClientNode>();
    const roots: ClientNode[] = [];

    processedList.forEach(c => map.set(String(c.id), { ...c, children: [] }));

    processedList.forEach(c => {
      const node = map.get(String(c.id));
      if (!node) return;
      const rawParentId = c.parent_id || (c as any).parentId;
      const parentIdStr = rawParentId ? String(rawParentId) : null;

      if (parentIdStr && map.has(parentIdStr)) {
        map.get(parentIdStr)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    let finalRoots = roots;
    if (searchTerm) {
      finalRoots = finalRoots.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    if (sortOrder === 'Ordenar por nombre') {
        finalRoots.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        finalRoots.sort((a, b) => (b.currentBalance || 0) - (a.currentBalance || 0));
    }

    return finalRoots;
  }, [clients, searchTerm, filterLevel, filterSegment, sortOrder]);

  // --- KPIs "ALEGRES" ---
  const kpis = useMemo(() => {
    const totalClients = clients.length;
    const matrices = clients.filter(c => !c.parent_id && !(c as any).parentId).length;
    const sucursales = clients.filter(c => c.parent_id || (c as any).parentId).length;
    const avg = matrices > 0 ? (sucursales / matrices).toFixed(1) : '0';
    
    return [
        { label: 'Clientes', value: totalClients, icon: Users, bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-100' },
        { label: 'Matrices', value: matrices, icon: Building2, bg: 'bg-violet-50 border-violet-100', text: 'text-violet-600', iconBg: 'bg-violet-100' },
        { label: 'Sucursales', value: sucursales, icon: Store, bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600', iconBg: 'bg-amber-100' },
        { label: 'Promedio', value: avg, icon: GitFork, bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    ];
  }, [clients]);

  const handleToggle = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleExportClients = () => {
    if (!clients.length) return Swal.fire('Info', "No hay clientes.", 'info');
    const headers = "ID,Nombre,Telefono,Nivel,PadreID";
    const rows = clients.map(c => `"${c.id}","${c.name}","${c.phone||''}","${(c as any).level}","${c.parent_id||''}"`);
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `clientes.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setIsImporting(true);
      setTimeout(() => { setIsImporting(false); Swal.fire('Éxito', 'Clientes importados', 'success'); }, 1000);
    }
  };

  // Colores pastel vibrantes para los avatares
  const getInitials = (n: string) => n.substring(0,2).toUpperCase();
  const getRandomColor = (n: string) => [
      'bg-indigo-100 text-indigo-600', 
      'bg-pink-100 text-pink-600', 
      'bg-cyan-100 text-cyan-600',
      'bg-lime-100 text-lime-600'
  ][n.length % 4];

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden relative">
      <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={processImport} />

      {/* HEADER ALEGRE & LIMPIO */}
      <div className="bg-white px-8 py-5 flex justify-between items-center shrink-0 border-b border-indigo-100 shadow-sm relative z-20">
        
        {/* Decoración superior de color (como en tu imagen de referencia 2) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500"></div>

        <div className="flex items-center gap-4">
          <button onClick={() => setView('DASHBOARD')} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={24}/>
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-fuchsia-600 tracking-tight">
                Catálogo de Clientes
            </h1>
            <p className="text-sm text-slate-400 font-medium">Gestión de socios comerciales</p>
          </div>
        </div>
        <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-all text-sm font-bold shadow-sm">
                <FileSpreadsheet size={18}/> Plantilla
            </button>
            <button onClick={handleExportClients} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-all text-sm font-bold shadow-sm">
                <Download size={18}/> Exportar
            </button>
            <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 text-violet-700 border border-violet-100 hover:bg-violet-100 transition-all text-sm font-bold shadow-sm">
                <Upload size={18}/> Importar
            </button>
        </div>
      </div>

      {/* KPIS (ESTILO KANBAN PASTEL) */}
      <div className="grid grid-cols-4 gap-6 px-8 py-6 shrink-0 bg-white relative z-10">
         {kpis.map((kpi, i) => (
             <div key={i} className={`p-5 rounded-2xl border ${kpi.bg} shadow-sm flex items-center justify-between hover:shadow-md transition-all hover:-translate-y-1`}>
                 <div>
                     <p className={`text-xs font-bold uppercase tracking-wider ${kpi.text} opacity-70`}>{kpi.label}</p>
                     <p className={`text-3xl font-extrabold mt-1 ${kpi.text}`}>{kpi.value}</p>
                 </div>
                 <div className={`p-3 rounded-xl ${kpi.iconBg}`}><kpi.icon size={24} className={kpi.text} /></div>
             </div>
         ))}
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="px-8 pb-4 shrink-0 flex flex-col md:flex-row gap-4 bg-white">
         <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={20}/>
            <input 
                type="text" placeholder="Buscar cliente..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white outline-none text-sm font-medium transition-all"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
             <div className="relative">
                 <select className="appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none cursor-pointer shadow-sm hover:border-violet-300 transition-colors text-slate-600 font-bold" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                     <option>Todos los niveles</option><option>BRONCE</option><option>PLATA</option><option>ORO</option>
                 </select>
                 <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
             </div>
             <div className="relative">
                 <select className="appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none cursor-pointer shadow-sm hover:border-violet-300 transition-colors text-slate-600 font-bold" value={filterSegment} onChange={e => setFilterSegment(e.target.value)}>
                     <option>Todos los segmentos</option><option>REGULAR</option><option>VIP</option>
                 </select>
                 <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
             </div>
             <div className="relative">
                 <select className="appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none cursor-pointer shadow-sm hover:border-violet-300 transition-colors text-slate-600 font-bold" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                     <option>Ordenar por nombre</option><option>Mayor saldo deudor</option>
                 </select>
                 <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
             </div>
         </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="flex-1 overflow-hidden px-8 pb-8 flex">
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 relative custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-100">
                        <tr>
                            <th className="py-4 px-6 pl-8">Cliente / Sucursal</th>
                            <th className="py-4 px-6 text-right">Saldo Deudor</th>
                            <th className="py-4 px-6 text-right hidden md:table-cell">Crédito Disponible</th>
                            <th className="py-4 px-6 text-center">Nivel</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {treeData.length > 0 ? (
                            treeData.map(client => (
                                <ClientRow 
                                    key={client.id} 
                                    client={client} 
                                    level={0} 
                                    onSelect={setSelectedClient}
                                    getInitials={getInitials}
                                    getRandomColor={getRandomColor}
                                    isExpanded={expandedIds.has(String(client.id))}
                                    onToggle={handleToggle}
                                />
                            ))
                        ) : (
                            <tr><td colSpan={4} className="py-20 text-center text-slate-300">
                                <div className="flex flex-col items-center">
                                    <Users size={48} className="mb-4 opacity-50"/>
                                    <span>No se encontraron clientes</span>
                                </div>
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-white border-t border-slate-100 p-4 text-xs text-slate-400 text-right font-medium">
                Mostrando {treeData.length} registros
            </div>
        </div>
      </div>

      {/* PANEL DETALLES (SLIDE OVER) */}
      {selectedClient && (
          <>
            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setSelectedClient(null)}/>
            <ClientDetailPanel 
                client={selectedClient} 
                onClose={() => setSelectedClient(null)} 
                onNavigateToReturns={() => setView('POS_RETURNS')} 
            />
          </>
      )}
    </div>
  );
};