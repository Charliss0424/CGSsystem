import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Product, Sale, PendingSale, CartItem, CashMovement, ShiftReport, 
  Client, User, Order, OrderStatus, Route, RouteStop, StoreSettings, Tax,
  License, Supplier, Purchase 
} from '../types';
import { supabase } from '../services/supabase';

// --- INTERFACES AUXILIARES ---
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
  addClient: (client: Omit<Client, 'id'>) => Promise<boolean>; 
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  registerClientPayment: (clientId: string, amount: number, note?: string) => Promise<PaymentResult | null>;

  // Funciones Ventas
  processSale: (items: any[], total: number, paymentMethod: 'cash'|'card'|'credit', customerName?: string, paymentDetails?: any) => Promise<void>;
  
  // Funciones Compras
  processPurchase: (items: any[], total: number, supplierId: string, invoiceNumber: string, orderReference?: string) => Promise<boolean>;

  // Funciones Operativas
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

  // Funciones Pedidos (ORDERS)
  addOrder: (order: any) => Promise<void>;
  updateOrderStatus: (id: string, status: any) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  
  // Rutas
  addRoute: (route: any) => void;
  updateRouteStatus: (id: string, status: any) => void;
  updateRouteStop: (routeId: string, stopId: string, data: any) => void;
  
  // Auth y Utils
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
const DEFAULT_ADMIN: User = { 
    id: '1', fullName: 'Admin', username: 'admin', role: 'ADMIN', 
    isActive: true, createdAt: new Date().toISOString(), pin: '1234', password: 'admin', cardCode: 'EMP001' 
};

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estados de Datos
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [users, setUsers] = useState<User[]>([DEFAULT_ADMIN]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Estados de App
  const [license, setLicense] = useState<License>({ level: 'PROFESSIONAL', maxUsers: 10, features: [] });
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingSaleToLoad, setPendingSaleToLoad] = useState<PendingSale | null>(null);
  const [saleIdToInspect, setSaleIdToInspect] = useState<string | null>(null);

  // --- CARGA INICIAL DE DATOS ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
        // 1. Configuración
        const { data: dbSettings } = await supabase.from('settings').select('*').single();
        if (dbSettings) setSettings({ id: dbSettings.id, storeName: dbSettings.store_name, address: dbSettings.address, phone: dbSettings.phone, taxId: dbSettings.tax_id, ticketFooter: dbSettings.ticket_footer, taxRate: dbSettings.tax_rate, logoUrl: dbSettings.logo_url });

        // 2. Productos
        const { data: dbProducts } = await supabase.from('products').select('*');
        if (dbProducts) setProducts(dbProducts.map((p: any) => ({ ...p, groupId: p.group_id, wholesalePrice: p.wholesale_price, wholesaleMin: p.wholesale_min, isWeighable: p.is_weighable, packPrice: p.pack_price, packQuantity: p.pack_quantity, packBarcode: p.pack_barcode, contentPerUnit: p.content_per_unit, contentUnitPrice: p.content_unit_price, shortCode: p.short_code, presentations: p.presentations || [] })));

        // 3. Clientes (CORREGIDO: Mapeo y soporte dual para parent_id/parentId)
        const { data: dbClients } = await supabase.from('clients').select('*');
        if (dbClients) {
          setClients(dbClients.map((c: any) => ({
            id: c.id, 
            name: c.name, 
            phone: c.phone, 
            email: c.email, 
            address: c.address, 
            creditLimit: c.credit_limit || 0, 
            paymentDays: c.payment_days || 0, 
            currentBalance: c.current_balance || 0, 
            since: c.created_at || new Date().toISOString(), 
            tags: c.tags || [], 
            notes: c.notes,
            // Soporte robusto para la relación de árbol
            parent_id: c.parent_id || c.parentId || null,
            parentId: c.parent_id || c.parentId || null, // Guardamos ambas por compatibilidad
            level: c.level || 'BRONCE',
            segment: c.segment || 'REGULAR',
            points: c.points || 0,
            purchases_count: c.purchases_count || 0,
            purchases_avg: c.purchases_avg || 0
          })));
        }

        // 4. Proveedores
        const { data: dbSuppliers } = await supabase.from('suppliers').select('*');
        if (dbSuppliers) setSuppliers(dbSuppliers.map((s:any) => ({ id: s.id, name: s.name, contactName: s.contact_name, phone: s.phone, email: s.email, rfc: s.tax_id })));

        // 5. Categorías e Impuestos
        const { data: dbCats } = await supabase.from('categories').select('*').order('name');
        if (dbCats) setCategories(dbCats);
        const { data: dbTaxes } = await supabase.from('taxes').select('*').order('rate', { ascending: false });
        if (dbTaxes) setTaxes(dbTaxes.map((t: any) => ({ id: t.id, name: t.name, rate: t.rate, code: t.code, isActive: t.is_active })));

        // 6. Ventas Recientes
        const { data: dbSales } = await supabase.from('sales').select(`*, items:sale_items(*)`).order('date', { ascending: false }).limit(50);
        if (dbSales) setSales(dbSales.map((s: any) => ({
            id: s.id, date: s.date, total: s.total, paymentMethod: s.payment_method, customerName: s.customer_name, clientId: s.client_id, remainingBalance: s.remaining_balance, amountTendered: s.amount_tendered, change: s.change, cardAuthCode: s.card_auth_code, paymentHistory: s.payment_history || [],
            items: s.items.map((i: any) => ({ productId: i.product_id, name: i.name, price: i.price, quantity: i.quantity, subtotal: i.subtotal, returnedQuantity: i.returned_quantity || 0, groupId: products.find(p => p.id === i.product_id)?.groupId }))
        })));

        // 7. USUARIOS
        await fetchUsers();

        // 8. PEDIDOS
        await fetchOrders();
        
        // Auth Local
        const storedUser = localStorage.getItem('nexpos_user');
        if (storedUser) setCurrentUser(JSON.parse(storedUser));

    } catch (error) {
        console.error("Error cargando datos iniciales:", error);
    } finally {
        setIsLoading(false);
    }
  };

  // Persistencia Usuario
  useEffect(() => { if (currentUser) localStorage.setItem('nexpos_user', JSON.stringify(currentUser)); else localStorage.removeItem('nexpos_user'); }, [currentUser]);

  // --- GESTIÓN DE PEDIDOS ---
  const fetchOrders = async () => {
    try {
        const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (data) {
            setOrders(data.map((o: any) => ({
                id: o.id,
                orderFolio: o.folio,
                customerName: o.customer_name,
                customerPhone: o.customer_phone,
                customerAddress: o.customer_address,
                deliveryDate: o.delivery_date,
                total: o.total_amount,
                advancePayment: o.advance_payment,
                balance: (o.total_amount - (o.advance_payment || 0)),
                status: o.status,
                picking_completed: o.picking_completed,
                priority: o.priority,
                items: o.items || [],
                createdAt: o.created_at,
                paymentMethod: o.payment_method,
                paymentTerm: o.payment_terms,
                orderType: o.order_type,
                notes: o.notes
            })));
        }
    } catch (e) { console.error(e); }
  };

// --- GESTIÓN DE PEDIDOS ---

  // 1. Función ADD ORDER (La corregida con validación de crédito)
  const addOrder = async (order: any) => {
    try {
        if (!order.deliveryDate) {
            alert("⚠️ Error: La fecha de entrega es OBLIGATORIA.");
            return;
        }

        // Validación de Crédito
        if (order.clientId) {
            const { data: clientData } = await supabase
                .from('clients')
                .select('credit_limit, current_balance')
                .eq('id', order.clientId)
                .single();

            if (clientData) {
                const currentDebt = clientData.current_balance || 0;
                const newTotalDebt = currentDebt + (order.total || 0);
                const limit = clientData.credit_limit || 0;

                if (limit > 0 && newTotalDebt > limit) {
                    alert(`❌ ERROR: Límite de crédito excedido.\n\nLímite: $${limit.toFixed(2)}\nDeuda Actual: $${currentDebt.toFixed(2)}\nEste Pedido: $${order.total.toFixed(2)}\n\nTotal proyectado: $${newTotalDebt.toFixed(2)}`);
                    return;
                }
            }
        }

        const dbPayload = {
            folio: order.orderFolio || `PED-${Date.now()}`,
            customer_name: order.customerName || 'Cliente General',
            customer_phone: order.customerPhone,
            customer_address: order.customerAddress,
            delivery_date: new Date(order.deliveryDate).toISOString(),
            total_amount: order.total || 0,
            advance_payment: order.advancePayment || 0,
            status: 'PENDING',
            picking_completed: false,
            priority: order.priority || 'Media',
            payment_method: order.paymentMethod,
            payment_terms: order.paymentTerm,
            order_type: order.orderType,
            notes: order.notes,
            items: order.items || [], 
            created_at: new Date().toISOString(),
            client_id: order.clientId || null 
        };

        const { error } = await supabase.from('orders').insert([dbPayload]);
        if (error) { 
            console.error("Error Supabase:", error); 
            alert(`Error al guardar: ${error.message}`); 
            return;
        } 

        // Actualizar saldo
        if (order.clientId) {
            const client = clients.find(c => c.id === order.clientId);
            if (client) {
                const newBalance = (client.currentBalance || 0) + (order.total || 0);
                await supabase.from('clients').update({ current_balance: newBalance }).eq('id', order.clientId);
                setClients(prev => prev.map(c => c.id === order.clientId ? { ...c, currentBalance: newBalance } : c));
            }
        }

        await fetchOrders();
        alert("✅ Pedido generado exitosamente.");
    } catch (e) { 
        console.error("Excepción:", e); 
        alert("Error inesperado al crear pedido.");
    }
  };

  // 2. Función UPDATE STATUS (Probablemente esta se borró)
  const updateOrderStatus = async (id: string, newStatus: any) => {
    try {
        await supabase.from('orders').update({ status: newStatus }).eq('id', id);
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        await fetchOrders();
    } catch (e) { console.error(e); }
  };

  // 3. Función DELETE ORDER (Probablemente esta también se borró)
  const deleteOrder = async (id: string) => {
      try {
          await supabase.from('orders').delete().eq('id', id);
          setOrders(prev => prev.filter(o => o.id !== id));
      } catch (e) { console.error(e); }
  };

  // --- GESTIÓN DE CLIENTES ---
  const addClient = async (clientData: Omit<Client, 'id'>) => {
    try {
        // --- AQUÍ ESTABA EL ERROR: DETECTAR SI VIENE COMO parentId O parent_id ---
        const parentIdToSave = (clientData as any).parent_id || (clientData as any).parentId || null;
        
        const dbPayload = {
            name: clientData.name,
            phone: clientData.phone || null,
            email: clientData.email || null,
            street: clientData.street || null,
            exterior_number: clientData.exteriorNumber || null,
            interior_number: clientData.interiorNumber || null,
            colony: clientData.colony || null,
            city: clientData.city || null,
            postal_code: clientData.postalCode || null,
            state: clientData.state || null,
            address: `${clientData.street || ''} ${clientData.exteriorNumber || ''}, ${clientData.colony || ''}`.trim(),
            tax_id: clientData.rfc || null,
            credit_limit: Number(clientData.creditLimit) || 0,
            payment_days: Number(clientData.paymentDays) || 0,
            tags: clientData.tags || [],
            notes: clientData.notes || '',
            current_balance: 0,
            
            // Usamos la variable unificada
            parent_id: parentIdToSave
        };

        const { data, error } = await supabase.from('clients').insert([dbPayload]).select().single();
        if (error) throw error;

        if (data) {
            const newClient: Client = { 
                ...clientData, 
                id: data.id, 
                currentBalance: 0,
                since: new Date().toISOString(),
                points: 0,
                level: 'BRONCE',
                parent_id: data.parent_id,
                parentId: data.parent_id // Actualizamos ambos
            };
            setClients(prev => [...prev, newClient]);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Excepción al crear cliente:", e);
        return false;
    }
  };

  // --- GESTIÓN DE USUARIOS ---
  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: true });
    if (data) {
        setUsers(data.map((u:any) => ({
            id: u.id, fullName: u.full_name, username: u.username, pin: u.pin, 
            password: u.password, cardCode: u.card_code, role: u.role, 
            isActive: u.is_active, email: u.email
        })));
    }
  };

  const addUser = async (u: any) => { 
      try {
          const { error } = await supabase.from('users').insert({
              full_name: u.fullName, username: u.username, pin: u.pin, 
              password: u.password, card_code: u.cardCode, role: u.role, 
              email: u.email, is_active: true
          });
          if(!error) { await fetchUsers(); return true; }
          return false;
      } catch(e) { return false; }
  };

  const updateUser = async (u: User) => {
      try {
          await supabase.from('users').update({
              full_name: u.fullName, username: u.username, pin: u.pin,
              password: u.password, card_code: u.cardCode, role: u.role, email: u.email
          }).eq('id', u.id);
          await fetchUsers();
      } catch(e) { console.error(e); }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
      try {
          await supabase.from('users').update({ is_active: !currentStatus }).eq('id', id);
          await fetchUsers();
      } catch(e) { console.error(e); }
  };

 const addProduct = async (newProductData: Omit<Product, 'id'>) => {
    try {
      const dbPayload = { 
        name: newProductData.name, 
        price: newProductData.price, 
        category: newProductData.category, 
        stock: newProductData.stock, 
        sku: newProductData.sku, 
        image: newProductData.image, 
        barcode: newProductData.barcode, 
        group_id: newProductData.groupId, 
        wholesale_price: newProductData.wholesalePrice, 
        wholesale_min: newProductData.wholesaleMin, 
        is_weighable: newProductData.isWeighable, 
        pack_price: newProductData.packPrice, 
        pack_quantity: newProductData.packQuantity, 
        pack_barcode: newProductData.packBarcode, 
        presentations: newProductData.presentations, 
        content_per_unit: newProductData.contentPerUnit, 
        content_unit_price: newProductData.contentUnitPrice, 
        short_code: newProductData.shortCode,
        // AGREGADO: Guardar los impuestos seleccionados
        tax_ids: newProductData.taxIds || [] 
      };

      const { data } = await supabase.from('products').insert([dbPayload]).select().single();
      
      if (data) {
        const newProd = { 
            ...data, 
            groupId: data.group_id, 
            wholesalePrice: data.wholesale_price, 
            wholesaleMin: data.wholesale_min, 
            isWeighable: data.is_weighable, 
            packPrice: data.pack_price, 
            packQuantity: data.pack_quantity, 
            packBarcode: data.pack_barcode, 
            presentations: data.presentations, 
            contentPerUnit: data.content_per_unit, 
            contentUnitPrice: data.content_unit_price, 
            shortCode: data.short_code,
            // Mapear respuesta
            taxIds: data.tax_ids || [] 
        };
        setProducts(prev => [...prev, newProd]);
      }
    } catch (e) { console.error("Error al crear producto:", e); }
  };

  const updateProduct = async (updatedProduct: Product, updateGroupPrice: boolean = false) => {
    try {
      const dbPayload = { 
        name: updatedProduct.name, 
        price: updatedProduct.price, 
        category: updatedProduct.category, 
        stock: updatedProduct.stock, 
        sku: updatedProduct.sku, 
        image: updatedProduct.image, 
        barcode: updatedProduct.barcode, 
        group_id: updatedProduct.groupId, 
        wholesale_price: updatedProduct.wholesalePrice, 
        wholesale_min: updatedProduct.wholesaleMin, 
        is_weighable: updatedProduct.isWeighable, 
        pack_price: updatedProduct.packPrice, 
        pack_quantity: updatedProduct.packQuantity, 
        pack_barcode: updatedProduct.packBarcode, 
        presentations: updatedProduct.presentations, 
        content_per_unit: updatedProduct.contentPerUnit, 
        content_unit_price: updatedProduct.contentUnitPrice, 
        short_code: updatedProduct.shortCode,
        // AGREGADO: Actualizar los impuestos
        tax_ids: updatedProduct.taxIds || []
      };

      await supabase.from('products').update(dbPayload).eq('id', updatedProduct.id);

      // Lógica de actualización de precios en grupo (si aplica)
      if (updateGroupPrice && updatedProduct.groupId) {
         await supabase.from('products')
            .update({ 
                price: updatedProduct.price, 
                wholesale_price: updatedProduct.wholesalePrice, 
                wholesale_min: updatedProduct.wholesaleMin,
                // Opcional: Si quieres que todos los del grupo tengan los mismos impuestos
                tax_ids: updatedProduct.taxIds || [] 
            })
            .eq('group_id', updatedProduct.groupId);
         
         setProducts(prev => prev.map(p => p.groupId === updatedProduct.groupId ? { 
             ...p, 
             price: updatedProduct.price, 
             wholesalePrice: updatedProduct.wholesalePrice, 
             wholesaleMin: updatedProduct.wholesaleMin,
             taxIds: updatedProduct.taxIds || []
         } : p));
      } else { 
          setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)); 
      }
    } catch (e) { console.error("Error al actualizar producto:", e); }
  };
  
  const deleteProduct = async (id: string) => { try { await supabase.from('products').delete().eq('id', id); setProducts(prev => prev.filter(p => p.id !== id)); } catch (e) { console.error(e); } };

  // --- CRUD AUXILIARES ---
  const addCategory = async (name: string) => { try { const { data } = await supabase.from('categories').insert([{ name }]).select().single(); if(data) setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name))); } catch (e) { console.error(e); } };
  const addTax = async (name: string, rate: number, code: string) => { try { const { data } = await supabase.from('taxes').insert([{ name, rate, code }]).select().single(); if (data) setTaxes(prev => [...prev, { id: data.id, name: data.name, rate: data.rate, code: data.code, isActive: data.is_active }]); } catch (e) { console.error(e); } };
  const deleteTax = async (id: string) => { try { await supabase.from('taxes').delete().eq('id', id); setTaxes(prev => prev.filter(t => t.id !== id)); } catch (e) { console.error(e); } };
  const addSupplier = async (supplierData: Omit<Supplier, 'id'>) => { try { const dbPayload = { name: supplierData.name, contact_name: supplierData.contactName, phone: supplierData.phone, email: supplierData.email, address: supplierData.address, tax_id: supplierData.rfc, status: supplierData.status || 'Active'}; const { data } = await supabase.from('suppliers').insert([dbPayload]).select().single(); if (data) setSuppliers(prev => [...prev, { ...supplierData, id: data.id }]); } catch (e) { console.error(e); } };
  
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    if (!settings) return;
    try {
        const dbPayload = { store_name: newSettings.storeName, address: newSettings.address, phone: newSettings.phone, tax_id: newSettings.taxId, ticket_footer: newSettings.ticketFooter, tax_rate: newSettings.taxRate, logo_url: newSettings.logoUrl };
        await supabase.from('settings').update(dbPayload).eq('id', settings.id);
        setSettings({ ...settings, ...newSettings });
    } catch (e) { console.error(e); }
  };

  // --- PROCESOS VENTA/COMPRA ---
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

  const processPurchase = async (items: any[], total: number, supplierId: string, invoiceNumber: string, orderReference?: string) => {
    try {
        const { data: purchase, error: purchaseError } = await supabase.from('purchases').insert([{ supplier_id: supplierId, invoice_number: invoiceNumber, order_reference: orderReference || '', total_amount: total, status: 'RECEIVED' }]).select().single();
        if (purchaseError) throw purchaseError;
        const itemsToInsert = items.map((i: any) => ({ purchase_id: purchase.id, product_id: i.productId, quantity: i.quantity, unit_cost: i.cost }));
        await supabase.from('purchase_items').insert(itemsToInsert);
        for (const item of items) {
            const currentProd = products.find(p => p.id === item.productId);
            if (currentProd) {
                const newStock = currentProd.stock + item.quantity;
                await supabase.from('products').update({ stock: newStock, cost_price: item.cost }).eq('id', item.productId);
            }
        }
        await registerCashMovement('OUT', total, `Pago Compra Factura: ${invoiceNumber}`);
        const { data: updated } = await supabase.from('products').select('*');
        if(updated) setProducts(updated.map((p:any) => ({...p, groupId: p.group_id})));
        return true;
    } catch(e) { console.error("Error procesando compra:", e); return false; }
  };

  const parkSale = async (cart: CartItem[], total: number, customerName?: string, type: 'GENERAL' | 'CONSIGNMENT' = 'GENERAL', note: string = '') => {
    try {
      const { error } = await supabase.from('pending_sales').insert([{ customer_name: customerName || 'Cliente General', note, total, items: cart, item_count: cart.reduce((acc, item) => acc + item.quantity, 0), type, status: 'PENDING', created_by: currentUser?.fullName || 'Sistema', created_at: new Date().toISOString() }]);
      if (error) throw error; return true;
    } catch (err) { console.error("Error parking sale:", err); return false; }
  };

  const logCancellation = async (sale: PendingSale, reason: string, user: string) => { try { await supabase.from('cancellation_logs').insert([{ user_name: user, sale_type: sale.type, reason, amount: sale.total, details: sale.items }]); } catch(e){} };
  
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
  
  const generateShiftReport = async (): Promise<ShiftReport> => {
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0); const startOfDayISO = startOfDay.toISOString();
    const [movementsResult, salesResult] = await Promise.all([supabase.from('cash_movements').select('*').gte('created_at', startOfDayISO), supabase.from('sales').select('*, items:sale_items(*)').gte('date', startOfDayISO)]);
    const movements = (movementsResult.data as CashMovement[]) || []; const todaySales = salesResult.data || []; 
    const cashSales = todaySales.filter((s: any) => s.payment_method === 'cash').reduce((sum: number, s: any) => sum + Number(s.total || 0), 0);
    const cardSales = todaySales.filter((s: any) => s.payment_method === 'card').reduce((sum: number, s: any) => sum + Number(s.total || 0), 0);
    const cashIn = movements.filter(m => m.type === 'IN').reduce((sum, m) => sum + Number(m.amount || 0), 0);
    const cashOut = movements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + Number(m.amount || 0), 0);
    const productMap: Record<string, { name: string; quantity: number; total: number }> = {};
    todaySales.forEach((sale: any) => { if(sale.items && Array.isArray(sale.items)) { sale.items.forEach((item: any) => { const prodId = item.product_id || item.productId || 'unknown'; let prodName = item.name || 'Producto sin nombre'; const qty = Number(item.quantity) || 0; const price = Number(item.price) || 0; const itemTotal = qty * price; const uniqueKey = `${prodId}_${price}`; if (!productMap[uniqueKey]) { productMap[uniqueKey] = { name: prodName, quantity: 0, total: 0 }; } productMap[uniqueKey].quantity += qty; productMap[uniqueKey].total += itemTotal; }); } });
    const soldProducts = Object.keys(productMap).map(key => ({ product_id: key.split('_')[0], ...productMap[key] })).sort((a, b) => b.total - a.total);
    return { generatedAt: new Date().toISOString(), salesCount: todaySales.length, totalSales: cashSales + cardSales, cashSales, cardSales, initialFund: 0, cashIn, cashOut, expectedCashInDrawer: cashSales + cashIn - cashOut, soldProducts };
  };
  
  const closeShift = async (r: any, c: number) => true;

  // --- AUTH ---
  const login = async (method: 'password'|'pin'|'barcode', value: string) => { 
      let u = null;
      if (method === 'pin') u = users.find(user => user.pin === value && user.isActive);
      else if (method === 'barcode') u = users.find(user => user.cardCode === value && user.isActive);
      else if (method === 'password') {
          try {
              const creds = JSON.parse(value);
              u = users.find(user => user.username === creds.username && user.password === creds.password && user.isActive);
          } catch(e) { console.error("Error parse login"); }
      }

      if(u) { setCurrentUser(u); return true; } 
      return false; 
  };
  const logout = () => setCurrentUser(null);
  
  const addRoute = () => {}; const updateRouteStatus = () => {}; const updateRouteStop = () => {};

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