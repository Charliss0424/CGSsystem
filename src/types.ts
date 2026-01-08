// src/types.ts

// ==========================================
// 1. CONSTANTES Y NAVEGACIÓN (ViewState)
// ==========================================

export const ProductCategory = {
  ELECTRONICS: 'Electrónica',
  CLOTHING: 'Ropa',
  GROCERY: 'Abarrotes',
  HOME: 'Hogar',
  OTHER: 'Otros'
} as const;

export type ProductCategory = typeof ProductCategory[keyof typeof ProductCategory];

// Estado de Navegación Global
export const ViewState = {
  // --- MÓDULOS PRINCIPALES ---
  DASHBOARD: 'DASHBOARD',
  POS: 'POS',
  INVENTORY: 'INVENTORY',
  SALES: 'SALES',
  REPORTS: 'REPORTS',

  // --- INVENTARIOS (Sub-módulos) ---
  INVENTORY_MOVEMENTS: 'INVENTORY_MOVEMENTS',
  INVENTORY_AUDIT: 'INVENTORY_AUDIT',
  INVENTORY_ENTRIES: 'INVENTORY_ENTRIES',
  INVENTORY_EXITS: 'INVENTORY_EXITS',
  INVENTORY_LABELS: 'INVENTORY_LABELS',
  INVENTORY_BRANCHES: 'INVENTORY_BRANCHES',
  INVENTORY_TRANSFERS: 'INVENTORY_TRANSFERS',
  INVENTORY_WAREHOUSES: 'INVENTORY_WAREHOUSES',
  INVENTORY_MIN_STOCK: 'INVENTORY_MIN_STOCK',

  // --- CLIENTES Y VENTAS ---
  CLIENTS_DASHBOARD: 'CLIENTS_DASHBOARD',
  CLIENTS_CATALOG: 'CLIENTS_CATALOG',
  PENDING_SALES: 'PENDING_SALES',
  ACCOUNTS_RECEIVABLE: 'ACCOUNTS_RECEIVABLE', // Cuentas por Cobrar
  POS_RETURNS: 'POS_RETURNS',
  ORDERS: 'ORDERS',
  ROUTE_SALES: 'ROUTE_SALES',
  SALES_CALENDAR: 'SALES_CALENDAR', // Agenda de Entregas

  // --- COMPRAS Y PROVEEDORES ---
  PURCHASES: 'PURCHASES',             // Historial Compras
  PURCHASE_ORDERS: 'PURCHASE_ORDERS', // Órdenes de Compra
  SUPPLIERS: 'SUPPLIERS',             // Directorio
  PURCHASE_CALENDAR: 'PURCHASE_CALENDAR', // Agenda de Recepción

  // --- CONTABILIDAD Y FINANZAS ---
  ACCOUNTS_PAYABLE: 'ACCOUNTS_PAYABLE',   // Cuentas por Pagar
  FINANCE_CALENDAR: 'FINANCE_CALENDAR',   // Agenda Financiera

  // --- CONFIGURACIÓN ---
  SETTINGS: 'SETTINGS',
  CONF_HARDWARE: 'CONF_HARDWARE',
  CONF_TAXES: 'CONF_TAXES',
  CONF_USERS: 'CONF_USERS',
  CONF_DATABASE: 'CONF_DATABASE',

  // Alias Legacy (por compatibilidad si algo lo usa)
  CALENDAR: 'PURCHASE_CALENDAR' 
} as const;

export type ViewState = typeof ViewState[keyof typeof ViewState];


// ==========================================
// 2. INTERFACES DE PRODUCTOS Y VENTAS
// ==========================================

export interface ProductPresentation {
  id: string;
  name: string;
  barcode: string;
  quantity: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
  image?: string | null;
  barcode?: string;
  manufacturerCode?: string;
  shortDescription?: string;
  longDescription?: string;
  brand?: string;
  manufacturer?: string;
  costPrice?: number;
  promotionalPrice?: number;
  taxRate?: number;
  minStock?: number;
  
  // Mayoreo y Presentaciones
  groupId?: string;
  wholesalePrice?: number;
  wholesaleMin?: number;
  isWeighable?: boolean;
  packPrice?: number;
  packQuantity?: number;
  packBarcode?: string;
  shortCode?: string;
  presentations?: ProductPresentation[];
  
  // Contenido
  contentPerUnit?: number;
  contentUnitPrice?: number;

  // --- CAMPOS DE INVENTARIO AVANZADO ---
  isFractional?: boolean; // true
  unitBase?: string;      // 'kg'
  packUnit?: string;      // 'Bulto'
  packContent?: number;   // 25
}

export interface CartItem extends Product {
  quantity: number;
  isPackSale?: boolean;
  selectedPresentation?: ProductPresentation;
  finalPrice?: number;
  returnedFull?: number;
  returnedEmpty?: number;
  hasShell?: boolean;
  shellPrice?: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  returnedQuantity?: number;
  groupId?: string;
}

export interface PaymentHistoryItem {
  date: string;
  amount: number;
  note?: string;
}

export interface Sale {
  id: string;
  date: string;
  total: number;
  items: SaleItem[];
  paymentMethod: 'cash' | 'card' | 'credit';
  customerName?: string;
  clientId?: string;
  amountTendered?: number;
  change?: number;
  cardAuthCode?: string;
  remainingBalance?: number;
  paymentHistory?: PaymentHistoryItem[];
  z_report_id?: string;
  reprint_count?: number;
}

export interface PendingSale {
  id: string;
  created_at: string;
  customer_name?: string;
  note?: string;
  total: number;
  item_count: number;
  items: CartItem[];
  type: 'GENERAL' | 'CONSIGNMENT';
  status: 'PENDING' | 'SETTLED';
  created_by?: string;
}

// ==========================================
// 3. INTERFACES DE CLIENTES Y RUTAS
// ==========================================

// Tipo de cliente para sistema de árbol
export type ClientType = 'unico' | 'matriz' | 'sucursal';

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  
  // Dirección desglosada
  street?: string;
  exteriorNumber?: string;
  interiorNumber?: string;
  colony?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  address?: string; // Mantenemos address como resumen
  
  rfc?: string; // Se mapeará a tax_id
  creditLimit: number;
  paymentDays: number;
  currentBalance: number;
  tags?: string[];
  notes?: string;
  since?: string;
  
  // --- CAMPOS PARA SISTEMA DE ÁRBOL Y VISUALIZACIÓN ---
  // Estos deben coincidir con lo que trae el DatabaseContext
  parent_id?: string | null; // <-- CRÍTICO: ID del padre real en BD
  level?: string;            // 'BRONCE', 'PLATA', etc.
  segment?: string;          // 'REGULAR', 'VIP'
  points?: number;
  purchases_count?: number;
  purchases_avg?: number;

  // --- CAMPOS LEGACY / AUXILIARES ---
  type?: ClientType;        // 'unico' | 'matriz' | 'sucursal'
  branches?: Client[];      // Array de sucursales (solo para clientes matriz)
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  createdAt: string;
  deliveryDate: string;
  status: OrderStatus;
  items: CartItem[];
  total: number;
  advancePayment: number;
  balance: number;
  notes?: string;
  
  // --- NUEVOS CAMPOS PARA CLIENTES CON SUCURSALES ---
  clientId?: string;        // ID del cliente matriz
  branchId?: string;        // ID de la sucursal específica
}

export interface RouteStop {
  id: string;
  clientId: string;
  clientName: string;
  address: string;
  sequence: number;
  status: 'PENDING' | 'VISITED' | 'SKIPPED' | 'NO_SALE';
  saleAmount?: number;
  lat?: number;
  lng?: number;
  branchId?: string;        // ID de sucursal si aplica
}

export interface Route {
  id: string;
  date: string;
  status: string;
  totalSales: number;
  progress: number;
  name?: string;
  driverName?: string;
  vehicleId?: string;
  stops?: RouteStop[];
}

// ==========================================
// 4. INTERFACES DE COMPRAS Y PROVEEDORES
// ==========================================

export type PurchaseStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID';

export interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  category: string;
  status: 'Active' | 'Inactive';
  credit_days?: number;
}

export interface Purchase {
  id: string;
  orderId?: string;
  invoiceNumber: string;
  supplierName?: string;
  date: string;
  total: number;
  status?: PurchaseStatus;
  payment_due_date?: string;
  amount_paid?: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  amount: number;
  status: PurchaseStatus;
  items: string[]; 
  expected_delivery_date?: string;
}

// ==========================================
// 5. CALENDARIO Y DASHBOARD
// ==========================================

export interface CalendarEvent {
  event_id: string;
  type: 'delivery' | 'payment' | 'meeting' | 'reminder' | 'shipping' | 'payable' | 'receivable' | 'expense';
  title: string;
  start_date: string; 
  amount: number;
  supplier_id?: string;
}

export interface StatMetric {
  label: string;
  value: string | number;
  highlight?: boolean; 
  color?: string; 
}

export interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  metrics: StatMetric[];
}

// ==========================================
// 6. CONFIGURACIÓN DEL SISTEMA
// ==========================================

export interface User {
  id: string;
  fullName: string;
  username: string;
  pin: string;
  password?: string;
  cardCode?: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'WAREHOUSE' | 'CASHIER';
  isActive: boolean;
  email?: string;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  address: string;
  phone: string;
  taxId: string;
  ticketFooter: string;
  taxRate: number;
  logoUrl?: string;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  code?: string;
  isActive: boolean;
}