import React from 'react';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportHelper';

interface Props {
  data: any[];           // Los datos crudos para Excel
  pdfTitle: string;      // Título para el PDF
  pdfHeaders: string[];  // Encabezados visuales para el PDF ["Producto", "Precio"]
  pdfMapping: (item: any) => any[]; // Función para convertir objeto a array para PDF
  fileName: string;      // Nombre base del archivo
}

export const ExportButtons: React.FC<Props> = ({ 
  data, pdfTitle, pdfHeaders, pdfMapping, fileName 
}) => {
  
  const handleExcel = () => {
    exportToExcel(data, fileName);
  };

  const handlePDF = () => {
    // Transformamos los objetos en arrays simples para jspdf-autotable
    const tableData = data.map(pdfMapping);
    exportToPDF(pdfTitle, pdfHeaders, tableData, fileName);
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleExcel}
        className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium border border-emerald-200"
        title="Descargar Excel"
      >
        <FileSpreadsheet size={18} />
        <span className="hidden sm:inline">Excel</span>
      </button>

      <button 
        onClick={handlePDF}
        className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
        title="Descargar PDF"
      >
        <FileText size={18} />
        <span className="hidden sm:inline">PDF</span>
      </button>
    </div>
  );
};