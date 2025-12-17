import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Product, Sale, PendingSale, CartItem, CashMovement, ShiftReport, 
  Client, User, Order, OrderStatus, Route, RouteStop, StoreSettings, Tax,
  License, Supplier, Purchase // Importamos Purchase
} from '../types';
import { supabase } from '../services/supabase';

export interface Category { id: string; name: string; }

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
  // Datos
  products: Product[];
  categories: Category[];
  taxes: Tax[];
  sales: Sale[];
  clients: Client[];
  suppliers: Supplier[];
  orders: Order[];
  routes: Route[];
  settings: StoreSettings | null;
  pendingSaleToLoad: PendingSale | null;
  
  currentUser: User | null;
  users: User[];
  license: License;

  // Funciones Productos
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product, updateGroupPrice?: boolean) => Promise<void>; 
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;

  // Funciones Impuestos
  addTax: (name: string, rate: number, code: string) => Promise<void>;
  deleteTax: (id: string) => Promise<void>;
  
  // Funciones Clientes y Proveedores
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  registerClientPayment: (clientId: string, amount: number, note?: string) => Promise<PaymentResult | null>;

  // Funciones Ventas
  processSale: (items: any[], total: number, paymentMethod: 'cash'|'card'|'credit', customerName?: string, paymentDetails?: any) => Promise<void>;
  
  // --- FUNCIÓN DE COMPRAS CORREGIDA ---
  processPurchase: (items: any[], total: number, supplierId: string, invoiceNumber: string, orderReference?: string) => Promise<boolean>;

  processReturn: (saleId: string, productId: string, quantity: number) => Promise<void>;
  parkSale: (cart: CartItem[], total: number, customerName?: string, type?: 'GENERAL' | 'CONSIGNMENT', note?: string) => Promise<boolean>;
  getPendingSales: () => Promise<PendingSale[]>;
  deletePendingSale: (id: string) => Promise<void>;
  setSaleToLoad: (sale: PendingSale | null) => void;
  logCancellation: (sale: PendingSale, reason: string, user: string) => Promise<void>;

  // Funciones Caja y Configuración
  registerCashMovement: (type: 'IN'|'OUT', amount: number, reason: string) => Promise<boolean>;
  generateShiftReport: () => Promise<ShiftReport>;
  closeShift: (report: ShiftReport, countedCash: number) => Promise<boolean>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;

  // Funciones Usuarios
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  updateUser: (user: User) => Promise<void>;
  toggleUserStatus: (id: string, currentStatus: boolean) => Promise<void>;

  // Placeholders y Auth
  addOrder: (order: any) => void;
  updateOrderStatus: (id: string, status: any) => void;
  deleteOrder: (id: string) => void;
  addRoute: (route: any) => void;
  updateRouteStatus: (id: string, status: any) => void;
  updateRouteStop: (routeId: string, stopId: string, data: any) => void;
  mockDrivers: string[];
  mockVehicles: string[];
  saleIdToInspect: string | null;
  setSaleIdToInspect: (id: string | null) => void;
  login: (method: 'password'|'pin'|'barcode', value: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// --- MOCKS ---
const MOCK_DRIVERS = ['Roberto Gómez', 'Carlos Ruiz', 'Juan Pérez'];
const MOCK_VEHICLES = ['Van - XYZ789', 'Camioneta - ABC123'];
const DEFAULT_ADMIN: User = { id: '1', fullName: 'Admin', username: 'admin', role: 'ADMIN', isActive: true, createdAt: new Date().toISOString(), pin: '1234', barcode: 'EMP001' };

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  
  const [users, setUsers] = useState<User[]>([DEFAULT_ADMIN]);
  const [license, setLicense] = useState<License>({ level: 'PROFESSIONAL', maxUsers: 10, features: [] });
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingSaleToLoad, setPendingSaleToLoad] = useState<PendingSale | null>(null);
  const [saleIdToInspect, setSaleIdToInspect] = useState<string | null>(null);

  // --- CARGA INICIAL DE DATOS ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      const { data: dbSettings } = await supabase.from('settings').select('*').single();
      if (dbSettings) setSettings({ id: dbSettings.id, storeName: dbSettings.store_name, address: dbSettings.address, phone: dbSettings.phone, taxId: dbSettings.tax_id, ticketFooter: dbSettings.ticket_footer, taxRate: dbSettings.tax_rate, logoUrl: dbSettings.logo_url });

      const { data: dbProducts } = await supabase.from('products').select('*');
      if (dbProducts) setProducts(dbProducts.map((p: any) => ({ ...p, groupId: p.group_id, wholesalePrice: p.wholesale_price, wholesaleMin: p.wholesale_min, isWeighable: p.is_weighable, packPrice: p.pack_price, packQuantity: p.pack_quantity, packBarcode: p.pack_barcode, contentPerUnit: p.content_per_unit, contentUnitPrice: p.content_unit_price, shortCode: p.short_code, presentations: p.presentations || [] })));

      const { data: dbClients } = await supabase.from('clients').select('*');
      if (dbClients) setClients(dbClients.map((c: any) => ({ id: c.id, name: c.name, phone: c.phone, email: c.email, address: c.address, creditLimit: c.credit_limit || 0, currentBalance: c.current_balance || 0, since: c.created_at || new Date().toISOString(), tags: c.tags || [] })));

      const { data: dbSuppliers } = await supabase.from('suppliers').select('*');
      if (dbSuppliers) setSuppliers(dbSuppliers.map((s:any) => ({ id: s.id, name: s.name, contactName: s.contact_name, phone: s.phone, email: s.email, rfc: s.tax_id }))); // Ajustado a tax_id

      const { data: dbCats } = await supabase.from('categories').select('*').order('name');
      if (dbCats) setCategories(dbCats);
      const { data: dbTaxes } = await supabase.from('taxes').select('*').order('rate', { ascending: false });
      if (dbTaxes) setTaxes(dbTaxes.map((t: any) => ({ id: t.id, name: t.name, rate: t.rate, code: t.code, isActive: t.is_active })));

      const { data: dbSales } = await supabase.from('sales').select(`*, items:sale_items(*)`).order('date', { ascending: false }).limit(50);
      if (dbSales) setSales(dbSales.map((s: any) => ({
          id: s.id, date: s.date, total: s.total, paymentMethod: s.payment_method, customerName: s.customer_name, clientId: s.client_id, remainingBalance: s.remaining_balance, amountTendered: s.amount_tendered, change: s.change, cardAuthCode: s.card_auth_code, paymentHistory: s.payment_history || [],
          z_report_id: s.z_report_id, reprint_count: s.reprint_count,
          items: s.items.map((i: any) => ({ productId: i.product_id, name: i.name, price: i.price, quantity: i.quantity, subtotal: i.subtotal, returnedQuantity: i.returned_quantity || 0, groupId: products.find(p => p.id === i.product_id)?.groupId }))
      })));
      
      const storedUser = localStorage.getItem('nexpos_user');
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
      const storedOrders = localStorage.getItem('nexpos_orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));

      setIsLoading(false);
    };
    loadData();
  }, []); 

  // Persistencia
  useEffect(() => { if (currentUser) localStorage.setItem('nexpos_user', JSON.stringify(currentUser)); else localStorage.removeItem('nexpos_user'); }, [currentUser]);
  useEffect(() => { if (!isLoading) localStorage.setItem('nexpos_orders', JSON.stringify(orders)); }, [orders, isLoading]);

  // --- CRUD PRODUCTOS ---
  const addProduct = async (newProductData: Omit<Product, 'id'>) => {
    try {
      const dbPayload = { name: newProductData.name, price: newProductData.price, category: newProductData.category, stock: newProductData.stock, sku: newProductData.sku, image: newProductData.image, barcode: newProductData.barcode, group_id: newProductData.groupId, wholesale_price: newProductData.wholesalePrice, wholesale_min: newProductData.wholesaleMin, is_weighable: newProductData.isWeighable, pack_price: newProductData.packPrice, pack_quantity: newProductData.packQuantity, pack_barcode: newProductData.packBarcode, presentations: newProductData.presentations, content_per_unit: newProductData.contentPerUnit, content_unit_price: newProductData.contentUnitPrice, short_code: newProductData.shortCode };
      const { data } = await supabase.from('products').insert([dbPayload]).select().single();
      if (data) {
        const newProd = { ...data, groupId: data.group_id, wholesalePrice: data.wholesale_price, wholesaleMin: data.wholesale_min, isWeighable: data.is_weighable, packPrice: data.pack_price, packQuantity: data.pack_quantity, packBarcode: data.pack_barcode, presentations: data.presentations, contentPerUnit: data.content_per_unit, contentUnitPrice: data.content_unit_price, shortCode: data.short_code };
        setProducts(prev => [...prev, newProd]);
      }
    } catch (e) { console.error(e); }
  };

  const updateProduct = async (updatedProduct: Product, updateGroupPrice: boolean = false) => {
    try {
      const dbPayload = { name: updatedProduct.name, price: updatedProduct.price, category: updatedProduct.category, stock: updatedProduct.stock, sku: updatedProduct.sku, image: updatedProduct.image, barcode: updatedProduct.barcode, group_id: updatedProduct.groupId, wholesale_price: updatedProduct.wholesalePrice, wholesale_min: updatedProduct.wholesaleMin, is_weighable: updatedProduct.isWeighable, pack_price: updatedProduct.packPrice, pack_quantity: updatedProduct.packQuantity, pack_barcode: updatedProduct.packBarcode, presentations: updatedProduct.presentations, content_per_unit: updatedProduct.contentPerUnit, content_unit_price: updatedProduct.contentUnitPrice, short_code: updatedProduct.shortCode };
      await supabase.from('products').update(dbPayload).eq('id', updatedProduct.id);
      if (updateGroupPrice && updatedProduct.groupId) {
         await supabase.from('products').update({ price: updatedProduct.price, wholesale_price: updatedProduct.wholesalePrice, wholesale_min: updatedProduct.wholesaleMin }).eq('group_id', updatedProduct.groupId);
         setProducts(prev => prev.map(p => p.groupId === updatedProduct.groupId ? { ...p, price: updatedProduct.price, wholesalePrice: updatedProduct.wholesalePrice, wholesaleMin: updatedProduct.wholesaleMin } : p));
      } else { setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)); }
    } catch (e) { console.error(e); }
  };
  
  const deleteProduct = async (id: string) => { try { await supabase.from('products').delete().eq('id', id); setProducts(prev => prev.filter(p => p.id !== id)); } catch (e) { console.error(e); } };

  // --- CRUD AUXILIARES ---
  const addCategory = async (name: string) => { try { const { data } = await supabase.from('categories').insert([{ name }]).select().single(); if(data) setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name))); } catch (e) { console.error(e); } };
  const addTax = async (name: string, rate: number, code: string) => { try { const { data } = await supabase.from('taxes').insert([{ name, rate, code }]).select().single(); if (data) setTaxes(prev => [...prev, { id: data.id, name: data.name, rate: data.rate, code: data.code, isActive: data.is_active }]); } catch (e) { console.error(e); } };
  const deleteTax = async (id: string) => { try { await supabase.from('taxes').delete().eq('id', id); setTaxes(prev => prev.filter(t => t.id !== id)); } catch (e) { console.error(e); } };
  const addClient = async (clientData: Omit<Client, 'id'>) => { try { const dbPayload = { name: clientData.name, phone: clientData.phone, email: clientData.email, address: clientData.address, credit_limit: clientData.creditLimit, current_balance: 0, tags: clientData.tags }; const { data } = await supabase.from('clients').insert([dbPayload]).select().single(); if (data) { const newClient: Client = { ...clientData, id: data.id, currentBalance: 0, level: 'Standard', points: 0, since: new Date().toISOString() }; setClients(prev => [...prev, newClient]); } } catch (e) {} };
  
  const addSupplier = async (supplierData: Omit<Supplier, 'id'>) => { 
      try { 
          const dbPayload = { 
              name: supplierData.name, 
              contact_name: supplierData.contact, // Corregido: contact -> contact_name
              phone: supplierData.phone, 
              email: supplierData.email, 
              address: supplierData.address, 
              tax_id: supplierData.tax_id, // Corregido: rfc -> tax_id
              status: supplierData.status || 'Active'
          }; 
          const { data } = await supabase.from('suppliers').insert([dbPayload]).select().single(); 
          if (data) setSuppliers(prev => [...prev, { ...supplierData, id: data.id }]); 
      } catch (e) { console.error(e); } 
  };
  
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    if (!settings) return;
    try {
        const dbPayload = { store_name: newSettings.storeName, address: newSettings.address, phone: newSettings.phone, tax_id: newSettings.taxId, ticket_footer: newSettings.ticketFooter, tax_rate: newSettings.taxRate, logo_url: newSettings.logoUrl };
        await supabase.from('settings').update(dbPayload).eq('id', settings.id);
        setSettings({ ...settings, ...newSettings });
    } catch (e) { console.error(e); }
  };

  // --- COBRANZA Y ABONOS ---
  const registerClientPayment = async (clientId: string, amount: number, note: string = ''): Promise<PaymentResult | null> => {
    try {
        const client = clients.find(c => c.id === clientId);
        if (!client) throw new Error("Cliente no encontrado");
        const previousBalance = client.currentBalance;
        await registerCashMovement('IN', amount, `Abono Cliente: ${client.name}`);
        
        let remainingPayment = amount;
        const details: any[] = [];
        const unpaidSales = sales.filter(s => (s.clientId === clientId || s.customerName === client.name)).map(s => ({ ...s, actualDebt: s.remainingBalance !== undefined ? s.remainingBalance : (s.total - (s.amountTendered || 0)) })).filter(s => s.actualDebt > 0.01).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const updatedSalesData: any[] = [];

        for (const sale of unpaidSales) {
            if (remainingPayment <= 0.01) break;
            const currentDebt = sale.actualDebt;
            const paymentForThisTicket = Math.min(remainingPayment, currentDebt);
            const newTicketBalance = currentDebt - paymentForThisTicket;
            const newAmountTendered = (sale.amountTendered || 0) + paymentForThisTicket;

            const newHistoryItem = { date: new Date().toISOString(), amount: paymentForThisTicket, note: note || 'Abono en caja' };
            const currentHistory = sale.paymentHistory || []; 
            const newHistory = [...currentHistory, newHistoryItem];

            await supabase.from('sales').update({ remaining_balance: newTicketBalance, amount_tendered: newAmountTendered, payment_history: newHistory }).eq('id', sale.id);
            updatedSalesData.push({ id: sale.id, newBalance: newTicketBalance, newPaid: newAmountTendered, newHistory });
            remainingPayment -= paymentForThisTicket;
            details.push({ ticketId: sale.id, paidAmount: paymentForThisTicket, remainingBalance: newTicketBalance, totalTicket: sale.total });
        }

        const newBalance = Math.max(0, previousBalance - amount);
        await supabase.from('clients').update({ current_balance: newBalance }).eq('id', clientId);
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, currentBalance: newBalance } : c));
        setSales(prev => prev.map(s => { const update = updatedSalesData.find(u => u.id === s.id); return update ? { ...s, remainingBalance: update.newBalance, amountTendered: update.newPaid, paymentHistory: update.newHistory } : s; }));
        return { success: true, paymentId: `PAY-${Date.now().toString().slice(-6)}`, clientName: client.name, previousBalance, newBalance, amountPaid: amount, date: new Date().toISOString(), details };
    } catch (e: any) { console.error("Error abono:", e); return null; }
  };

  // --- PROCESAR VENTA ---
  const processSale = async (cartItems: any[], total: number, paymentMethod: 'cash'|'card'|'credit', customerName?: string, paymentDetails?: any) => {
    try {
        const { data: saleData } = await supabase.from('sales').insert([{ total, payment_method: paymentMethod, customer_name: customerName, client_id: paymentDetails?.clientId || null, remaining_balance: paymentMethod === 'credit' ? total : 0, amount_tendered: paymentDetails?.amountTendered, change: paymentDetails?.change, card_auth_code: paymentDetails?.cardAuthCode, date: new Date().toISOString() }]).select().single();
        const itemsToInsert = cartItems.map((item: any) => ({ sale_id: saleData.id, product_id: item.id, name: item.name, price: item.price, quantity: item.quantity, subtotal: item.finalPrice ? item.finalPrice * item.quantity : item.price * item.quantity }));
        await supabase.from('sale_items').insert(itemsToInsert);
        for (const item of cartItems) {
            const currentProd = products.find(p => p.id === item.id);
            if (currentProd) {
                const quantityToDeduct = item.selectedPresentation ? item.quantity * item.selectedPresentation.quantity : (item.isPackSale ? item.quantity * (currentProd.packQuantity || 1) : item.quantity);
                await supabase.from('products').update({ stock: Math.max(0, currentProd.stock - quantityToDeduct) }).eq('id', item.id);
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
        const newLocalSale: Sale = { id: saleData.id, date: saleData.date, total, paymentMethod, customerName, clientId: paymentDetails?.clientId, remainingBalance: paymentMethod === 'credit' ? total : 0, items: cartItems, ...paymentDetails };
        setSales(prev => [newLocalSale, ...prev]);
        const { data: updatedProds } = await supabase.from('products').select('*');
        if (updatedProds) { const mapped = updatedProds.map((p:any) => ({ ...p, groupId: p.group_id, wholesalePrice: p.wholesale_price, wholesaleMin: p.wholesale_min, isWeighable: p.is_weighable, packPrice: p.pack_price, packQuantity: p.pack_quantity, packBarcode: p.pack_barcode, presentations: p.presentations || [] })); setProducts(mapped); }
    } catch (error) { console.error("Error venta:", error); }
  };

  // --- PROCESAR COMPRA (CORREGIDO PARA DB NUEVA) ---
  const processPurchase = async (items: any[], total: number, supplierId: string, invoiceNumber: string, orderReference?: string) => {
    try {
        // 1. Insertar Cabecera
        const { data: purchase, error: purchaseError } = await supabase.from('purchases').insert([{ 
            supplier_id: supplierId, 
            invoice_number: invoiceNumber, 
            order_reference: orderReference || '', 
            total_amount: total, 
            status: 'RECEIVED' // El stock ya entra
        }]).select().single();

        if (purchaseError) throw purchaseError;

        // 2. Insertar Items
        const itemsToInsert = items.map((i: any) => ({ 
            purchase_id: purchase.id, 
            product_id: i.productId, 
            quantity: i.quantity, 
            unit_cost: i.cost 
        }));
        
        await supabase.from('purchase_items').insert(itemsToInsert);

        // 3. Actualizar Stock y Costo Promedio (Lógica Industrial Simple)
        for (const item of items) {
            const currentProd = products.find(p => p.id === item.productId);
            if (currentProd) {
                const newStock = currentProd.stock + item.quantity;
                // Aquí podrías implementar promedio ponderado si quisieras
                // Por ahora actualizamos al último costo
                await supabase.from('products')
                    .update({ stock: newStock, cost_price: item.cost })
                    .eq('id', item.productId);
            }
        }

        // 4. Registrar Salida de Dinero (Caja Chica)
        await registerCashMovement('OUT', total, `Pago Compra Factura: ${invoiceNumber}`);

        // 5. Refrescar Frontend
        const { data: updated } = await supabase.from('products').select('*');
        if(updated) setProducts(updated.map((p:any) => ({...p, groupId: p.group_id})));
        
        return true;
    } catch(e) { 
        console.error("Error procesando compra:", e); 
        return false; 
    }
  };

  const parkSale = async (cart: CartItem[], total: number, customerName?: string, type: 'GENERAL' | 'CONSIGNMENT' = 'GENERAL', note: string = '') => {
    try {
      const { error } = await supabase.from('pending_sales').insert([{ customer_name: customerName || 'Cliente General', note, total, items: cart, item_count: cart.reduce((acc, item) => acc + item.quantity, 0), type, status: 'PENDING', created_by: currentUser?.fullName || 'Sistema', created_at: new Date().toISOString() }]);
      if (error) throw error; return true;
    } catch (err) { console.error("Error parking sale:", err); return false; }
  };

  const logCancellation = async (sale: PendingSale, reason: string, user: string) => { try { await supabase.from('cancellation_logs').insert([{ user_name: user, sale_type: sale.type, reason, amount: sale.total, details: sale.items }]); } catch(e){} };
  
  // --- DEVOLUCIONES ---
  const processReturn = async (saleId: string, productId: string, quantity: number) => { 
      try {
        const { data: prod } = await supabase.from('products').select('stock, price').eq('id', productId).single();
        if (!prod) return;
        await supabase.from('products').update({ stock: prod.stock + quantity }).eq('id', productId);
        await registerCashMovement('OUT', quantity * prod.price, `Devolución Venta ID: ${saleId.slice(0,6)}`);
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: p.stock + quantity } : p));
      } catch (e) { console.error(e); }
  };

  const getPendingSales = async () => { const {data} = await supabase.from('pending_sales').select('*'); return data || []; };
  const deletePendingSale = async (id: string) => { await supabase.from('pending_sales').delete().eq('id', id); };
  const setSaleToLoad = (s: PendingSale | null) => setPendingSaleToLoad(s);
  const registerCashMovement = async (t: any, a: number, r: string) => { await supabase.from('cash_movements').insert([{type:t, amount:a, reason:r}]); return true; };
  
  const generateShiftReport = async () => {
    const todayISO = new Date(new Date().setHours(0,0,0,0)).toISOString();
    let movements: CashMovement[] = []; const { data } = await supabase.from('cash_movements').select('*').gte('created_at', todayISO); if (data) movements = data as CashMovement[];
    const todaySales = sales.filter(s => new Date(s.date) >= new Date(todayISO));
    const cashSales = todaySales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);
    const cardSales = todaySales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0);
    const cashIn = movements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.amount, 0);
    const cashOut = movements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.amount, 0);
    const productMap: any = {};
    todaySales.forEach(sale => sale.items.forEach((item: any) => { if (!productMap[item.productId]) productMap[item.productId] = { name: item.name, quantity: 0, total: 0 }; productMap[item.productId].quantity += item.quantity; productMap[item.productId].total += item.subtotal; }));
    const soldProducts = Object.keys(productMap).map(id => ({ id, ...productMap[id] })).sort((a:any, b:any) => b.total - a.total);
    return { generatedAt: new Date().toISOString(), salesCount: todaySales.length, totalSales: cashSales + cardSales, cashSales, cardSales, initialFund: 0, cashIn, cashOut, expectedCashInDrawer: cashSales + cashIn - cashOut, soldProducts };
  };
  
  const closeShift = async (r: any, c: number) => true;

  // USER MANAGEMENT
  const addUser = async (u: any) => { setUsers(p => [...p, {...u, id: crypto.randomUUID()}]); return true; };
  const updateUser = async (u: any) => { setUsers(p => p.map(usr => usr.id === u.id ? u : usr)); };
  const toggleUserStatus = async (id: string) => {};

  const login = async (m: any, v: string) => { const u = users.find(u => (m==='pin' ? u.pin === v : u.username === JSON.parse(v).username)); if(u && u.isActive) { setCurrentUser(u); return true; } return false; };
  const logout = () => setCurrentUser(null);
  
  const addOrder = () => {}; const updateOrderStatus = () => {}; const deleteOrder = () => {}; const addRoute = () => {}; const updateRouteStatus = () => {}; const updateRouteStop = () => {};

  return (
    <DatabaseContext.Provider value={{ 
      products, categories, taxes, sales, clients, suppliers, orders, routes, settings, pendingSaleToLoad, currentUser, 
      users, license,
      addProduct, updateProduct, deleteProduct, addCategory, addTax, deleteTax, addClient, addSupplier, registerClientPayment, logCancellation, updateSettings,
      addUser, updateUser, toggleUserStatus, 
      addOrder, updateOrderStatus, deleteOrder, addRoute, updateRouteStatus, updateRouteStop,
      processSale, processPurchase, processReturn, parkSale, getPendingSales, deletePendingSale,
      registerCashMovement, generateShiftReport, closeShift, setSaleToLoad,
      isLoading, saleIdToInspect, setSaleIdToInspect, login, logout, 
      mockDrivers: MOCK_DRIVERS, mockVehicles: MOCK_VEHICLES
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext)!;