import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Order, OrderStatus, ViewState, Product } from '../types';
import { OrderPickingModal } from '../components/OrderPickingModal';
// Asegúrate de tener este componente creado o importarlo correctamente
import { SupervisorAuthModal } from '../components/SupervisorAuthModal'; 
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Swal from 'sweetalert2';

import { 
    ShoppingBag, ArrowLeft, Plus, Clock, CheckCircle2, Truck, Package, X, 
    Calendar, User, DollarSign, Search, Zap, FileText, Save, 
    AlertTriangle, ShoppingCart, DollarSign as Dollar, GripVertical, MoreVertical
} from 'lucide-react';

interface OrdersProps {
    setView: (view: ViewState) => void;
}

type OrderTab = 'basic' | 'client' | 'products' | 'payment';
type OrderMode = 'simple' | 'advanced';

// Mapeo numérico para detectar retrocesos (Lógica del Supervisor)
const STEP_MAPPING: Record<OrderStatus, number> = {
    PENDING: 1,
    PROCESSING: 2,
    READY: 3,
    DELIVERED: 4
};

export const Orders: React.FC<OrdersProps> = ({ setView }) => {
    const { orders, clients, products, addOrder, updateOrderStatus, deleteOrder } = useDatabase();
    
    // --- ESTADOS GLOBALES ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState<OrderMode>('advanced');
    const [activeTab, setActiveTab] = useState<OrderTab>('basic');

    // Estado Modal Surtido (Picking)
    const [isPickingModalOpen, setIsPickingModalOpen] = useState(false);
    const [selectedOrderForPicking, setSelectedOrderForPicking] = useState<Order | null>(null);

    // Estado Modal Supervisor (Auth)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [pendingMove, setPendingMove] = useState<{ result: DropResult, source: OrderStatus, dest: OrderStatus } | null>(null);

    // --- ESTADOS DEL FORMULARIO ---
    const initialFormState: Partial<Order> = {
        customerName: '', customerPhone: '', customerAddress: '', deliveryDate: '',
        priority: 'Media', orderType: 'Preventa', items: [], total: 0,
        advancePayment: 0, paymentMethod: 'Efectivo', paymentTerm: 'Inmediato', notes: ''
    };
    const [formData, setFormData] = useState<Partial<Order>>(initialFormState);
    
    // UI Helpers form
    const [productSearch, setProductSearch] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');

    // --- LOGICA DEL FORMULARIO ---
    const openModal = (m: OrderMode) => {
        setMode(m);
        setFormData({
            ...initialFormState,
            deliveryDate: m === 'simple' ? new Date().toISOString().slice(0, 16) : '',
            priority: 'Media', orderType: 'Venta Regular', paymentTerm: 'Inmediato', paymentMethod: 'Efectivo'
        });
        setProductSearch(''); setSelectedClientId(''); setActiveTab('basic'); setIsModalOpen(true);
    };

    const handleCreateOrder = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.customerName) { alert("Nombre obligatorio"); if(mode==='advanced') setActiveTab('client'); return; }
        if (!formData.deliveryDate) { alert("Fecha obligatoria"); if(mode==='advanced') setActiveTab('basic'); return; }
        if (!formData.items || formData.items.length === 0) { alert("Agrega productos"); if(mode==='advanced') setActiveTab('products'); return; }

        const total = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const advance = Number(formData.advancePayment) || 0;
        const orderFolio = `ORD-${Date.now().toString().slice(-6)}`;

        const newOrder: Order = {
            id: Date.now().toString(),
            customerName: formData.customerName,
            customerPhone: formData.customerPhone || '',
            customerAddress: formData.customerAddress || '',
            deliveryDate: formData.deliveryDate,
            items: formData.items,
            total: total,
            advancePayment: advance,
            balance: total - advance,
            notes: formData.notes || '',
            priority: formData.priority as any,
            orderType: formData.orderType as string,
            paymentMethod: formData.paymentMethod as string,
            paymentTerm: formData.paymentTerm as string,
            status: 'PENDING',
            picking_completed: false, // Inicia falso siempre
            orderFolio: orderFolio,
            createdAt: new Date().toISOString()
        };

        addOrder(newOrder);
        setIsModalOpen(false);
        setFormData(initialFormState);
        
        const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        Toast.fire({ icon: 'success', title: 'Pedido creado exitosamente' });
    };

    // Funciones del Carrito (Helpers)
    const addToCart = (product: Product) => {
        setFormData(prev => {
            const currentItems = prev.items || [];
            const existing = currentItems.find(i => i.id === product.id);
            const newItems = existing 
                ? currentItems.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...currentItems, { ...product, quantity: 1 }];
            return { ...prev, items: newItems };
        });
    };
    const updateQuantity = (id: string, delta: number) => {
        setFormData(prev => ({
            ...prev,
            items: (prev.items || []).map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
        }));
    };
    const removeProduct = (id: string) => {
        setFormData(prev => ({ ...prev, items: (prev.items || []).filter(i => i.id !== id) }));
    };
    const handleClientSelect = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setSelectedClientId(clientId);
            setFormData(prev => ({ ...prev, customerName: client.name, customerPhone: client.phone, customerAddress: client.address }));
        }
    };
    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return [];
        return products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))).slice(0, 6);
    }, [products, productSearch]);
    const orderTotal = (formData.items || []).reduce((acc, i) => acc + (i.price * i.quantity), 0);


    // --- LÓGICA DRAG AND DROP (Core Functionality) ---

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceStatus = source.droppableId as OrderStatus;
        const destStatus = destination.droppableId as OrderStatus;
        const order = orders.find(o => o.id === draggableId);

        if (!order) return;

        // 1. REGLA: Bloqueo Surtido Incompleto (De Proceso a Listo)
        if (sourceStatus === 'PROCESSING' && destStatus === 'READY') {
            if (!order.picking_completed) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Surtido Incompleto',
                    text: 'El almacén no ha terminado de surtir el pedido. No se puede avanzar.',
                    confirmButtonColor: '#f59e0b'
                });
                return;
            }
        }

        // 2. REGLA: Bloqueo Retroceso (Requiere Supervisor)
        if (STEP_MAPPING[destStatus] < STEP_MAPPING[sourceStatus]) {
            setPendingMove({ result, source: sourceStatus, dest: destStatus });
            setIsAuthModalOpen(true);
            return;
        }

        executeStatusChange(draggableId, destStatus);
    };

    const executeStatusChange = (orderId: string, newStatus: OrderStatus) => {
        // Si entra a 'PROCESSING', sugerimos abrir picking
        if (newStatus === 'PROCESSING') {
             const order = orders.find(o => o.id === orderId);
             if (order && !order.picking_completed) {
                 setSelectedOrderForPicking(order);
                 setIsPickingModalOpen(true);
             }
        }
        updateOrderStatus(orderId, newStatus);
    };

    const handleAuthSuccess = () => {
        if (pendingMove) {
            executeStatusChange(pendingMove.result.draggableId, pendingMove.dest);
            setPendingMove(null);
            setIsAuthModalOpen(false);
            const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            Toast.fire({ icon: 'success', title: 'Cambio autorizado por Supervisor' });
        }
    };

    const handleFinishPicking = () => {
        if (selectedOrderForPicking) {
            // Nota: Aquí deberías actualizar picking_completed=true en BD
            updateOrderStatus(selectedOrderForPicking.id, 'PROCESSING'); 
            // Mock visual solamente si tu updateOrderStatus no maneja flags extras
            // idealmente: updateOrder(id, { picking_completed: true, status: 'PROCESSING' })
            
            setIsPickingModalOpen(false);
            setSelectedOrderForPicking(null);
            Swal.fire('Surtido Iniciado', 'El pedido está en proceso de empaque.', 'success');
        }
    };

    // --- PREPARACIÓN VISUAL KANBAN ---
    const ordersByStatus = useMemo(() => ({
        PENDING: orders.filter(o => o.status === 'PENDING'),
        PROCESSING: orders.filter(o => o.status === 'PROCESSING'),
        READY: orders.filter(o => o.status === 'READY'),
        DELIVERED: orders.filter(o => o.status === 'DELIVERED')
    }), [orders]);

    const statusConfigs = [
        { status: 'PENDING' as OrderStatus, title: 'Pendientes', icon: Clock, bgColor: 'bg-yellow-50', headerColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
        { status: 'PROCESSING' as OrderStatus, title: 'En Proceso', icon: Package, bgColor: 'bg-blue-50', headerColor: 'text-blue-700', borderColor: 'border-blue-200' },
        { status: 'READY' as OrderStatus, title: 'Listos', icon: CheckCircle2, bgColor: 'bg-purple-50', headerColor: 'text-purple-700', borderColor: 'border-purple-200' },
        { status: 'DELIVERED' as OrderStatus, title: 'Entregados', icon: Truck, bgColor: 'bg-green-50', headerColor: 'text-green-700', borderColor: 'border-green-200' }
    ];

    return (
        <div className="p-6 max-w-[1920px] mx-auto animate-fade-in bg-gray-50 min-h-screen flex flex-col">
            
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('DASHBOARD')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Pedidos</h2>
                        <p className="text-gray-500 text-sm">Gestiona entregas y producción</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => openModal('simple')} className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 font-bold shadow-lg shadow-emerald-200 transition-all active:translate-y-0.5">
                        <Zap size={20} className="fill-current" /> Pedido Rápido
                    </button>
                    <button onClick={() => openModal('advanced')} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all active:translate-y-0.5">
                        <Plus size={20} /> Nuevo Pedido
                    </button>
                </div>
            </div>

            {/* --- INICIO DEL TABLERO INFORMATIVO --- */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
    {/* Total Pedidos */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Pedidos</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{orders.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ShoppingBag size={24} /></div>
        </div>
    </div>

    {/* Pendientes */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">Pendientes</p>
                <h3 className="text-3xl font-bold text-yellow-600 mt-2">
                    {orders.filter(o => o.status === 'PENDING').length}
                </h3>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><Clock size={24} /></div>
        </div>
    </div>

    {/* En Proceso (Surtido) */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">En Picking</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-2">
                    {orders.filter(o => o.status === 'PROCESSING').length}
                </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package size={24} /></div>
        </div>
    </div>

    {/* Listos */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">Listos</p>
                <h3 className="text-3xl font-bold text-purple-600 mt-2">
                    {orders.filter(o => o.status === 'READY').length}
                </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><CheckCircle2 size={24} /></div>
        </div>
    </div>

    {/* Entregados / Ventas */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">Entregados</p>
                <h3 className="text-3xl font-bold text-emerald-600 mt-2">
                    {orders.filter(o => o.status === 'DELIVERED').length}
                </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Truck size={24} /></div>
        </div>
    </div>
</div>
{/* --- FIN DEL TABLERO INFORMATIVO --- */}
                                                             
            {/* --- KANBAN BOARD --- */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-4 h-full min-h-[600px]">
                        {statusConfigs.map((config) => (
                            <Droppable key={config.status} droppableId={config.status}>
                                {(provided, snapshot) => (
                                    <div 
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 min-w-[320px] flex flex-col rounded-xl h-full border-2 transition-all ${
                                            snapshot.isDraggingOver ? 'border-dashed border-blue-500 bg-blue-50/50' : `${config.borderColor} ${config.bgColor}`
                                        }`}
                                    >
                                        <div className={`p-4 flex items-center gap-2 font-bold border-b ${config.headerColor} ${config.borderColor}`}>
                                            <config.icon size={20} />
                                            <span>{config.title}</span>
                                            <span className="ml-auto bg-white/60 px-2 py-1 rounded-full text-sm font-bold">
                                                {ordersByStatus[config.status].length}
                                            </span>
                                        </div>

                                        <div className="flex-1 p-3 overflow-y-auto space-y-3">
                                            {ordersByStatus[config.status].map((order, index) => (
                                                <Draggable key={order.id} draggableId={order.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <OrderCard 
                                                            order={order}
                                                            provided={provided}
                                                            snapshot={snapshot}
                                                            onDelete={deleteOrder}
                                                            // Acciones rápidas según columna
                                                            onAction={() => {
                                                                if(config.status === 'PENDING') {
                                                                    setSelectedOrderForPicking(order);
                                                                    setIsPickingModalOpen(true);
                                                                } else if(config.status === 'PROCESSING') {
                                                                    if(order.picking_completed) executeStatusChange(order.id, 'READY');
                                                                    else Swal.fire('Alto', 'Completa el surtido primero', 'warning');
                                                                } else if(config.status === 'READY') {
                                                                    executeStatusChange(order.id, 'DELIVERED');
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                            {ordersByStatus[config.status].length === 0 && (
                                                <div className="h-40 flex flex-col items-center justify-center text-gray-400 opacity-50">
                                                    <ShoppingBag size={32} className="mb-2" />
                                                    <p className="text-sm font-medium">Sin pedidos</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </div>
            </DragDropContext>

            {/* --- MODAL DE CREACIÓN (INTEGRADO COMPLETO) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className={`bg-white rounded-2xl w-full shadow-2xl animate-fade-in flex flex-col max-h-[90vh] ${mode === 'simple' ? 'max-w-xl' : 'max-w-4xl'}`}>
                        
                        {/* Modal Header */}
                        <div className={`p-6 border-b border-gray-100 flex justify-between items-center ${mode === 'simple' ? 'bg-emerald-50 rounded-t-2xl' : ''}`}>
                            <div className="flex items-center gap-3">
                                {mode === 'simple' && <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Zap size={20} fill="currentColor"/></div>}
                                <h3 className={`text-xl font-bold flex items-center gap-2 ${mode === 'simple' ? 'text-emerald-900' : 'text-gray-800'}`}>
                                    {mode === 'simple' ? 'Pedido Rápido' : 'Nuevo Pedido'}
                                </h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        {/* Tabs Advanced Mode */}
                        {mode === 'advanced' && (
                            <div className="flex border-b border-gray-100 px-6 bg-gray-50/50 overflow-x-auto">
                                {[
                                    { id: 'basic', label: 'Información Básica', icon: FileText },
                                    { id: 'client', label: 'Cliente', icon: User },
                                    { id: 'products', label: 'Productos', icon: Package },
                                    { id: 'payment', label: 'Pago', icon: DollarSign },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as OrderTab)}
                                        className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                            activeTab === tab.id 
                                            ? 'border-blue-600 text-blue-600 bg-white' 
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                                        }`}
                                    >
                                        <tab.icon size={18} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {/* Form Body */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <form id="orderForm" onSubmit={handleCreateOrder}>
                                {/* SIMPLE MODE */}
                                {mode === 'simple' && (
                                    <div className="space-y-6">
                                        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 mb-2">
                                            <p className="text-xs text-emerald-700 font-medium">Crea un pedido express para clientes en mostrador.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Cliente</label>
                                            <input autoFocus type="text" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. Juan Pérez" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                             <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Entrega</label>
                                                <input type="datetime-local" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Anticipo ($)</label>
                                                <input type="number" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" value={formData.advancePayment || ''} onChange={e => setFormData({...formData, advancePayment: Number(e.target.value)})} />
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Productos</label>
                                            <div className="relative mb-3">
                                                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <input type="text" placeholder="Buscar productos..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                                                {filteredProducts.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-xl rounded-b-lg mt-1 z-10 max-h-40 overflow-y-auto">
                                                        {filteredProducts.map(p => (
                                                            <div key={p.id} className="p-2 hover:bg-emerald-50 cursor-pointer flex justify-between" onClick={() => {addToCart(p); setProductSearch('');}}>
                                                                <span className="text-sm">{p.name}</span><span className="text-xs font-bold">${p.price}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {(formData.items || []).map(item => (
                                                    <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                                                        <div className="text-sm"><span className="font-bold">{item.quantity}x</span> {item.name}</div>
                                                        <button type="button" onClick={() => removeProduct(item.id)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ADVANCED TABS */}
                                {mode === 'advanced' && activeTab === 'basic' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Número de Pedido</label><input disabled type="text" className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500" value="Autogenerado" /></div>
                                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pedido</label><select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={formData.orderType} onChange={e => setFormData({...formData, orderType: e.target.value as any})}><option>Preventa</option><option>Pedido Especial</option><option>Venta Regular</option></select></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                             <div><label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Pedido</label><input type="date" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={new Date().toISOString().split('T')[0]} disabled /></div>
                                             <div><label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega</label><input type="datetime-local" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} required /></div>
                                        </div>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label><select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}><option value="Baja">Baja</option><option value="Media">Media</option><option value="Alta">Alta</option></select></div>
                                    </div>
                                )}

                                {mode === 'advanced' && activeTab === 'client' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label><select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={selectedClientId} onChange={e => handleClientSelect(e.target.value)}><option value="">Seleccionar cliente...</option>{clients.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label><input type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={formData.customerPhone || ''} onChange={e => setFormData({...formData, customerPhone: e.target.value})} /></div>
                                             <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre (Manual)</label><input type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={formData.customerName || ''} onChange={e => setFormData({...formData, customerName: e.target.value})} placeholder="Si no está en catálogo" /></div>
                                        </div>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Entrega</label><input type="text" className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={formData.customerAddress || ''} onChange={e => setFormData({...formData, customerAddress: e.target.value})} /></div>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones</label><textarea className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none h-24 resize-none" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea></div>
                                    </div>
                                )}

                                {mode === 'advanced' && activeTab === 'products' && (
                                    <div className="h-full flex flex-col">
                                        <div className="space-y-4 flex-shrink-0">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input type="text" placeholder="Buscar producto..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg outline-none" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                                                {productSearch.trim() && filteredProducts.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg rounded-b-lg mt-1 z-20 max-h-60 overflow-y-auto">
                                                        {filteredProducts.map(p => (
                                                            <div key={p.id} className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0" onClick={() => { addToCart(p); setProductSearch(''); }}>
                                                                <div className="flex justify-between items-center"><div><div className="font-medium text-gray-800">{p.name}</div><div className="text-xs text-gray-500">{p.sku || 'Sin SKU'}</div></div><div className="text-right"><div className="font-bold text-gray-800">${p.price}</div></div></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-h-0 mt-4">
                                            <div className="h-full border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                                                <div className="flex-1 overflow-y-auto">
                                                    {(formData.items || []).length === 0 ? (
                                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8"><ShoppingBag size={48} className="mb-3 opacity-30" /><p>Sin productos seleccionados</p></div>
                                                    ) : (
                                                        <div className="divide-y divide-gray-100">
                                                            {(formData.items || []).map(item => (
                                                                <div key={item.id} className="p-4 hover:bg-gray-50">
                                                                    <div className="flex items-start justify-between mb-2"><div className="flex-1"><div className="font-bold text-gray-800 text-lg">{item.name}</div></div><button type="button" onClick={() => removeProduct(item.id)} className="text-gray-400 hover:text-red-500"><X size={18} /></button></div>
                                                                    <div className="flex items-center justify-between mt-3">
                                                                        <div className="flex items-center space-x-3"><button type="button" onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1 bg-gray-100">-</button><span className="font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1 bg-gray-100">+</button></div>
                                                                        <div className="text-right"><div className="text-lg font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</div></div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {mode === 'advanced' && activeTab === 'payment' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label><select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}><option value="Efectivo">Efectivo</option><option value="Crédito">Crédito</option><option value="Transferencia">Transferencia</option></select></div>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Términos</label><select className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={formData.paymentTerm} onChange={e => setFormData({...formData, paymentTerm: e.target.value as any})}><option value="Inmediato">Inmediato</option><option value="15 días">15 días</option><option value="30 días">30 días</option></select></div>
                                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                             <label className="block text-sm font-bold text-orange-800 mb-1">Anticipo / Seña ($)</label>
                                             <div className="relative"><DollarSign className="absolute left-3 top-3 text-orange-400" size={18} /><input type="number" className="w-full pl-10 pr-4 py-2.5 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" value={formData.advancePayment || ''} onChange={e => setFormData({...formData, advancePayment: Number(e.target.value)})} placeholder="0.00" /></div>
                                             <div className="flex justify-between mt-3 text-sm"><span className="text-gray-500">Total:</span><span className="font-bold">${orderTotal.toFixed(2)}</span></div>
                                             <div className="flex justify-between mt-1 text-sm"><span className="text-gray-500">Resta:</span><span className="font-bold text-red-600">${(orderTotal - (Number(formData.advancePayment) || 0)).toFixed(2)}</span></div>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-6 border-t border-gray-100 flex flex-col gap-4 bg-gray-50 rounded-b-2xl">
                            {(formData.items || []).length > 0 && (<div className="flex justify-between items-center px-2"><span className="text-lg font-bold text-gray-700">Total:</span><span className="text-2xl font-bold text-emerald-600">${orderTotal.toFixed(2)}</span></div>)}
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">Cancelar</button>
                                <button type="submit" form="orderForm" className={`px-6 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${mode === 'simple' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}><Save size={18} />{mode === 'simple' ? 'Guardar Rápido' : 'Guardar Pedido'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Picking */}
            <OrderPickingModal 
                isOpen={isPickingModalOpen}
                onClose={() => { setIsPickingModalOpen(false); setSelectedOrderForPicking(null); }}
                order={selectedOrderForPicking}
                onFinish={handleFinishPicking}
            />

            {/* Modal Supervisor */}
            <SupervisorAuthModal 
                isOpen={isAuthModalOpen}
                onClose={() => { setIsAuthModalOpen(false); setPendingMove(null); }}
                onConfirm={handleAuthSuccess} // Asegúrate que tu componente Auth acepte onConfirm
                title="Autorizar Regreso de Etapa"
            />
        </div>
    );
};

// --- COMPONENTE TARJETA OPTIMIZADO PARA DND ---
interface OrderCardProps {
    order: Order;
    provided: any;
    snapshot: any;
    onDelete: (id: string) => void;
    onAction: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, provided, snapshot, onDelete, onAction }) => {
    const isLate = new Date(order.deliveryDate) < new Date() && order.status !== 'DELIVERED';
    const percentPaid = order.total > 0 ? Math.min(100, (order.advancePayment / order.total) * 100) : 0;
    const isHighPriority = order.priority === 'Alta';

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{ ...provided.draggableProps.style }}
            className={`
                bg-white rounded-xl shadow-sm border border-gray-200 group relative
                hover:shadow-md transition-all
                ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 z-50 ring-2 ring-blue-500' : ''}
            `}
        >
            <div className="p-4">
                {/* Header Card */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <GripVertical size={14} className="text-gray-400 cursor-grab active:cursor-grabbing" />
                            <span className="text-xs font-mono text-gray-400">#{order.orderFolio || order.id}</span>
                        </div>
                        {isLate && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block">Atrasado</span>}
                        {isHighPriority && !isLate && <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-flex items-center gap-1"><AlertTriangle size={10} /> Prioridad</span>}
                    </div>
                    {/* Indicador de Picking State */}
                    {order.status === 'PROCESSING' && (
                        <div className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${order.picking_completed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 animate-pulse'}`}>
                            <Package size={10} /> {order.picking_completed ? 'Surtido' : 'Surtiendo'}
                        </div>
                    )}
                </div>

                <h4 className="font-bold text-gray-800 text-lg mb-1 truncate">{order.customerName}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Calendar size={12} /> {new Date(order.deliveryDate).toLocaleDateString()}
                    <span className="mx-1">•</span> {order.items?.length || 0} items
                </div>

                {/* Progress Bar Pago */}
                <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Pago</span>
                        <span className="font-bold text-gray-700">${order.advancePayment} / ${order.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${percentPaid}%` }}></div>
                    </div>
                    {order.balance > 0 && <p className="text-[10px] text-red-500 text-right mt-1 font-medium">Resta: ${order.balance.toFixed(2)}</p>}
                </div>

                {/* Botones Acciones (Hover) */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pt-2 border-t border-gray-50">
                    <button onClick={(e) => {e.stopPropagation(); if(window.confirm('¿Borrar?')) onDelete(order.id);}} className="flex-1 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100">Eliminar</button>
                    <button onClick={(e) => {e.stopPropagation(); onAction();}} className="flex-1 py-1.5 bg-gray-800 text-white text-xs font-bold rounded hover:bg-gray-700">Acción</button>
                </div>
            </div>
        </div>
    );
};