
import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { ViewState, Route, RouteStop, Product, Client } from '../types';
import { 
    Truck, 
    MapPin, 
    CheckCircle2, 
    Clock, 
    ArrowLeft, 
    User,
    MoreVertical,
    Map,
    List,
    X,
    Save,
    Plus,
    FileText,
    Calendar,
    Users,
    Package,
    Search,
    Trash2
} from 'lucide-react';

interface RouteSalesProps {
    setView: (view: ViewState) => void;
}

type ModalTab = 'basic' | 'schedule' | 'clients' | 'products';

export const RouteSales: React.FC<RouteSalesProps> = ({ setView }) => {
    const { routes, updateRouteStatus, updateRouteStop, addRoute, mockDrivers, mockVehicles, clients, products } = useDatabase();
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(routes[0]?.id || null);
    const [activeView, setActiveView] = useState<'MAP' | 'TIMELINE'>('TIMELINE');

    // Create Route Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ModalTab>('basic');

    // Form Data
    const initialForm = {
        name: '',
        description: '',
        driverName: '',
        vehicleId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        startTime: '',
        endTime: '',
        frequency: 'Diaria' as const,
        daysOfWeek: [] as string[],
        stops: [] as RouteStop[],
        loadedProducts: [] as { productId: string; name: string; sku: string; quantity: number }[]
    };
    const [formData, setFormData] = useState(initialForm);
    const [clientSearch, setClientSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');

    // Visit Modal State
    const [visitModalStop, setVisitModalStop] = useState<RouteStop | null>(null);
    const [visitOutcome, setVisitOutcome] = useState<'SALE' | 'NO_SALE' | 'COLLECTION'>('SALE');
    const [visitAmount, setVisitAmount] = useState('');
    const [visitNotes, setVisitNotes] = useState('');

    const selectedRoute = routes.find(r => r.id === selectedRouteId);

    // --- Actions ---

    const handleCreateRoute = () => {
        if (!formData.name || !formData.driverName || !formData.vehicleId) {
            alert("Completa la Información Básica.");
            setActiveTab('basic');
            return;
        }

        addRoute({
            name: formData.name,
            description: formData.description,
            driverName: formData.driverName,
            vehicleId: formData.vehicleId,
            startDate: formData.startDate,
            endDate: formData.endDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            frequency: formData.frequency,
            daysOfWeek: formData.daysOfWeek,
            stops: formData.stops,
            loadedProducts: formData.loadedProducts
        });

        setIsCreateModalOpen(false);
        setFormData(initialForm);
        setActiveTab('basic');
        alert("Ruta creada exitosamente");
    };

    const handleRegisterVisit = () => {
        if (!selectedRouteId || !visitModalStop) return;

        let status: RouteStop['status'] = 'VISITED';
        if (visitOutcome === 'NO_SALE') status = 'NO_SALE';
        
        updateRouteStop(selectedRouteId, visitModalStop.id, {
            status,
            saleAmount: Number(visitAmount) || 0,
            notes: visitNotes,
            checkOutTime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });

        setVisitModalStop(null);
        setVisitAmount('');
        setVisitNotes('');
    };

    const openVisitModal = (stop: RouteStop) => {
        setVisitModalStop(stop);
        setVisitOutcome('SALE');
        setVisitAmount(stop.saleAmount?.toString() || '');
        setVisitNotes(stop.notes || '');
    };

    const toggleDay = (day: string) => {
        setFormData(prev => {
            const exists = prev.daysOfWeek.includes(day);
            return {
                ...prev,
                daysOfWeek: exists 
                    ? prev.daysOfWeek.filter(d => d !== day)
                    : [...prev.daysOfWeek, day]
            };
        });
    };

    const addClientToRoute = (client: Client) => {
        const newStop: RouteStop = {
            id: `ST-${Date.now()}`,
            clientId: client.id,
            clientName: client.name,
            address: client.address || 'Sin dirección',
            sequence: formData.stops.length + 1,
            status: 'PENDING'
        };
        setFormData(prev => ({ ...prev, stops: [...prev.stops, newStop] }));
        setClientSearch('');
    };

    const addProductToRoute = (product: Product) => {
        const exists = formData.loadedProducts.find(p => p.productId === product.id);
        if (exists) return;

        setFormData(prev => ({
            ...prev,
            loadedProducts: [...prev.loadedProducts, {
                productId: product.id,
                name: product.name,
                sku: product.sku,
                quantity: 1
            }]
        }));
        setProductSearch('');
    };

    const updateProductQty = (productId: string, qty: number) => {
        setFormData(prev => ({
            ...prev,
            loadedProducts: prev.loadedProducts.map(p => 
                p.productId === productId ? { ...p, quantity: Math.max(1, qty) } : p
            )
        }));
    };

    const filteredClients = useMemo(() => {
        if (!clientSearch) return [];
        return clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).slice(0, 5);
    }, [clients, clientSearch]);

    const filteredProducts = useMemo(() => {
        if (!productSearch) return [];
        return products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5);
    }, [products, productSearch]);


    return (
        <div className="p-8 max-w-[1920px] mx-auto animate-fade-in bg-slate-50 min-h-screen flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setView('DASHBOARD')} 
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Venta en Ruta (DSD)</h2>
                        <p className="text-slate-500 text-sm">Gestión de reparto, preventa y autoventa.</p>
                    </div>
                </div>
                
                <div className="flex gap-4">
                     <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        <button 
                            onClick={() => setActiveView('TIMELINE')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'TIMELINE' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <List size={18} /> Timeline
                        </button>
                        <button 
                            onClick={() => setActiveView('MAP')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeView === 'MAP' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <Map size={18} /> Mapa
                        </button>
                    </div>

                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all active:translate-y-0.5"
                    >
                        <Plus size={20} /> Nueva Ruta
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
                
                {/* Left Sidebar: Routes List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Truck size={20} className="text-blue-600"/> Rutas Activas
                        </h3>
                        <div className="space-y-3">
                            {routes.map(route => (
                                <div 
                                    key={route.id}
                                    onClick={() => setSelectedRouteId(route.id)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${selectedRouteId === route.id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`font-bold text-sm ${selectedRouteId === route.id ? 'text-blue-800' : 'text-slate-800'}`}>{route.name}</h4>
                                        <StatusBadge status={route.status} />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                        <User size={12} /> {route.driverName}
                                        <span className="text-slate-300">|</span>
                                        <Truck size={12} /> {route.vehicleId}
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-slate-600">Progreso</span>
                                        <span className="font-bold text-slate-800">{route.progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${route.progress}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content: Route Details */}
                <div className="lg:col-span-3 flex flex-col h-full">
                    {selectedRoute ? (
                        <>
                            {/* Route KPI Header */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-8 items-center">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ventas Totales</p>
                                    <p className="text-2xl font-bold text-slate-800">${selectedRoute.totalSales.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Paradas</p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {selectedRoute.stops.filter(s => s.status !== 'PENDING').length} <span className="text-base text-slate-400 font-normal">/ {selectedRoute.stops.length}</span>
                                    </p>
                                </div>
                                <div className="ml-auto">
                                     <button 
                                        className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 flex items-center gap-2"
                                        onClick={() => updateRouteStatus(selectedRoute.id, 'COMPLETED')}
                                     >
                                         <CheckCircle2 size={16} /> Liquidar Ruta
                                     </button>
                                </div>
                            </div>

                            {activeView === 'TIMELINE' ? (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                        <h4 className="font-bold text-slate-700">Itinerario de Visitas</h4>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6">
                                        <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                                            {selectedRoute.stops.map((stop, idx) => {
                                                let iconColor = 'bg-slate-200 text-slate-500';
                                                let borderColor = 'border-slate-200';
                                                if (stop.status === 'VISITED') { iconColor = 'bg-emerald-500 text-white'; borderColor = 'border-emerald-200 bg-emerald-50'; }
                                                if (stop.status === 'NO_SALE') { iconColor = 'bg-red-500 text-white'; borderColor = 'border-red-200 bg-red-50'; }
                                                
                                                return (
                                                    <div key={stop.id} className="relative pl-8">
                                                        {/* Timeline Dot */}
                                                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${iconColor}`}>
                                                            {stop.status === 'VISITED' && <CheckCircle2 size={10} />}
                                                            {stop.status === 'NO_SALE' && <X size={10} />}
                                                        </div>

                                                        {/* Card */}
                                                        <div className={`p-4 rounded-xl border ${borderColor} transition-all hover:shadow-md group`}>
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-bold text-slate-800 text-lg">{stop.clientName}</span>
                                                                        <span className="text-xs font-mono text-slate-400">#{stop.sequence}</span>
                                                                    </div>
                                                                    <p className="text-sm text-slate-500 flex items-center gap-1 mb-2">
                                                                        <MapPin size={14} /> {stop.address}
                                                                    </p>
                                                                    
                                                                    {stop.status === 'VISITED' && (
                                                                        <div className="flex gap-4 text-xs font-medium">
                                                                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                                                                Venta: ${stop.saleAmount?.toFixed(2)}
                                                                            </span>
                                                                            <span className="text-slate-500 flex items-center gap-1">
                                                                                <Clock size={12} /> {stop.checkOutTime}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                <div>
                                                                    {stop.status === 'PENDING' ? (
                                                                        <button 
                                                                            onClick={() => openVisitModal(stop)}
                                                                            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200"
                                                                        >
                                                                            Registrar Visita
                                                                        </button>
                                                                    ) : (
                                                                        <button 
                                                                            onClick={() => openVisitModal(stop)}
                                                                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
                                                                        >
                                                                            <MoreVertical size={16} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* SIMULATED MAP VIEW */
                                <div className="bg-slate-200 rounded-xl shadow-inner flex-1 relative overflow-hidden flex items-center justify-center border border-slate-300">
                                    <div className="absolute inset-0 opacity-20" style={{ 
                                        backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', 
                                        backgroundSize: '20px 20px' 
                                    }}></div>
                                    
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow text-xs font-mono">
                                        Mapa Simulado (Sin API Key)
                                    </div>

                                    {/* Simulated Route Path */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                        <polyline 
                                            points="200,150 350,200 450,150 550,250 300,400" 
                                            fill="none" 
                                            stroke="#3b82f6" 
                                            strokeWidth="3" 
                                            strokeDasharray="5,5"
                                        />
                                    </svg>

                                    {/* Simulated Pins */}
                                    {selectedRoute.stops.map((stop, idx) => {
                                        // Fake positions for demo
                                        const positions = [
                                            { top: '20%', left: '20%' },
                                            { top: '30%', left: '35%' },
                                            { top: '20%', left: '45%' },
                                            { top: '40%', left: '55%' },
                                            { top: '60%', left: '30%' },
                                        ];
                                        const pos = positions[idx] || { top: '50%', left: '50%' };
                                        
                                        return (
                                            <div 
                                                key={stop.id}
                                                className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group"
                                                style={pos}
                                                onClick={() => openVisitModal(stop)}
                                            >
                                                <div className={`relative flex flex-col items-center ${stop.status === 'VISITED' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                                    <MapPin size={40} className="fill-current drop-shadow-md" />
                                                    <div className="absolute top-2 text-white font-bold text-xs">{idx + 1}</div>
                                                    
                                                    <div className="bg-white px-2 py-1 rounded shadow text-[10px] font-bold text-slate-700 whitespace-nowrap mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-full">
                                                        {stop.clientName}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <Truck size={64} className="mb-4 opacity-20" />
                            <p>Selecciona una ruta para ver detalles.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Visit Registration Modal */}
            {visitModalStop && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50 rounded-t-2xl">
                            <div>
                                <h3 className="font-bold text-lg text-blue-900">Registrar Visita</h3>
                                <p className="text-xs text-blue-600">{visitModalStop.clientName}</p>
                            </div>
                            <button onClick={() => setVisitModalStop(null)}><X className="text-slate-400 hover:text-slate-600" /></button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Resultado</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={() => setVisitOutcome('SALE')}
                                        className={`py-2 text-sm font-bold rounded-lg border transition-all ${visitOutcome === 'SALE' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-white border-slate-200 text-slate-600'}`}
                                    >
                                        Venta Efectiva
                                    </button>
                                    <button 
                                        onClick={() => setVisitOutcome('COLLECTION')}
                                        className={`py-2 text-sm font-bold rounded-lg border transition-all ${visitOutcome === 'COLLECTION' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white border-slate-200 text-slate-600'}`}
                                    >
                                        Cobranza
                                    </button>
                                    <button 
                                        onClick={() => setVisitOutcome('NO_SALE')}
                                        className={`py-2 text-sm font-bold rounded-lg border transition-all ${visitOutcome === 'NO_SALE' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white border-slate-200 text-slate-600'}`}
                                    >
                                        No Compra
                                    </button>
                                </div>
                            </div>

                            {visitOutcome !== 'NO_SALE' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
                                    <input 
                                        type="number" 
                                        autoFocus
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                                        placeholder="0.00"
                                        value={visitAmount}
                                        onChange={e => setVisitAmount(e.target.value)}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notas / Observaciones</label>
                                <textarea 
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                    placeholder={visitOutcome === 'NO_SALE' ? 'Razón de no compra (Cerrado, sin dinero, etc.)' : 'Comentarios...'}
                                    value={visitNotes}
                                    onChange={e => setVisitNotes(e.target.value)}
                                />
                            </div>

                            <button 
                                onClick={handleRegisterVisit}
                                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg mt-2 flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Guardar Registro
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE ROUTE MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-slate-800">Nueva Ruta</h3>
                            <button onClick={() => setIsCreateModalOpen(false)}><X className="text-slate-400 hover:text-slate-600" /></button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 px-6 bg-slate-50/50">
                            {[
                                { id: 'basic', label: 'Información Básica', icon: FileText },
                                { id: 'schedule', label: 'Programación', icon: Calendar },
                                { id: 'clients', label: 'Clientes', icon: Users },
                                { id: 'products', label: 'Productos', icon: Package },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as ModalTab)}
                                    className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab.id 
                                        ? 'border-blue-600 text-blue-600 bg-white' 
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                                    }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-white">
                            
                            {/* TAB 1: BASIC INFO */}
                            {activeTab === 'basic' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Ruta</label>
                                            <input 
                                                autoFocus
                                                type="text" 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.name}
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                            <input 
                                                type="text" 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.description}
                                                onChange={e => setFormData({...formData, description: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Vendedor</label>
                                            <select 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.driverName}
                                                onChange={e => setFormData({...formData, driverName: e.target.value})}
                                            >
                                                <option value="">Seleccionar vendedor...</option>
                                                {mockDrivers.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Vehículo</label>
                                            <select 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.vehicleId}
                                                onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                                            >
                                                <option value="">Seleccionar vehículo...</option>
                                                {mockVehicles.map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: SCHEDULE */}
                            {activeTab === 'schedule' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Inicio</label>
                                            <input 
                                                type="date" 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.startDate}
                                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Fin</label>
                                            <input 
                                                type="date" 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.endDate}
                                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Hora de Inicio</label>
                                            <input 
                                                type="time" 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.startTime}
                                                onChange={e => setFormData({...formData, startTime: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Hora de Fin</label>
                                            <input 
                                                type="time" 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.endTime}
                                                onChange={e => setFormData({...formData, endTime: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Frecuencia</label>
                                        <select 
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                            value={formData.frequency}
                                            onChange={e => setFormData({...formData, frequency: e.target.value as any})}
                                        >
                                            <option value="Diaria">Diaria</option>
                                            <option value="Semanal">Semanal</option>
                                            <option value="Quincenal">Quincenal</option>
                                            <option value="Mensual">Mensual</option>
                                        </select>

                                        <label className="block text-sm font-medium text-slate-700 mb-2">Días de la Semana</label>
                                        <div className="flex gap-2">
                                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                                                <button 
                                                    key={day}
                                                    onClick={() => toggleDay(day)}
                                                    className={`w-12 h-12 rounded-lg font-bold transition-all ${
                                                        formData.daysOfWeek.includes(day) 
                                                        ? 'bg-blue-600 text-white shadow-md' 
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: CLIENTS */}
                            {activeTab === 'clients' && (
                                <div className="space-y-4 animate-fade-in h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-slate-800">Clientes en Ruta</h4>
                                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                            {formData.stops.length} Asignados
                                        </div>
                                    </div>

                                    {/* Client Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar cliente para agregar..." 
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            value={clientSearch}
                                            onChange={e => setClientSearch(e.target.value)}
                                        />
                                        {filteredClients.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 shadow-xl rounded-b-lg mt-1 z-10 max-h-40 overflow-y-auto">
                                                {filteredClients.map(c => (
                                                    <div key={c.id} className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center" onClick={() => addClientToRoute(c)}>
                                                        <span className="font-medium text-sm text-slate-700">{c.name}</span>
                                                        <span className="text-xs text-blue-600 font-bold">+ Agregar</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Stops List */}
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 flex-1 overflow-y-auto p-2 space-y-2">
                                        {formData.stops.length === 0 ? (
                                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sin clientes asignados</div>
                                        ) : (
                                            formData.stops.map((stop, idx) => (
                                                <div key={stop.id} className="bg-white p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-slate-800 text-sm">{stop.clientName}</div>
                                                        <div className="text-xs text-slate-500">{stop.address}</div>
                                                    </div>
                                                    <button 
                                                        onClick={() => setFormData(prev => ({...prev, stops: prev.stops.filter(s => s.id !== stop.id)}))}
                                                        className="text-slate-300 hover:text-red-500 p-1"
                                                    >
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: PRODUCTS */}
                            {activeTab === 'products' && (
                                <div className="space-y-4 animate-fade-in h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-slate-800">Productos en Ruta (Inventario a bordo)</h4>
                                    </div>

                                    {/* Product Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar producto para cargar..." 
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            value={productSearch}
                                            onChange={e => setProductSearch(e.target.value)}
                                        />
                                        {filteredProducts.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 shadow-xl rounded-b-lg mt-1 z-10 max-h-40 overflow-y-auto">
                                                {filteredProducts.map(p => (
                                                    <div key={p.id} className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center" onClick={() => addProductToRoute(p)}>
                                                        <span className="font-medium text-sm text-slate-700">{p.name}</span>
                                                        <span className="text-xs font-bold text-slate-500">Stock: {p.stock}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Products List */}
                                    <div className="bg-slate-50 rounded-xl border border-slate-200 flex-1 overflow-y-auto p-2">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="text-slate-500 border-b border-slate-200">
                                                    <th className="p-2">Producto</th>
                                                    <th className="p-2 text-center">Cantidad</th>
                                                    <th className="p-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.loadedProducts.length === 0 ? (
                                                     <tr><td colSpan={3} className="p-8 text-center text-slate-400">Camión vacío</td></tr>
                                                ) : (
                                                    formData.loadedProducts.map(p => (
                                                        <tr key={p.productId} className="bg-white border-b border-slate-100 last:border-0">
                                                            <td className="p-2 font-medium text-slate-700">{p.name}</td>
                                                            <td className="p-2 text-center">
                                                                <input 
                                                                    type="number" 
                                                                    className="w-20 text-center p-1 border rounded bg-slate-50 font-bold"
                                                                    value={p.quantity}
                                                                    onChange={e => updateProductQty(p.productId, parseInt(e.target.value))}
                                                                />
                                                            </td>
                                                            <td className="p-2 text-right">
                                                                <button 
                                                                    onClick={() => setFormData(prev => ({...prev, loadedProducts: prev.loadedProducts.filter(x => x.productId !== p.productId)}))}
                                                                    className="text-slate-300 hover:text-red-500"
                                                                >
                                                                    <Trash2 size={16}/>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleCreateRoute}
                                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Save size={18} /> Guardar Ruta
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'IN_PROGRESS': return <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">EN RUTA</span>;
        case 'COMPLETED': return <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">FINALIZADA</span>;
        default: return <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">PLANEADA</span>;
    }
}
