import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Genera y descarga un archivo Excel (.xlsx)
 * @param data Array de objetos con los datos
 * @param fileName Nombre del archivo sin extensión
 */
export const exportToExcel = (data: any[], fileName: string) => {
  if (!data || data.length === 0) {
    alert("No hay datos para exportar");
    return;
  }

  // 1. Crear hoja de trabajo
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 2. Crear libro de trabajo
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

  // 3. Generar archivo y descargar
  const finalName = `${fileName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(workbook, finalName);
};

/**
 * Genera y descarga un archivo PDF con tabla
 * @param title Título del reporte
 * @param columns Array con los encabezados ["Fecha", "Venta", ...]
 * @param data Array de arrays con los valores [["2023-01-01", 100], ...]
 * @param fileName Nombre del archivo
 */
export const exportToPDF = (title: string, columns: string[], data: any[][], fileName: string) => {
  if (!data || data.length === 0) {
    alert("No hay datos para exportar");
    return;
  }

  const doc = new jsPDF();

  // Encabezado del PDF
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

  // Generar Tabla Automática
  autoTable(doc, {
    head: [columns],
    body: data,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }, // Azul bonito
    styles: { fontSize: 9 },
  });

  const finalName = `${fileName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(finalName);
};