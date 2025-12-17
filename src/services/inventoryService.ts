import { supabase } from './supabase';

export type MovementType = 'VENTA' | 'COMPRA' | 'AJUSTE' | 'MERMA';

export const InventoryService = {
  
  // Función maestra para alterar inventario
  // Esto asegura que si falla el historial, no se actualiza el stock (Integridad)
  async registerMovement(
    productId: string, 
    quantityChange: number, 
    type: MovementType, 
    reason: string,
    userId: string
  ) {
    // 1. Obtener stock actual
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single();

    if (prodError) throw prodError;

    const currentStock = product.stock_quantity || 0;
    const newStock = currentStock + quantityChange;

    // 2. Insertar en Kardex y Actualizar Producto (RPC es ideal, pero aquí un ejemplo frontend-first)
    // NOTA: Para producción real, usa una Supabase RPC function para hacerlo en una sola transacción DB.
    
    const { error: moveError } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: productId,
        type,
        quantity: quantityChange,
        previous_stock: currentStock,
        new_stock: newStock,
        reason,
        created_by: userId
      });

    if (moveError) throw moveError;

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', productId);

    if (updateError) throw updateError;

    return { newStock };
  },

  // Obtener el Kardex de un producto específico
  async getProductHistory(productId: string) {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*, auth.users(email)') // Unir con usuario si es necesario
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};