import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Order, OrderStatus, ViewState, CartItem, Product } from '../types';
import { 
    ShoppingBag, 
    ArrowLeft, 
    Plus, 
    Clock, 
    CheckCircle2, 
    Truck, 
    Package, 
    X, 
    Calendar,
    User,
    DollarSign,
    Trash2,
    MoveRight,
    Search,
    Zap,
    FileText,
    CreditCard,
    Save,
    MapPin,
    AlertTriangle
} from 'lucide-react';

interface OrdersProps {
    setView: (view: ViewState) => void;
}

type OrderTab = 'basic' | 'client' | 'products' | 'payment';
type OrderMode = 'simple' | 'advanced';

export const Orders: React.FC<OrdersProps> = ({ setView }) => {
    const { orders, clients, products, addOrder, updateOrderStatus, deleteOrder } = useDatabase();
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState<OrderMode>('advanced');
    const [activeTab, setActiveTab] = useState<OrderTab>('basic');

    // Filters
    const [filterStatus, setFilterStatus] = useState<'ALL' | OrderStatus>('ALL');

    // Comprehensive Form State
    const initialFormState: Partial<Order> = {
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        deliveryDate: '',
        priority: 'Media',
        orderType: 'Preventa',
        items: [],
        total: 0,
        advancePayment: 0,
        paymentMethod: 'Efectivo',
        paymentTerm: 'Inmediato',
        notes: ''
    };
    const [formData, setFormData] = useState<Partial<Order>>(initialFormState);
    
    // UI Helpers for Form
    const [productSearch, setProductSearch] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');

    const openModal = (m: OrderMode) => {
        setMode(m);
        setFormData({
            ...initialFormState,
            // Pre-fill some defaults for simple mode
            deliveryDate: m === 'simple' ? new Date().toISOString().slice(0, 16) : '',
            priority: 'Media',
            orderType: 'Venta Regular',
            paymentTerm: 'Inmediato',
            paymentMethod: 'Efectivo'
        });
        setProductSearch('');
        setSelectedClientId('');
        setActiveTab('basic');
        setIsModalOpen(true);
    };

    const handleCreateOrder = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.customerName) {
            alert("El nombre del cliente es obligatorio.");
            if(mode === 'advanced') setActiveTab('client');
            return;
        }
        if (!formData.deliveryDate) {
            alert("La fecha de entrega es obligatoria.");
            if(mode === 'advanced') setActiveTab('basic');
            return;
        }
        if (!formData.items || formData.items.length === 0) {
            alert("Agrega al menos un producto.");
            if(mode === 'advanced') setActiveTab('products');
            return;
        }

        const total = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const advance = Number(formData.advancePayment) || 0;

        addOrder({
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            customerAddress: formData.customerAddress,
            deliveryDate: formData.deliveryDate,
            items: formData.items,
            total: total,
            advancePayment: advance,
            balance: total - advance,
            notes: formData.notes,
            priority: formData.priority as any,
            orderType: formData.orderType as any,
            paymentMethod: formData.paymentMethod as any,
            paymentTerm: formData.paymentTerm as any
        });

        setIsModalOpen(false);
        alert("Pedido creado exitosamente");
    };

    // --- Product Helper Functions ---
    const addToCart = (product: Product) => {
        setFormData(prev => {
            const currentItems = prev.items || [];
            const existing = currentItems.find(i => i.id === product.id);
            let newItems;
            
            if (existing) {
                newItems = currentItems.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            } else {
                newItems = [...currentItems, { ...product, quantity: 1 }];
            }
            return { ...prev, items: newItems };
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setFormData(prev => {
            const currentItems = prev.items || [];
            const newItems = currentItems.map(item => {
                if (item.id === id) {
                    return { ...item, quantity: Math.max(1, item.quantity + delta) };
                }
                return item;
            });
            return { ...prev, items: newItems };
        });
    };

    const removeProduct = (id: string) => {
        setFormData(prev => ({
            ...prev,
            items: (prev.items || []).filter(i => i.id !== id)
        }));
    };

    const handleClientSelect = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setSelectedClientId(clientId);
            setFormData(prev => ({
                ...prev,
                customerName: client.name,
                customerPhone: client.phone,
                customerAddress: client.address
            }));
        }
    };

    // Filtered Products for Autocomplete
    const filteredProducts = useMemo(() => {
        if (!productSearch) return [];
        return products.filter(p => 
            p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
            p.sku.toLowerCase().includes(productSearch.toLowerCase())
        ).slice(0, 5);
    }, [products, productSearch]);

    const orderTotal = (formData.items || []).reduce((acc, i) => acc + (i.price * i.quantity), 0);

    const moveOrder = (id: string, currentStatus: OrderStatus) => {
        const flow: OrderStatus[] = ['PENDING', 'PROCESSING', 'READY', 'DELIVERED'];
        const idx = flow.indexOf(currentStatus);
        if (idx !== -1 && idx < flow.length - 1) {
            updateOrderStatus(id, flow[idx + 1]);
        }
    };

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
                        <h2 className="text-3xl font-bold text-slate-800">Pedidos</h2>
                        <p className="text-slate-500 text-sm">Gestiona entregas, anticipos y producción.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => openModal('simple')}
                        className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 font-bold shadow-lg shadow-emerald-200 transition-all active:translate-y-0.5"
                    >
                        <Zap size={20} className="fill-current" /> Pedido Rápido
                    </button>
                    <button 
                        onClick={() => openModal('advanced')}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all active:translate-y-0.5"
                    >
                        <Plus size={20} /> Nuevo Pedido
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-[1200px] h-full">
                    <OrderColumn title="Pendientes" status="PENDING" icon={Clock} color="bg-yellow-50 border-yellow-100" headerColor="text-yellow-700" orders={orders.filter(o => o.status === 'PENDING')} onMove={moveOrder} onDelete={deleteOrder} />
                    <OrderColumn title="En Proceso" status="PROCESSING" icon={Package} color="bg-blue-50 border-blue-100" headerColor="text-blue-700" orders={orders.filter(o => o.status === 'PROCESSING')} onMove={moveOrder} onDelete={deleteOrder} />
                    <OrderColumn title="Listo para Entrega" status="READY" icon={CheckCircle2} color="bg-purple-50 border-purple-100" headerColor="text-purple-700" orders={orders.filter(o => o.status === 'READY')} onMove={moveOrder} onDelete={deleteOrder} />
                    <OrderColumn title="Entregados" status="DELIVERED" icon={Truck} color="bg-green-50 border-green-100" headerColor="text-green-700" orders={orders.filter(o => o.status === 'DELIVERED')} onMove={moveOrder} onDelete={deleteOrder} />
                </div>
            </div>

            {/* --- UNIFIED MODAL (Simple & Advanced) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className={`bg-white rounded-2xl w-full shadow-2xl animate-fade-in flex flex-col max-h-[90vh] ${mode === 'simple' ? 'max-w-xl' : 'max-w-4xl'}`}>
                        
                        {/* Modal Header */}
                        <div className={`p-6 border-b border-slate-100 flex justify-between items-center ${mode === 'simple' ? 'bg-emerald-50 rounded-t-2xl' : ''}`}>
                            <div className="flex items-center gap-3">
                                {mode === 'simple' && <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Zap size={20} fill="currentColor"/></div>}
                                <h3 className={`text-xl font-bold flex items-center gap-2 ${mode === 'simple' ? 'text-emerald-900' : 'text-slate-800'}`}>
                                    {mode === 'simple' ? 'Pedido Rápido' : 'Nuevo Pedido'}
                                </h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400 hover:text-slate-600" /></button>
                        </div>

                        {/* Advanced Mode Tabs */}
                        {mode === 'advanced' && (
                            <div className="flex border-b border-slate-100 px-6 bg-slate-50/50 overflow-x-auto">
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
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                                        }`}
                                    >
                                        <tab.icon size={18} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <form id="orderForm" onSubmit={handleCreateOrder}>
                                
                                {/* --- SIMPLE MODE CONTENT --- */}
                                {mode === 'simple' && (
                                    <div className="space-y-6">
                                        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 mb-2">
                                            <p className="text-xs text-emerald-700 font-medium">
                                                Crea un pedido express para clientes en mostrador.
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Cliente</label>
                                            <input 
                                                autoFocus
                                                type="text" 
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                                placeholder="Ej. Juan Pérez"
                                                value={formData.customerName}
                                                onChange={e => setFormData({...formData, customerName: e.target.value})}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                             <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de Entrega</label>
                                                <input 
                                                    type="datetime-local" 
                                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    value={formData.deliveryDate}
                                                    onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Anticipo ($)</label>
                                                <input 
                                                    type="number"
                                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    placeholder="0.00"
                                                    value={formData.advancePayment || ''}
                                                    onChange={e => setFormData({...formData, advancePayment: Number(e.target.value)})}
                                                />
                                            </div>
                                        </div>

                                        {/* Simplified Product Selector */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Productos</label>
                                            <div className="relative mb-3">
                                                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                                <input 
                                                    type="text" 
                                                    placeholder="Buscar y agregar..." 
                                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    value={productSearch}
                                                    onChange={e => setProductSearch(e.target.value)}
                                                />
                                                {filteredProducts.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 shadow-xl rounded-b-lg mt-1 z-10 max-h-40 overflow-y-auto">
                                                        {filteredProducts.map(p => (
                                                            <div key={p.id} className="p-2 hover:bg-emerald-50 cursor-pointer flex justify-between" onClick={() => {addToCart(p); setProductSearch('');}}>
                                                                <span className="text-sm">{p.name}</span>
                                                                <span className="text-xs font-bold">${p.price}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {(formData.items || []).map(item => (
                                                    <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                                                        <div className="text-sm">
                                                            <span className="font-bold">{item.quantity}x</span> {item.name}
                                                        </div>
                                                        <button type="button" onClick={() => removeProduct(item.id)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                                                    </div>
                                                ))}
                                                {(!formData.items || formData.items.length === 0) && (
                                                    <p className="text-xs text-slate-400 text-center py-2">Sin productos</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="text-right text-xl font-bold text-slate-800">
                                            Total: ${orderTotal.toFixed(2)}
                                        </div>
                                    </div>
                                )}


                                {/* --- ADVANCED MODE TABS CONTENT --- */}

                                {/* TAB 1: BASIC INFO */}
                                {mode === 'advanced' && activeTab === 'basic' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Número de Pedido</label>
                                                <input disabled type="text" className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500" value="Autogenerado" />
                                            </div>
                                            <div>
                                                 <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Pedido</label>
                                                 <select 
                                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={formData.orderType}
                                                    onChange={e => setFormData({...formData, orderType: e.target.value as any})}
                                                >
                                                    <option>Preventa</option>
                                                    <option>Pedido Especial</option>
                                                    <option>Venta Regular</option>
                                                 </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                             <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Pedido</label>
                                                <input 
                                                    type="date" 
                                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                                                    value={new Date().toISOString().split('T')[0]} // Just for display
                                                    disabled
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Entrega</label>
                                                <input 
                                                    type="datetime-local" 
                                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={formData.deliveryDate}
                                                    onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                             <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
                                             <select 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.priority}
                                                onChange={e => setFormData({...formData, priority: e.target.value as any})}
                                            >
                                                <option value="Baja">Baja</option>
                                                <option value="Media">Media</option>
                                                <option value="Alta">Alta</option>
                                             </select>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: CLIENT */}
                                {mode === 'advanced' && activeTab === 'client' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                                            <select 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={selectedClientId}
                                                onChange={e => handleClientSelect(e.target.value)}
                                            >
                                                <option value="">Seleccionar cliente...</option>
                                                {clients.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                                                    value={formData.customerPhone || ''}
                                                    onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                                                />
                                            </div>
                                             <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre (Manual)</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                                                    value={formData.customerName || ''}
                                                    onChange={e => setFormData({...formData, customerName: e.target.value})}
                                                    placeholder="Si no está en catálogo"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección de Entrega</label>
                                            <input 
                                                type="text" 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                                                value={formData.customerAddress || ''}
                                                onChange={e => setFormData({...formData, customerAddress: e.target.value})}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Instrucciones de Entrega</label>
                                            <textarea 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none h-24 resize-none"
                                                value={formData.notes || ''}
                                                onChange={e => setFormData({...formData, notes: e.target.value})}
                                            ></textarea>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: PRODUCTS */}
                                {mode === 'advanced' && activeTab === 'products' && (
                                    <div className="space-y-4 animate-fade-in h-full flex flex-col">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-slate-800">Productos</h4>
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    const dummyProduct = products[0]; // Just for demo, use the search in real app
                                                    if(dummyProduct) addToCart(dummyProduct);
                                                }}
                                                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold hover:bg-blue-100"
                                            >
                                                + Agregar Producto (Demo)
                                            </button>
                                        </div>

                                        {/* Product Search */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                            <input 
                                                type="text" 
                                                placeholder="Buscar producto..." 
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={productSearch}
                                                onChange={e => setProductSearch(e.target.value)}
                                            />
                                            {filteredProducts.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 shadow-xl rounded-b-lg mt-1 z-10 max-h-40 overflow-y-auto">
                                                    {filteredProducts.map(p => (
                                                        <div key={p.id} className="p-2 hover:bg-blue-50 cursor-pointer flex justify-between" onClick={() => {addToCart(p); setProductSearch('');}}>
                                                            <span className="text-sm">{p.name}</span>
                                                            <span className="text-xs font-bold">${p.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* List */}
                                        <div className="bg-slate-50 rounded-xl border border-slate-200 flex-1 overflow-y-auto p-2">
                                            {(formData.items || []).length === 0 ? (
                                                <div className="h-full flex items-center justify-center text-slate-400">Sin productos seleccionados</div>
                                            ) : (
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="border-b border-slate-200 text-slate-500">
                                                            <th className="p-2">Producto</th>
                                                            <th className="p-2 text-center">Cant.</th>
                                                            <th className="p-2 text-right">Total</th>
                                                            <th className="p-2"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(formData.items || []).map(item => (
                                                            <tr key={item.id} className="border-b border-slate-100 last:border-0 bg-white">
                                                                <td className="p-2 font-medium">{item.name} <br/> <span className="text-xs text-slate-400">{item.sku}</span></td>
                                                                <td className="p-2 text-center">
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        <button type="button" onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 bg-slate-100 rounded">-</button>
                                                                        <span className="w-6 text-center">{item.quantity}</span>
                                                                        <button type="button" onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 bg-slate-100 rounded">+</button>
                                                                    </div>
                                                                </td>
                                                                <td className="p-2 text-right font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                                                                <td className="p-2 text-right">
                                                                    <button type="button" onClick={() => removeProduct(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-bold text-lg text-slate-800">
                                            <span>Total</span>
                                            <span>${orderTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: PAYMENT */}
                                {mode === 'advanced' && activeTab === 'payment' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
                                            <select 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.paymentMethod}
                                                onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}
                                            >
                                                <option value="Efectivo">Efectivo</option>
                                                <option value="Crédito">Crédito</option>
                                                <option value="Transferencia">Transferencia</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Términos de Pago</label>
                                            <select 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.paymentTerm}
                                                onChange={e => setFormData({...formData, paymentTerm: e.target.value as any})}
                                            >
                                                <option value="Inmediato">Inmediato</option>
                                                <option value="15 días">15 días</option>
                                                <option value="30 días">30 días</option>
                                            </select>
                                        </div>

                                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                             <label className="block text-sm font-bold text-orange-800 mb-1">Anticipo / Seña ($)</label>
                                             <div className="relative">
                                                <DollarSign className="absolute left-3 top-3 text-orange-400" size={18} />
                                                <input 
                                                    type="number"
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                                    value={formData.advancePayment || ''}
                                                    onChange={e => setFormData({...formData, advancePayment: Number(e.target.value)})}
                                                    placeholder="0.00"
                                                />
                                             </div>
                                             <div className="flex justify-between mt-3 text-sm">
                                                 <span className="text-slate-500">Total Pedido:</span>
                                                 <span className="font-bold">${orderTotal.toFixed(2)}</span>
                                             </div>
                                             <div className="flex justify-between mt-1 text-sm">
                                                 <span className="text-slate-500">Resta por Pagar:</span>
                                                 <span className="font-bold text-red-600">${(orderTotal - (Number(formData.advancePayment) || 0)).toFixed(2)}</span>
                                             </div>
                                        </div>
                                    </div>
                                )}

                            </form>
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                form="orderForm"
                                className={`px-6 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${mode === 'simple' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                            >
                                <Save size={18} />
                                {mode === 'simple' ? 'Guardar Rápido' : 'Guardar Pedido'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const OrderColumn = ({ title, status, icon: Icon, color, headerColor, orders, onMove, onDelete }: any) => {
    return (
        <div className={`flex-1 min-w-[300px] flex flex-col rounded-2xl h-full ${color} border bg-opacity-50`}>
            <div className={`p-4 flex items-center gap-2 font-bold ${headerColor} border-b border-white/50`}>
                <Icon size={20} />
                <span>{title}</span>
                <span className="ml-auto bg-white/50 px-2 py-0.5 rounded-full text-xs">
                    {orders.length}
                </span>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {orders.map((order: Order) => (
                    <OrderCard key={order.id} order={order} onMove={onMove} onDelete={onDelete} />
                ))}
            </div>
        </div>
    );
};

const OrderCard = ({ order, onMove, onDelete }: { order: Order, onMove: any, onDelete: any }) => {
    const isLate = new Date(order.deliveryDate) < new Date() && order.status !== 'DELIVERED';
    const percentPaid = Math.min(100, (order.advancePayment / order.total) * 100);
    const isHighPriority = order.priority === 'Alta';

    return (
        <div className={`bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-all group relative ${isHighPriority ? 'border-l-4 border-l-red-500' : 'border-slate-100'}`}>
            
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-slate-400">#{order.id}</span>
                {isLate && (
                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Atrasado
                    </span>
                )}
                {isHighPriority && !isLate && (
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle size={10} /> Alta Prioridad
                    </span>
                )}
            </div>

            <h4 className="font-bold text-slate-800 mb-1">{order.customerName}</h4>
            
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <Calendar size={12} />
                {new Date(order.deliveryDate).toLocaleDateString()}
            </div>

            <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Pago:</span>
                    <span className="font-bold text-slate-700">${order.advancePayment} / ${order.total}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${percentPaid}%` }}></div>
                </div>
                {order.balance > 0 && (
                    <p className="text-[10px] text-red-500 text-right mt-1 font-medium">Deben: ${order.balance.toFixed(2)}</p>
                )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                 <button 
                    onClick={() => onDelete(order.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                    <Trash2 size={16} />
                 </button>

                 {order.status !== 'DELIVERED' && (
                     <button 
                        onClick={() => onMove(order.id, order.status)}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                     >
                        Avanzar <MoveRight size={14} />
                     </button>
                 )}
            </div>
        </div>
    );
};