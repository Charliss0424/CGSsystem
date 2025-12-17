// ==========================================
// CONSTANTES Y TIPOS MODERNOS (Patrón as const)
// ==========================================

// 1. Categorías de Productos
export const ProductCategory = {
  ELECTRONICS: 'Electrónica',
  CLOTHING: 'Ropa',
  GROCERY: 'Abarrotes',
  HOME: 'Hogar',
  OTHER: 'Otros'
} as const;

export type ProductCategory = typeof ProductCategory[keyof typeof ProductCategory];

// 2. Estado de Navegación Global (La joya de la corona)
// Esto reemplaza a tu antiguo Enum.
export const ViewState = {
  // Módulos Principales
  DASHBOARD: 'DASHBOARD',
  POS: 'POS',
  INVENTORY: 'INVENTORY',
  SALES: 'SALES',
  REPORTS: 'REPORTS',
  INVENTORY_MOVEMENTS: 'INVENTORY_MOVEMENTS',
  INVENTORY_AUDIT: 'INVENTORY_AUDIT',
  INVENTORY_ENTRIES: 'INVENTORY_ENTRIES',
  INVENTORY_EXITS: 'INVENTORY_EXITS',
  INVENTORY_LABELS: 'INVENTORY_LABELS',
  INVENTORY_BRANCHES: 'INVENTORY_BRANCHES',
  INVENTORY_TRANSFERS: 'INVENTORY_TRANSFERS',
  INVENTORY_WAREHOUSES: 'INVENTORY_WAREHOUSES',
  INVENTORY_MIN_STOCK: 'INVENTORY_MIN_STOCK',


  
  // Clientes
  CLIENTS_DASHBOARD: 'CLIENTS_DASHBOARD',
  CLIENTS_CATALOG: 'CLIENTS_CATALOG',
  PENDING_SALES: 'PENDING_SALES',
  ACCOUNTS_RECEIVABLE: 'ACCOUNTS_RECEIVABLE',
  POS_RETURNS: 'POS_RETURNS',

  // Logística y Compras (Nuevos)
  PURCHASES: 'PURCHASES',             // Historial de Facturas
  PURCHASE_ORDERS: 'PURCHASE_ORDERS', // Órdenes de Compra
  SUPPLIERS: 'SUPPLIERS',             // Directorio de Proveedores
  CALENDAR: 'CALENDAR',               // Agenda Logística
  ORDERS: 'ORDERS',                   // Pedidos de Clientes
  ROUTE_SALES: 'ROUTE_SALES',         // Rutas de Reparto

  // Configuración
  SETTINGS: 'SETTINGS',
  CONF_HARDWARE: 'CONF_HARDWARE',
  CONF_TAXES: 'CONF_TAXES',
  CONF_USERS: 'CONF_USERS',
  CONF_DATABASE: 'CONF_DATABASE'
} as const;

// Esto extrae el tipo automáticamente: 'DASHBOARD' | 'POS' | 'INVENTORY' ...
export type ViewState = typeof ViewState[keyof typeof ViewState];


// ==========================================
// INTERFACES DE BASE DE DATOS (Supabase)
// ==========================================

// Tipos simples para estados (Strings directos de la DB)
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';
export type PurchaseStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID';

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
  image?: string;
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

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  creditLimit: number;
  currentBalance: number;
  points: number;
  level: string;
  tags: string[];
  since: string;
}

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

export interface User {
  id: string;
  fullName: string;
  username: string;
  role: 'Admin' | 'Cajero' | 'Gerente';
  pin?: string;
  barcode?: string;
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

// --- MÓDULO DE COMPRAS Y PROVEEDORES ---

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  category: string;
  status: 'Active' | 'Inactive';
}

export interface Purchase {
  id: string;
  orderId?: string;       // order_reference en DB
  invoiceNumber: string;
  supplierName?: string;
  date: string;
  total: number;
  status?: PurchaseStatus;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  amount: number;
  status: PurchaseStatus;
  items: string[]; // IDs o descripción breve
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'Delivery' | 'Payment' | 'Meeting';
}


export interface StatMetric {
  label: string;
  value: string | number;
  highlight?: boolean; // blue color
  color?: string; // specific text color class
}

export interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  metrics: StatMetric[];
}