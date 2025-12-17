import { supabase } from '../lib/supabase';
import { Product, Supplier } from '../types';

// Interfaces específicas para compras
export interface PurchaseOrderItemInput {
  productId: string;
  quantity: number;
  unitCost: number;
  discount?: number;
  taxRate?: number;
}

export interface PurchaseOrderInput {
  supplierId: string;
  items: PurchaseOrderItemInput[];
  total: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
  reference?: string;
  type: 'DIRECT' | 'ORDER';
  paymentTerms?: string;
  deliveryDate?: string;
  notes?: string;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier_name?: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  reference?: string;
  type: 'DIRECT' | 'ORDER';
  payment_terms?: string;
  delivery_date?: string;
  notes?: string;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  received_at?: string;
  cancelled_at?: string;
  cancelled_reason?: string;
  created_at: string;
  updated_at: string;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  quantity: number;
  unit_cost: number;
  discount_percentage: number;
  tax_rate: number;
  total_cost: number;
  received_quantity: number;
  created_at: string;
}

export interface PurchaseReceiptInput {
  orderId: string;
  receiptNumber: string;
  receiptDate: string;
  notes?: string;
  items: Array<{
    orderItemId: string;
    productId: string;
    quantityReceived: number;
    condition: 'GOOD' | 'DAMAGED' | 'INCORRECT' | 'MISSING';
    notes?: string;
  }>;
}

export class PurchaseService {
  
  // Crear orden de compra
  async createPurchaseOrder(orderData: PurchaseOrderInput): Promise<{ success: boolean; order?: PurchaseOrder; error?: string }> {
    try {
      // Generar número de orden
      const orderNumber = await this.generateOrderNumber();
      
      // 1. Insertar la orden principal
      const { data: order, error: orderError } = await supabase
        .from('purchase_orders')
        .insert({
          order_number: orderNumber,
          supplier_id: orderData.supplierId,
          total_amount: orderData.total.total,
          subtotal: orderData.total.subtotal,
          tax_amount: orderData.total.tax,
          discount_amount: orderData.total.discount,
          reference: orderData.reference || null,
          type: orderData.type,
          payment_terms: orderData.paymentTerms || 'CONTADO',
          delivery_date: orderData.deliveryDate || null,
          notes: orderData.notes || null,
          status: orderData.status
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insertar los items de la orden
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_cost: item.unitCost,
        discount_percentage: item.discount || 0,
        tax_rate: item.taxRate || 0.16,
        total_cost: this.calculateItemTotal(item)
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Si es compra directa, actualizar inventario inmediatamente
      if (orderData.type === 'DIRECT' && orderData.status === 'RECEIVED') {
        await this.updateInventoryFromPurchase(order.id);
      }

      return { success: true, order };
    } catch (error: any) {
      console.error('Error creating purchase order:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener órdenes de compra
  async getPurchaseOrders(filter?: {
    status?: 'PENDING' | 'RECEIVED' | 'CANCELLED';
    supplierId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PurchaseOrder[]> {
    try {
      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(name, email, phone),
          items:purchase_order_items(
            *,
            product:products(name, sku, brand)
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filter?.status) {
        query = query.eq('status', filter.status);
      }
      if (filter?.supplierId) {
        query = query.eq('supplier_id', filter.supplierId);
      }
      if (filter?.startDate) {
        query = query.gte('created_at', filter.startDate);
      }
      if (filter?.endDate) {
        query = query.lte('created_at', filter.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Formatear los datos
      return data.map(order => ({
        ...order,
        supplier_name: order.supplier?.name,
        items: order.items?.map((item: any) => ({
          ...item,
          product_name: item.product?.name,
          sku: item.product?.sku,
          brand: item.product