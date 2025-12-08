export type PlanType = 'ESSENTIAL' | 'BUSINESS' | 'ENTERPRISE';

export type FeatureKey = 
  | 'POS'               // Caja
  | 'INVENTORY'         // Inventario Básico
  | 'CREDIT_SIMPLE'     // Fiado Básico
  | 'REPORTS_BASIC'     // Corte X/Z
  | 'BILLING'           // Facturación (CFDI)
  | 'SUPPLIERS'         // Proveedores
  | 'REPORTS_ADVANCED'  // Reportes de Ganancias/Mermas
  | 'MULTI_USER'        // Gestión de Empleados
  | 'ROUTES'            // Venta en Ruta
  | 'ORDERS'            // Pedidos Especiales
  | 'CREDIT_ADVANCED';  // Cobranza avanzada

// Aquí defines qué incluye cada nivel
export const PLAN_FEATURES: Record<PlanType, FeatureKey[]> = {
  ESSENTIAL: [
    'POS', 
    'INVENTORY', 
    'CREDIT_SIMPLE', 
    'REPORTS_BASIC'
  ],
  BUSINESS: [
    'POS', 'INVENTORY', 'CREDIT_SIMPLE', 'REPORTS_BASIC', // Todo lo anterior
    'BILLING', 
    'SUPPLIERS', 
    'REPORTS_ADVANCED', 
    'MULTI_USER',
    'CREDIT_ADVANCED'
  ],
  ENTERPRISE: [
    'POS', 'INVENTORY', 'CREDIT_SIMPLE', 'REPORTS_BASIC',
    'BILLING', 'SUPPLIERS', 'REPORTS_ADVANCED', 'MULTI_USER', 'CREDIT_ADVANCED', // Todo lo anterior
    'ROUTES', 
    'ORDERS'
  ]
};

export const PLAN_NAMES = {
  ESSENTIAL: 'CGSystem Essential',
  BUSINESS: 'CGSystem Business',
  ENTERPRISE: 'CGSystem Enterprise'
};