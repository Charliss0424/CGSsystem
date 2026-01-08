import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { ArrowLeft, Box, CheckSquare, Square, LogOut, PackageCheck } from 'lucide-react';
import Swal from 'sweetalert2';

// Este componente simula una APP Móvil
export const WarehousePicking = ({ onBack }: { onBack: () => void }) => {
    const { orders, updateOrderStatus, currentUser, logout } = useDatabase();
    
    // Solo mostramos pedidos pendientes o en proceso
    const pendingOrders = orders.filter(o => 
        (o.status === 'PENDING' || (o.status === 'PROCESSING' && !o.picking_completed))
    );

    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    const activeOrder = orders.find(o => o.id === selectedOrder);

    const toggleItem = (itemId: string) => {
        setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const handleFinishPicking = async () => {
        if (!activeOrder) return;
        
        // Validar que todo esté marcado
        const allChecked = activeOrder.items?.every((item: any) => checkedItems[item.product_id || item.id]);
        
        if (!allChecked) {
            const confirm = await Swal.fire({
                title: '¿Pedido Incompleto?',
                text: "No has marcado todos los productos. ¿Finalizar surtido de todas formas?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, finalizar',
                cancelButtonText: 'Seguir surtiendo'
            });
            if (!confirm.isConfirmed) return;
        }

        // Actualizar en BD (Necesitamos que updateOrderStatus maneje el flag picking_completed)
        // Como tu contexto actual es genérico, aquí simulamos la llamada directa si tienes acceso a supabase
        // O usamos la función del contexto:
        await updateOrderStatus(activeOrder.id, 'PROCESSING'); 
        // IMPORTANTE: Aquí asumo que modificaste el updateOrderStatus del contexto 
        // para que acepte un objeto o actualices el picking_completed = true.
        
        // Si no, puedes hacer updateOrderStatus(id, { status: 'PROCESSING', picking_completed: true }) 
        // si ajustas la firma de tu función en el context.

        Swal.fire('¡Excelente!', 'Pedido marcado como surtido', 'success');
        setSelectedOrder(null);
        setCheckedItems({});
    };

    // VISTA DETALLE DEL PEDIDO
    if (activeOrder) {
        return (
            <div className="bg-gray-100 min-h-screen pb-20">
                <div className="bg-blue-700 text-white p-4 sticky top-0 z-10 flex items-center gap-3 shadow-md">
                    <button onClick={() => setSelectedOrder(null)}><ArrowLeft size={28} /></button>
                    <div>
                        <h1 className="text-xl font-bold">Folio: {activeOrder.orderFolio}</h1>
                        <p className="text-xs opacity-80">{activeOrder.customerName}</p>
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    {activeOrder.items?.map((item: any, idx: number) => {
                        const isChecked = checkedItems[item.product_id || item.id];
                        return (
                            <div 
                                key={idx} 
                                onClick={() => toggleItem(item.product_id || item.id)}
                                className={`p-4 rounded-xl flex items-center justify-between shadow-sm transition-all active:scale-95 ${isChecked ? 'bg-green-50 border-2 border-green-500' : 'bg-white border border-gray-200'}`}
                            >
                                <div>
                                    <div className="text-lg font-bold text-gray-800">{item.name}</div>
                                    <div className="text-sm text-gray-500">SKU: {item.sku || 'N/A'}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">x{item.quantity}</div>
                                    {isChecked 
                                        ? <CheckSquare size={32} className="text-green-600" />
                                        : <Square size={32} className="text-gray-300" />
                                    }
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                    <button 
                        onClick={handleFinishPicking}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg active:bg-blue-700 flex items-center justify-center gap-2"
                    >
                        <PackageCheck size={24} /> Terminar Surtido
                    </button>
                </div>
            </div>
        );
    }

    // VISTA LISTA DE PEDIDOS
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-slate-900 text-white p-5 sticky top-0 z-10 flex justify-between items-center shadow-lg">
                <div>
                    <h1 className="text-2xl font-bold">Almacén</h1>
                    <p className="text-xs text-slate-400">Usuario: {currentUser?.fullName}</p>
                </div>
                <button onClick={logout} className="p-2 bg-slate-800 rounded-lg"><LogOut size={20}/></button>
            </div>

            <div className="p-4">
                <h2 className="text-slate-500 font-bold mb-3 uppercase text-sm tracking-wider">Pedidos por Surtir ({pendingOrders.length})</h2>
                
                <div className="space-y-3">
                    {pendingOrders.map(order => (
                        <div 
                            key={order.id}
                            onClick={() => setSelectedOrder(order.id)}
                            className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 active:bg-blue-50 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-sm">{order.orderFolio}</span>
                                <span className="text-xs text-gray-400">{new Date(order.deliveryDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{order.customerName}</h3>
                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                                <Box size={16} />
                                <span>{order.items?.length || 0} productos diferentes</span>
                            </div>
                            {order.priority === 'Alta' && (
                                <div className="mt-2 text-red-600 text-xs font-bold uppercase flex items-center gap-1">
                                    🔥 Prioridad Alta
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {pendingOrders.length === 0 && (
                        <div className="text-center py-20 opacity-50">
                            <PackageCheck size={64} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-xl font-bold text-gray-500">Todo surtido</p>
                            <p className="text-sm">No hay pedidos pendientes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};