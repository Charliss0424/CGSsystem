import { GoogleGenAI } from "@google/genai";
import { Sale, Product } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzeSalesData = async (sales: Sale[], products: Product[]): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Error: API Key no configurada.";

  // Prepare data summary to reduce token usage
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalSalesCount = sales.length;
  const lowStockProducts = products.filter(p => p.stock < 5).map(p => p.name);
  
  // Aggregate sales by product
  const productPerformance: Record<string, number> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      productPerformance[item.name] = (productPerformance[item.name] || 0) + item.quantity;
    });
  });
  
  const topProducts = Object.entries(productPerformance)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, qty]) => `${name} (${qty})`);

  const prompt = `
    Actúa como un consultor de negocios experto. Analiza los siguientes datos de mi tienda minorista y dame 3 consejos breves y accionables en formato HTML simple (usando <ul>, <li>, <b>).
    
    Datos actuales:
    - Ingresos Totales: $${totalRevenue.toFixed(2)}
    - Total Transacciones: ${totalSalesCount}
    - Productos más vendidos: ${topProducts.join(', ')}
    - Alerta de Stock Bajo: ${lowStockProducts.length > 0 ? lowStockProducts.join(', ') : 'Ninguno'}
    
    Dame recomendaciones sobre reabastecimiento, estrategias de venta o marketing basadas en esto.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Hubo un error al conectar con el asistente de IA.";
  }
};

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Error: API Key no configurada.";

  const prompt = `Escribe una descripción de producto corta, atractiva y vendedora para un sistema POS.
  Producto: ${productName}
  Categoría: ${category}
  Longitud: Máximo 20 palabras. Sin comillas.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    return "";
  }
};