import { GoogleGenAI } from "@google/genai";
import { Sale, Product } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export interface SupplierSuggestion {
  name: string;
  category: string;
  reason: string;
}

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

export const suggestNewSuppliers = async (query: string): Promise<SupplierSuggestion[]> => {
  console.log(`Consultando a Gemini AI para: ${query}`);

  // Simulamos un pequeño retraso de red
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Retornamos datos falsos por ahora para que el componente pinte algo
  return [
    {
      name: "Distribuidora Mayorista El Águila",
      category: "General",
      reason: "Sugerencia basada en alta rotación de inventario"
    },
    {
      name: "Comercializadora de Bebidas Norte",
      category: "Bebidas",
      reason: "Proveedor popular en tu zona geográfica"
    },
    {
      name: "Plásticos y Desechables SA de CV",
      category: "Insumos",
      reason: "Coincidencia con productos de limpieza"
    }
  ];
};

// Si tienes otras funciones de IA, agrégalas aquí abajo
export const analyzeConsumptionPatterns = async () => {
  return "Análisis pendiente de implementación";
};