import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, Search, Filter, Eye, Edit3, Trash2, 
  Users, Star, UserPlus, DollarSign, Download, Upload, ChevronDown, FileSpreadsheet
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ViewState, Client } from '../types';
import { ClientDetailsModal } from '../components/ClientDetailsModal';
import { NewClientModal } from '../components/NewClientModal';

interface ClientsCatalogProps {
  setView: (view: ViewState) => void;
}

export const ClientsCatalog: React.FC<ClientsCatalogProps> = ({ setView }) => {
  const { clients, addClient } = useDatabase(); // Usamos addClient para la importación
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de Filtros
  const [filterLevel, setFilterLevel] = useState('Todos los niveles');
  const [filterSegment, setFilterSegment] = useState('Todos los segmentos');
  const [sortOrder, setSortOrder] = useState('Ordenar por nombre');

  // Modales
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Referencia para el input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA DE EXPORTACIÓN E IMPORTACIÓN ---

  const handleDownloadTemplate = () => {
    // Encabezados requeridos
    const headers = "Nombre,Telefono,Email,Direccion,RFC,LimiteCredito";
    const example = "Juan Perez,5512345678,juan@email.com,Calle 1 Col Centro,XAXX010101000,5000";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + example;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plantilla_clientes_nexpos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportClients = () => {
    if (clients.length === 0) return alert("No hay clientes para exportar.");

    const headers = "Nombre,Telefono,Email,Direccion,RFC,LimiteCredito,SaldoActual,Puntos";
    const rows = clients.map(c => 
      `"${c.name}","${c.phone}","${c.email}","${c.address || ''}","${c.rfc || ''}",${c.creditLimit},${c.currentBalance},${c.points}`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clientes_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const processImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
        const text = evt.target?.result as string;
        if (!text) return;

        const lines = text.split('\n');
        // Omitimos la primera línea (headers)
        const dataLines = lines.slice(1);
        let successCount = 0;

        for (const line of dataLines) {
            if (!line.trim()) continue;
            
            // Separar por comas (lógica simple, asume que no hay comas dentro de los campos para este ejemplo rápido)
            // Para producción robusta, usar una librería como PapaParse es mejor, pero esto funciona para la plantilla.
            const cols = line.split(',');
            
            // Mapeo básico basado en la plantilla: Nombre,Telefono,Email,Direccion,RFC,LimiteCredito
            const name = cols[0]?.replace(/"/g, '').trim(); // Quitar comillas si las hay
            const phone = cols[1]?.replace(/"/g, '').trim() || '';
            const email = cols[2]?.replace(/"/g, '').trim() || '';
            const address = cols[3]?.replace(/"/g, '').trim() || '';
            const rfc = cols[4]?.replace(/"/g, '').trim() || '';
            const creditLimit = parseFloat(cols[5]) || 0;

            if (name) {
                await addClient({
                    name, phone, email, address, 
                    // @ts-ignore (si tu tipo Client no tiene rfc en la definición principal, agrégalo o ignora el error)
                    rfc, 
                    creditLimit, currentBalance: 0,
                    level: 'Standard', points: 0, tags: []
                });
                successCount++;
            }
        }

        alert(`Se importaron ${successCount} clientes exitosamente.`);
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Limpiar input
    };

    reader.readAsText(file);
  };

  // --- FIN LÓGICA EXPORT/IMPORT ---

  // Lógica de Filtrado
  const filteredClients = clients
    .filter(c => 
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterLevel === 'Todos los niveles' || c.level?.toUpperCase() === filterLevel) &&
      (filterSegment === 'Todos los segmentos' || 'REGULAR' === filterSegment)
    )
    .sort((a, b) => {
        if (sortOrder === 'Ordenar por nombre') return a.name.localeCompare(b.name);
        if (sortOrder === 'Mayor compra') return (b.points || 0) - (a.points || 0);
        return 0;
    });

  const stats = { 
    total: clients.length, 
    vip: clients.filter(c => c.level === 'Gold' || c.level === 'Platinum').length, 
    newThisMonth: clients.filter(c => new Date(c.since).getMonth() === new Date().getMonth()).length, 
    avgValue: 650 
  };

  const handleDelete = (id: string) => {
      if(confirm("¿Eliminar cliente permanentemente?")) alert("Cliente eliminado (Funcionalidad pendiente en backend)");
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      
      {/* Input oculto para importación */}
      <input 
        type="file" 
        accept=".csv" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={processImport}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
            <button onClick={() => setView('CLIENTS_DASHBOARD')} className="p-2 hover:bg-white rounded-full transition-colors text-slate-500">
                <ArrowLeft size={24}/>
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Catálogo de Clientes</h1>
        </div>
        
        <div className="flex gap-3">
            {/* Botón Plantilla */}
            <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-600 font-bold hover:bg-slate-50 transition-colors shadow-sm" title="Descargar formato para llenar en Excel">
                <FileSpreadsheet size={18} className="text-green-600"/> Plantilla
            </button>
            
            {/* Botón Exportar */}
            <button onClick={handleExportClients} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-600 font-bold hover:bg-slate-50 transition-colors shadow-sm">
                <Download size={18}/> Exportar
            </button>

            {/* Botón Importar */}
            <button onClick={handleImportClick} disabled={isImporting} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-600 font-bold hover:bg-slate-50 transition-colors shadow-sm">
                <Upload size={18}/> {isImporting ? 'Cargando...' : 'Importar'}
            </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard label="Clientes totales" value={stats.total} icon={Users} color="bg-blue-100 text-blue-600" />
        <StatCard label="Clientes VIP" value={stats.vip} icon={Star} color="bg-purple-100 text-purple-600" />
        <StatCard label="Nuevos (Mes)" value={stats.newThisMonth} icon={UserPlus} color="bg-green-100 text-green-600" />
        <StatCard label="Valor Promedio" value={`$${stats.avgValue}`} icon={DollarSign} color="bg-amber-100 text-amber-600" />
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-t-xl border-b border-slate-100 flex justify-between items-center shadow-sm">
         <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm text-slate-600"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         
         <div className="flex gap-6 items-center">
             <div className="relative group min-w-[200px]">
                 <Filter size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                 <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="w-full appearance-none bg-transparent pl-6 pr-8 py-2 text-sm font-medium text-slate-600 outline-none cursor-pointer hover:text-blue-600 transition-colors border-b border-transparent hover:border-slate-200">
                    <option>Todos los niveles</option><option value="BRONZE">BRONCE</option><option value="SILVER">PLATA</option><option value="GOLD">ORO</option><option value="PLATINUM">PLATINO</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
             </div>

             <div className="relative group min-w-[200px]">
                 <Filter size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                 <select value={filterSegment} onChange={(e) => setFilterSegment(e.target.value)} className="w-full appearance-none bg-transparent pl-6 pr-8 py-2 text-sm font-medium text-slate-600 outline-none cursor-pointer hover:text-blue-600 transition-colors border-b border-transparent hover:border-slate-200">
                    <option>Todos los segmentos</option><option>Nuevos</option><option>Regulares</option><option>Personaje</option><option>Inactivos</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
             </div>

             <div className="relative group min-w-[180px]">
                 <ArrowLeft size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90"/>
                 <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full appearance-none bg-transparent pl-6 pr-8 py-2 text-sm font-medium text-slate-600 outline-none cursor-pointer hover:text-blue-600 transition-colors border-b border-transparent hover:border-slate-200">
                    <option>Ordenar por nombre</option><option>Mayor compra</option><option>Más recientes</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
             </div>
         </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border border-slate-200 border-t-0">
         <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                <tr>
                    <th className="p-4 w-10"><input type="checkbox" className="rounded border-slate-300"/></th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Contacto</th>
                    <th className="p-4">Nivel</th>
                    <th className="p-4">Segmento</th>
                    <th className="p-4">Compras</th>
                    <th className="p-4 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
                {filteredClients.map(client => (
                    <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-4"><input type="checkbox" className="rounded border-slate-300"/></td>
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-lg">
                                    {client.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700">{client.name}</p>
                                    <div className="flex gap-1 mt-1">{(client.tags || []).map((t,i)=><span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">{t}</span>)}</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="flex flex-col text-xs text-slate-600 gap-1">
                                <span className="flex items-center gap-1">📧 {client.email || '-'}</span>
                                <span className="flex items-center gap-1">📞 {client.phone}</span>
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${client.level === 'Gold' ? 'bg-amber-400' : client.level === 'Silver' ? 'bg-slate-400' : 'bg-orange-700'}`}></div>
                                <div>
                                    <p className="font-bold text-slate-700 uppercase text-xs">{client.level || 'BRONCE'}</p>
                                    <p className="text-[10px] text-slate-400">{client.points} puntos</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold border border-green-100 uppercase tracking-wide">
                                REGULAR
                            </span>
                        </td>
                        <td className="p-4">
                            <p className="font-bold text-slate-700">15 compras</p>
                            <p className="text-[10px] text-slate-400">$ 450 promedio</p>
                        </td>
                        <td className="p-4 text-center">
                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setSelectedClient(client); setShowDetails(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors" title="Ver Detalles"><Eye size={18}/></button>
                                <button onClick={() => { setShowCreateModal(true); /* Cargar datos */ }} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Editar"><Edit3 size={18}/></button>
                                <button onClick={() => handleDelete(client.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar"><Trash2 size={18}/></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
         </table>
         {filteredClients.length === 0 && (
             <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                 <Users size={48} className="mb-4 opacity-20"/>
                 <p>No se encontraron clientes con esos filtros.</p>
             </div>
         )}
      </div>

      {/* Modales */}
      {selectedClient && (
        <ClientDetailsModal 
            isOpen={showDetails} 
            onClose={() => setShowDetails(false)} 
            client={selectedClient} 
            onEdit={() => { setShowDetails(false); }} 
        />
      )}
      
      <NewClientModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div><p className="text-slate-500 text-sm font-medium mb-1">{label}</p><p className="text-2xl font-bold text-slate-800">{value}</p></div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-20`}><Icon size={24} className={color.replace('bg-', 'text-').split(' ')[0]} /></div>
    </div>
);