import { supabase } from "./supabase";

// ==========================================
// 1. INTERFACES DE DATOS (Tipos TypeScript)
// ==========================================

export interface SalesReportData {
  period: string;          // Fecha: '2023-10-01'
  total_sales: number;     // Venta total
  total_cost: number;      // Costo total
  net_profit: number;      // Utilidad
  transaction_count: number;
}

export interface InventoryValueData {
  category: string;
  total_items: number;
  total_cost_value: number;
  potential_sale_value: number;
}

export interface TopProductData {
  product_name: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface FinancialSummaryData {
  period: string;
  total_income: number;
  total_expenses: number;
  net_balance: number;
}

export interface ExpenseCategoryData {
  category: string;
  total_amount: number;
}

// ==========================================
// 2. SERVICIO PRINCIPAL
// ==========================================

export const reportService = {
  
  /**
   * REPORTE DE VENTAS
   * Obtiene el reporte agrupado por día.
   */
  async getSalesReport(startDate: string, endDate: string) {
    const { data, error } = await supabase.rpc('get_sales_report', { 
      start_date: startDate, 
      end_date: endDate 
    });

    if (error) {
      console.error("Error fetching sales report:", error);
      throw error;
    }
    return data as SalesReportData[];
  },

  /**
   * TOP PRODUCTOS
   * Obtiene el Top de productos más vendidos por ingresos.
   */
  async getTopProducts(startDate: string, endDate: string, limit: number = 5) {
    const { data, error } = await supabase.rpc('get_top_products', { 
      start_date: startDate, 
      end_date: endDate,
      limit_count: limit 
    });

    if (error) {
      console.error("Error fetching top products:", error);
      throw error;
    }
    return data as TopProductData[];
  },

  /**
   * VALUACIÓN DE INVENTARIO
   * Obtiene la valuación actual por categoría.
   */
  async getInventoryValuation() {
    const { data, error } = await supabase.rpc('get_inventory_valuation');
    
    if (error) {
      console.error("Error fetching inventory valuation:", error);
      throw error;
    }
    return data as InventoryValueData[];
  },

  /**
   * ALERTAS DE STOCK BAJO
   * Obtiene productos cuyo stock actual es menor o igual al mínimo.
   */
  async getLowStockProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, stock, min_stock, category, cost_price')
      .lte('stock', supabase.raw('min_stock')) // stock <= min_stock
      .order('stock', { ascending: true })
      .limit(50);

    if (error) {
      console.error("Error fetching low stock:", error);
      throw error;
    }
    return data;
  },

  /**
   * RESUMEN FINANCIERO
   * Compara Ingresos (Ventas) vs Gastos (Tabla expenses)
   */
  async getFinancialSummary(startDate: string, endDate: string) {
    // Nota: Asegúrate de haber creado la función RPC 'get_financial_summary' en Supabase
    const { data, error } = await supabase.rpc('get_financial_summary', { 
      start_date: startDate, 
      end_date: endDate 
    });
    
    if (error) {
      console.error("Error fetching financial summary:", error);
      throw error; 
    }
    return data as FinancialSummaryData[];
  },

  /**
   * GASTOS POR CATEGORÍA
   * Para gráfica de pastel de gastos
   */
  async getExpensesByCategory(startDate: string, endDate: string) {
    // Nota: Asegúrate de haber creado la función RPC 'get_expenses_by_category' en Supabase
    const { data, error } = await supabase.rpc('get_expenses_by_category', { 
      start_date: startDate, 
      end_date: endDate 
    });
    
    if (error) {
      console.error("Error fetching expenses by category:", error);
      throw error;
    }
    return data as ExpenseCategoryData[];
  }

};