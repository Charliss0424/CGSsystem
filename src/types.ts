// --- ENUMS & BASICS ---
export enum ProductCategory {
  ELECTRONICS = 'Electrónica',
  CLOTHING = 'Ropa',
  GROCERY = 'Abarrotes',
  HOME = 'Hogar',
  OTHER = 'Otros'
}

export type ViewState = 'DASHBOARD' | 'POS' | 'INVENTORY' | 'SALES' | 'REPORTS' | 'SETTINGS' | 'PENDING_SALES' | 'CLIENTS_DASHBOARD' | 'ORDERS' | 'ROUTE_SALES'| 'ACCOUNTS_RECEIVABLE';

// --- PRODUCTOS ---
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
  shortCode?: string; // PLU

  // Costos
  costPrice?: number;
  
  // Mayoreo (Mix & Match)
  groupId?: string;
  wholesalePrice?: number;
  wholesaleMin?: number;

  // Presentación / Medida
  isWeighable?: boolean;
  packPrice?: number;
  packQuantity?: number;
  packBarcode?: string;

  // Venta Suelta
  contentPerUnit?: number;
  contentUnitPrice?: number;

  // Múltiples Presentaciones
  presentations?: ProductPresentation[];
}

export interface CartItem extends Product {
  quantity: number;
  // Control de venta
  isPackSale?: boolean;        
  isFractionalSale?: boolean;  
  selectedPresentation?: ProductPresentation; 
  
  finalPrice?: number;
  isWholesaleApplied?: boolean;
}

// --- VENTAS ---
export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  returnedQuantity?: number;
}

export interface Sale {
  id: string;
  date: string;
  total: number;
  items: SaleItem[];
  // Aquí está la corrección importante:
  paymentMethod: 'cash' | 'card' | 'credit'; 
  customerName?: string;
  clientId?: string; 
  amountTendered?: number;
  change?: number;
  cardAuthCode?: string;
  remainingBalance?: number; // Nuevo: Cuánto falta por pagar de ESTE ticket
}

export interface PendingSale {
  id?: string;
  created_at?: string;
  customer_name?: string;
  note?: string;
  total: number;
  items: CartItem[];
  item_count: number;
}

// --- CAJA Y REPORTES ---
export interface CashMovement {
  type: 'IN' | 'OUT';
  amount: number;
  reason: string;
}

export interface ShiftReport {
  generatedAt: string;
  totalSales: number;
  salesCount: number;
  cashSales: number;
  cardSales: number;
  initialFund: number;
  cashIn: number;
  cashOut: number;
  expectedCashInDrawer: number;
}

// --- CLIENTES ---
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  rfc?: string;
  notes?: string;
  creditLimit: number;
  currentBalance: number;
  // Campos opcionales para compatibilidad con versiones previas
  points?: number;
  level?: string;
  tags?: string[];
  since?: string;
}

// --- OTROS MÓDULOS ---
export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  items: any[];
  total: number;
  customerName: string;
}

export interface PaymentHistoryItem {
  date: string;
  amount: number;
  note?: string;
}

export type OrderStatus = 'PENDING' | 'READY' | 'DELIVERED';

export interface Route {
  id: string;
  name: string;
  date: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  totalSales: number;
  progress: number;
  stops: RouteStop[];
}

export interface RouteStop {
  id: string;
  clientName: string;
  status: 'PENDING' | 'VISITED';
  saleAmount?: number;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  role: string;
  pin?: string;
  barcode?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface ClientPayment {
  id: string;
  clientId: string;
  amount: number;
  date: string;
  note?: string;
}