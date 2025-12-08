import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale, PendingSale, CartItem, CashMovement, ShiftReport, Client, User, Order, OrderStatus, Route, RouteStop } from '../types';
import { supabase } from '../services/supabase';

export interface Category { id: string; name: string; }

// Estructura del resultado de un pago (para imprimir)
export interface PaymentResult {
    success: boolean;
    paymentId: string;
    clientName: string;
    previousBalance: number;
    newBalance: number;
    amountPaid: number;
    date: string;
    details: { ticketId: string; paidAmount: number; remainingBalance: number; totalTicket: number }[];
}

interface DatabaseContextType {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  clients: Client[];
  orders: Order[];
  routes: Route[];
  pendingSaleToLoad: PendingSale | null;
  currentUser: User | null;

  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product, updateGroupPrice?: boolean) => Promise<void>; 
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;

  // CAMBIO: Ahora devuelve PaymentResult en lugar de boolean
  registerClientPayment: (clientId: string, amount: number, note?: string) => Promise<PaymentResult | null>;

  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  addRoute: (route: Omit<Route, 'id' | 'date' | 'status' | 'totalSales' | 'progress'>) => void;
  updateRouteStatus: (id: string, status: Route['status']) => void;
  updateRouteStop: (routeId: string, stopId: string, data: Partial<RouteStop>) => void;
  mockDrivers: string[];
  mockVehicles: string[];
  processSale: (items: any[], total: number, paymentMethod: 'cash'|'card'|'credit', customerName?: string, paymentDetails?: any) => Promise<void>;
  processReturn: (saleId: string, itemsToReturn: any[]) => Promise<boolean>;
  parkSale: (cart: CartItem[], total: number, customerName?: string, note?: string) => Promise<boolean>;
  getPendingSales: () => Promise<PendingSale[]>;
  deletePendingSale: (id: string) => Promise<void>;
  setSaleToLoad: (sale: PendingSale | null) => void;
  registerCashMovement: (type: 'IN'|'OUT', amount: number, reason: string) => Promise<boolean>;
  generateShiftReport: () => Promise<ShiftReport>;
  closeShift: (report: ShiftReport, countedCash: number) => Promise<boolean>;
  saleIdToInspect: string | null;
  setSaleIdToInspect: (id: string | null) => void;
  login: (method: 'password'|'pin'|'barcode', value: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);
const INITIAL_CLIENTS: Client[] = [];
const MOCK_DRIVERS = ['Roberto Gómez', 'Carlos Ruiz'];
const MOCK_VEHICLES = ['Van - XYZ789', 'Camioneta - ABC123'];
const MOCK_USERS: (User & { password?: string })[] = [{ id: '1', fullName: 'Admin', username: 'admin', role: 'Admin', password: '123', pin: '1234', barcode: 'EMP001' }, { id: '2', fullName: 'Cajero', username: 'caja', role: 'Cajero', password: '123', pin: '0000', barcode: 'EMP002' }];

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingSaleToLoad, setPendingSaleToLoad] = useState<PendingSale | null>(null);
  const [saleIdToInspect, setSaleIdToInspect] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const { data: dbProducts } = await supabase.from('products').select('*');
      if (dbProducts) {
        const mappedProducts: Product[] = dbProducts.map((p: any) => ({
            ...p, groupId: p.group_id, wholesalePrice: p.wholesale_price, wholesaleMin: p.wholesale_min, isWeighable: p.is_weighable, packPrice: p.pack_price, packQuantity: p.pack_quantity, packBarcode: p.pack_barcode, contentPerUnit: p.content_per_unit, contentUnitPrice: p.content_unit_price, shortCode: p.short_code, presentations: p.presentations || []
        }));
        setProducts(mappedProducts);
      }
      const { data: dbClients } = await supabase.from('clients').select('*');
      if (dbClients) {
          const mappedClients: Client[] = dbClients.map((c: any) => ({
              id: c.id, name: c.name, phone: c.phone, email: c.email, address: c.address, creditLimit: c.credit_limit || 0, currentBalance: c.current_balance || 0
          }));
          setClients(mappedClients);
      }
      const { data: dbCats } = await supabase.from('categories').select('*').order('name');
      if (dbCats) setCategories(dbCats);
      const { data: dbSales } = await supabase.from('sales').select(`*, items:sale_items(*)`).order('date', { ascending: false }).limit(50);
      if (dbSales) {
        const mappedSales = dbSales.map((s: any) => ({
          id: s.id, date: s.date, total: s.total, paymentMethod: s.payment_method, customerName: s.customer_name, clientId: s.client_id, remainingBalance: s.remaining_balance, amountTendered: s.amount_tendered, change: s.change, cardAuthCode: s.card_auth_code,
          items: s.items.map((i: any) => ({
            productId: i.product_id, name: i.name, price: i.price, quantity: i.quantity, subtotal: i.subtotal, returnedQuantity: i.returned_quantity || 0, groupId: products.find(p => p.id === i.product_id)?.groupId,
          }))
        }));
        setSales(mappedSales);
      }
      const storedUser = localStorage.getItem('nexpos_user');
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
      const storedOrders = localStorage.getItem('nexpos_orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => { if (!isLoading) localStorage.setItem('nexpos_orders', JSON.stringify(orders)); }, [orders, isLoading]);
  useEffect(() => { if (currentUser) localStorage.setItem('nexpos_user', JSON.stringify(currentUser)); else localStorage.removeItem('nexpos_user'); }, [currentUser]);

  const addProduct = async (newProductData: Omit<Product, 'id'>) => {
    try {
      const dbPayload = {
         name: newProductData.name || 'Sin Nombre', price: Number(newProductData.price) || 0, category: newProductData.category || 'General', stock: Number(newProductData.stock) || 0, sku: newProductData.sku || '', image: newProductData.image || '', barcode: newProductData.barcode || '', group_id: newProductData.groupId || null, wholesale_price: Number(newProductData.wholesalePrice) || 0, wholesale_min: Number(newProductData.wholesaleMin) || 0, is_weighable: Boolean(newProductData.isWeighable), pack_price: Number(newProductData.packPrice) || 0, pack_quantity: Number(newProductData.packQuantity) || 0, pack_barcode: newProductData.packBarcode || '', content_per_unit: Number(newProductData.contentPerUnit) || 1, content_unit_price: Number(newProductData.contentUnitPrice) || 0, short_code: newProductData.shortCode || '', presentations: newProductData.presentations || []
      };
      const { data, error } = await supabase.from('products').insert([dbPayload]).select().single();
      if (error) throw error;
      if (data) {
        const { data: allProds } = await supabase.from('products').select('*');
        if (allProds) {
            const mapped = allProds.map((p: any) => ({ ...p, groupId: p.group_id, wholesalePrice: p.wholesale_price, wholesaleMin: p.wholesale_min, isWeighable: p.is_weighable, packPrice: p.pack_price, packQuantity: p.pack_quantity, packBarcode: p.pack_barcode, contentPerUnit: p.content_per_unit, contentUnitPrice: p.content_unit_price, shortCode: p.short_code, presentations: p.presentations || [] }));
            setProducts(mapped);
        }
      }
    } catch (e: any) { console.error(e); alert(`Error: ${e.message}`); }
  };

  const updateProduct = async (updatedProduct: Product, updateGroupPrice: boolean = false) => {
    try {
      const dbPayload = {
         name: updatedProduct.name, price: updatedProduct.price, category: updatedProduct.category, stock: updatedProduct.stock, sku: updatedProduct.sku, image: updatedProduct.image, barcode: updatedProduct.barcode, group_id: updatedProduct.groupId, wholesale_price: updatedProduct.wholesalePrice, wholesale_min: updatedProduct.wholesaleMin, is_weighable: updatedProduct.isWeighable, pack_price: updatedProduct.packPrice, pack_quantity: updatedProduct.packQuantity, pack_barcode: updatedProduct.packBarcode, content_per_unit: updatedProduct.contentPerUnit, content_unit_price: updatedProduct.contentUnitPrice, short_code: updatedProduct.shortCode, presentations: updatedProduct.presentations
      };
      const { error } = await supabase.from('products').update(dbPayload).eq('id', updatedProduct.id);
      if (error) throw error;
      if (updateGroupPrice && updatedProduct.groupId) {
         await supabase.from('products').update({ price: updatedProduct.price, wholesale_price: updatedProduct.wholesalePrice, wholesale_min: updatedProduct.wholesaleMin }).eq('group_id', updatedProduct.groupId);
         setProducts(prev => prev.map(p => { if (p.groupId === updatedProduct.groupId) { return { ...p, price: updatedProduct.price, wholesalePrice: updatedProduct.wholesalePrice, wholesaleMin: updatedProduct.wholesaleMin }; } return p; }));
      } else { setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)); }
    } catch (e) { console.error(e); }
  };
  const deleteProduct = async (id: string) => { try { await supabase.from('products').delete().eq('id', id); setProducts(prev => prev.filter(p => p.id !== id)); } catch (e: any) { console.error(e); alert("No se pudo eliminar."); } };

  // --- CLIENTES Y ABONOS (MODIFICADO PARA RETORNAR DATOS DE IMPRESIÓN) ---
  const addClient = async (clientData: Omit<Client, 'id'>) => {
      try {
          const dbPayload = { name: clientData.name, phone: clientData.phone, email: clientData.email, address: clientData.address, credit_limit: clientData.creditLimit, current_balance: 0 };
          const { data, error } = await supabase.from('clients').insert([dbPayload]).select().single();
          if (error) throw error;
          if (data) { const newClient: Client = { ...clientData, id: data.id, currentBalance: 0 }; setClients(prev => [...prev, newClient]); }
      } catch (e: any) { alert("Error: " + e.message); }
  };

  const registerClientPayment = async (clientId: string, amount: number, note: string = ''): Promise<PaymentResult | null> => {
    try {
        const client = clients.find(c => c.id === clientId);
        if (!client) throw new Error("Cliente no encontrado");
        const previousBalance = client.currentBalance;

        // 1. Registrar pago
        const { data: paymentData, error: paymentError } = await supabase.from('client_payments').insert([{
            client_id: clientId, amount, note, recorded_by: currentUser?.fullName || 'Cajero'
        }]).select().single();
        if (paymentError) throw paymentError;

        // 2. Liquidar tickets (Guardamos el detalle)
        let remainingPayment = amount;
        const details: any[] = [];
        const { data: unpaidSales } = await supabase.from('sales').select('*').eq('client_id', clientId).gt('remaining_balance', 0).order('date', { ascending: true });

        if (unpaidSales) {
            for (const sale of unpaidSales) {
            if (remainingPayment <= 0.01) break;
              const currentDebt = sale.remainingBalance !== undefined ? sale.remainingBalance : (sale.total - (sale.amountTendered || 0));
            const paymentForThisTicket = Math.min(remainingPayment, currentDebt);
            
            const newTicketBalance = currentDebt - paymentForThisTicket;
            const newAmountTendered = (sale.amountTendered || 0) + paymentForThisTicket;

            // --- NUEVO: ACTUALIZAR HISTORIAL ---
            const newHistoryEntry = {
                date: new Date().toISOString(),
                amount: paymentForThisTicket,
                note: 'Abono parcial'
            };
            // Agregamos al historial existente (o creamos uno nuevo)
            const updatedHistory = [...(sale.paymentHistory || []), newHistoryEntry];

            // Actualizar Supabase con el historial
            await supabase.from('sales')
                .update({ 
                    remaining_balance: newTicketBalance, 
                    amount_tendered: newAmountTendered,
                    payment_history: updatedHistory // <--- Guardamos el historial
                })
                .eq('id', sale.id);
            
                remainingPayment -= paymentForThisTicket;

                details.push({
                    ticketId: sale.id,
                    paidAmount: paymentForThisTicket,
                    remainingBalance: newTicketBalance,
                    totalTicket: sale.total
                });
            }
        }

        // 3. Actualizar Cliente
        const newBalance = Math.max(0, previousBalance - amount);
        await supabase.from('clients').update({ current_balance: newBalance }).eq('id', clientId);

        // 4. Ingreso a Caja
        await registerCashMovement('IN', amount, `Abono Cliente: ${client.name}`);

        // 5. Update Local
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, currentBalance: newBalance } : c));
        
        // RETORNAR DATOS PARA EL TICKET
        return {
            success: true,
            paymentId: paymentData.id,
            clientName: client.name,
            previousBalance,
            newBalance,
            amountPaid: amount,
            date: new Date().toISOString(),
            details
        };

    } catch (e: any) { console.error("Error abono:", e); alert("Error al registrar abono."); return null; }
  };

  // --- OTRAS FUNCIONES ---
  const addCategory = async (name: string) => { try { const { data } = await supabase.from('categories').insert([{ name }]).select().single(); if(data) setCategories(prev => [...prev, data].sort((a,b)=>a.name.localeCompare(b.name))); } catch(e){} };
  const addOrder = (d: any) => setOrders(p => [{...d, id: `ORD-${Date.now()}`}, ...p]);
  const updateOrderStatus = (id: string, s: any) => setOrders(p => p.map(o => o.id === id ? { ...o, status: s } : o));
  const deleteOrder = (id: string) => setOrders(p => p.filter(o => o.id !== id));
  const addRoute = (d: any) => setRoutes(p => [{...d, id: `RUT-${Date.now()}`}, ...p]);
  const updateRouteStatus = (id: string, s: any) => setRoutes(p => p.map(r => r.id === id ? { ...r, status: s } : r));
  const updateRouteStop = (rid: string, sid: string, d: any) => setRoutes(p => p.map(r => r.id === rid ? {...r} : r));
  const processSale = async (cartItems: any[], total: number, paymentMethod: 'cash'|'card'|'credit', customerName?: string, paymentDetails?: any) => {
    try {
        const { data: saleData, error: saleError } = await supabase.from('sales').insert([{
            total, payment_method: paymentMethod, customer_name: customerName, client_id: paymentDetails?.clientId || null,
            remaining_balance: paymentMethod === 'credit' ? total : 0, amount_tendered: paymentDetails?.amountTendered, change: paymentDetails?.change, card_auth_code: paymentDetails?.cardAuthCode, date: new Date().toISOString()
        }]).select().single();
        if (saleError) throw saleError;
        const itemsToInsert = cartItems.map((item: any) => ({ sale_id: saleData.id, product_id: item.id, name: item.name, price: item.price, quantity: item.quantity, subtotal: item.finalPrice ? item.finalPrice * item.quantity : item.price * item.quantity }));
        await supabase.from('sale_items').insert(itemsToInsert);
        for (const item of cartItems) {
            const currentProd = products.find(p => p.id === item.id);
            if (currentProd) {
                const factor = item.packQuantity || 1;
                const quantityToDeduct = item.quantity * factor;
                const newStock = Math.max(0, currentProd.stock - quantityToDeduct);
                await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
            }
        }
        if (paymentMethod === 'credit' && paymentDetails?.clientId) {
             const currentClient = clients.find(c => c.id === paymentDetails.clientId);
             if (currentClient) {
                 const newBalance = (currentClient.currentBalance || 0) + total;
                 await supabase.from('clients').update({ current_balance: newBalance }).eq('id', paymentDetails.clientId);
                 setClients(prev => prev.map(c => c.id === paymentDetails.clientId ? { ...c, currentBalance: newBalance } : c));
             }
        }
        const newLocalSale: Sale = { id: saleData.id, date: saleData.date, total, paymentMethod, customerName, clientId: paymentDetails?.clientId, remainingBalance: paymentMethod === 'credit' ? total : 0, items: cartItems.map((item:any) => ({ productId: item.id, name: item.name, price: item.finalPrice || item.price, quantity: item.quantity, subtotal: (item.finalPrice || item.price) * item.quantity, returnedQuantity: 0 })), ...paymentDetails };
        setSales(prev => [newLocalSale, ...prev]);
        const { data: updatedProds } = await supabase.from('products').select('*');
        if (updatedProds) { const mapped = updatedProds.map((p:any) => ({ ...p, groupId: p.group_id, wholesalePrice: p.wholesale_price, wholesaleMin: p.wholesale_min, isWeighable: p.is_weighable, packPrice: p.pack_price, packQuantity: p.pack_quantity, packBarcode: p.pack_barcode, contentPerUnit: p.content_per_unit, contentUnitPrice: p.content_unit_price, shortCode: p.short_code, presentations: p.presentations || [] })); setProducts(mapped); }
    } catch (error: any) { console.error("Error processing sale:", error.message); alert("Error al procesar venta"); }
  };
  const processReturn = async (saleId: string, itemsToReturn: any[]) => {
    try {
        let totalRefund = 0;
        for (const item of itemsToReturn) {
            if (item.quantity > 0) {
                totalRefund += item.quantity * item.price;
                const { data: saleItemData } = await supabase.from('sale_items').select('returned_quantity').match({ sale_id: saleId, product_id: item.productId }).single();
                const currentReturned = saleItemData?.returned_quantity || 0;
                await supabase.from('sale_items').update({ returned_quantity: currentReturned + item.quantity }).match({ sale_id: saleId, product_id: item.productId });
                const { data: prodData } = await supabase.from('products').select('stock').eq('id', item.productId).single();
                if (prodData) { await supabase.from('products').update({ stock: prodData.stock + item.quantity }).eq('id', item.productId); }
            }
        }
        if (totalRefund > 0) await registerCashMovement('OUT', totalRefund, `Devolución Venta #${saleId.slice(0,6)}`);
        setSales(prev => prev.map(s => { if (s.id !== saleId) return s; const updatedItems = s.items.map(i => { const retItem = itemsToReturn.find(r => r.productId === i.productId); return retItem ? { ...i, returnedQuantity: (i.returnedQuantity || 0) + retItem.quantity } : i; }); return { ...s, items: updatedItems }; }));
        return true;
    } catch (e: any) { console.error("Error devolución:", e); return false; }
  };
  const parkSale = async (c: any, t: number) => { await supabase.from('pending_sales').insert([{ total: t, items: c }]); return true; };
  const getPendingSales = async () => { const {data} = await supabase.from('pending_sales').select('*'); return data || []; };
  const deletePendingSale = async (id: string) => { await supabase.from('pending_sales').delete().eq('id', id); };
  const setSaleToLoad = (s: PendingSale | null) => setPendingSaleToLoad(s);
  const registerCashMovement = async (t: any, a: number, r: string) => { await supabase.from('cash_movements').insert([{type:t, amount:a, reason:r}]); return true; };
  const generateShiftReport = async () => {
     const todayISO = new Date(new Date().setHours(0,0,0,0)).toISOString();
     const { data: movements } = await supabase.from('cash_movements').select('*').gte('created_at', todayISO);
     const todaySales = sales.filter(s => new Date(s.date) >= new Date(todayISO));
     const cashSales = todaySales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
     const cardSales = todaySales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0);
     const cashIn = (movements || []).filter((m:any) => m.type === 'IN').reduce((sum:number, m:any) => sum + m.amount, 0);
     const cashOut = (movements || []).filter((m:any) => m.type === 'OUT').reduce((sum:number, m:any) => sum + m.amount, 0);
     return { generatedAt: new Date().toISOString(), salesCount: todaySales.length, totalSales: cashSales + cardSales, cashSales, cardSales, initialFund: 0, cashIn, cashOut, expectedCashInDrawer: cashSales + cashIn - cashOut };
  };
  const closeShift = async (r: any, c: number) => true;
  const login = async (m: any, v: string) => { const u = MOCK_USERS.find(u => (m==='pin'?u.pin===v:u.username===JSON.parse(v).username)); if(u) { setCurrentUser(u as any); return true; } return false; };
  const logout = () => setCurrentUser(null);

  return (
    <DatabaseContext.Provider value={{ 
      products, categories, sales, clients, orders, routes, pendingSaleToLoad, currentUser,
      addProduct, updateProduct, deleteProduct, addCategory, addClient, registerClientPayment,
      addOrder, updateOrderStatus, deleteOrder, addRoute, updateRouteStatus, updateRouteStop,
      processSale, processReturn, parkSale, getPendingSales, deletePendingSale,
      registerCashMovement, generateShiftReport, closeShift, setSaleToLoad,
      isLoading, saleIdToInspect, setSaleIdToInspect, login, logout, 
      mockDrivers: MOCK_DRIVERS, mockVehicles: MOCK_VEHICLES
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext)!;