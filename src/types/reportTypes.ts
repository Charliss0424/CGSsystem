export interface SalesSummary {
  period: string; // '2023-10-01'
  total_sales: number;
  total_profit: number;
  transaction_count: number;
}

export interface TopProduct {
  product_name: string;
  sku: string;
  quantity_sold: number;
  total_revenue: number;
}

export type ReportDateRange = {
  startDate: Date;
  endDate: Date;
};