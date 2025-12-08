import React from 'react';

// Reutilizamos datos de la tienda o los pasas por props
const STORE_NAME = "ABARROTES EL PUNTO";

interface ShiftReportTicketProps {
  type: 'X' | 'Z'; // X = Parcial, Z = Final/Cierre
  generatedAt: string;
  cashSales: number;
  cardSales: number;
  cashIn: number;  // Ingresos de efectivo manuales
  cashOut: number; // Retiros/Gastos
  totalSales: number;
  finalCashExpected: number;
  user: string;
}

export const ShiftReportTicket: React.FC<ShiftReportTicketProps> = ({ 
  type, generatedAt, cashSales, cardSales, cashIn, cashOut, totalSales, finalCashExpected, user 
}) => {
  
  const styles = {
    container: {
      width: '72mm',
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '12px',
      color: '#000',
      backgroundColor: '#fff',
      padding: '5px',
      textTransform: 'uppercase' as const,
    },
    header: { textAlign: 'center' as const, marginBottom: '10px', fontWeight: 'bold' },
    separator: { borderBottom: '1px dashed #000', margin: '8px 0' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
    bold: { fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>{STORE_NAME}</div>
        <div style={{fontSize: '14px', marginTop: '5px'}}>
          {type === 'X' ? '*** CORTE PARCIAL (X) ***' : '*** CIERRE DE TURNO (Z) ***'}
        </div>
      </div>

      <div>FECHA: {new Date(generatedAt).toLocaleString()}</div>
      <div>CAJERO: {user}</div>
      <div style={styles.separator}></div>

      {/* VENTAS */}
      <div style={styles.bold}>VENTAS</div>
      <div style={styles.row}>
        <span>EFECTIVO:</span>
        <span>${cashSales.toFixed(2)}</span>
      </div>
      <div style={styles.row}>
        <span>TARJETA/VALES:</span>
        <span>${cardSales.toFixed(2)}</span>
      </div>
      <div style={{...styles.row, borderTop: '1px solid #000', paddingTop: '2px'}}>
        <span>TOTAL VENTAS:</span>
        <span style={styles.bold}>${totalSales.toFixed(2)}</span>
      </div>

      <div style={styles.separator}></div>

      {/* FLUJO DE EFECTIVO */}
      <div style={styles.bold}>FLUJO DE EFECTIVO</div>
      <div style={styles.row}>
        <span>(+) INGRESOS FONDO:</span>
        <span>${cashIn.toFixed(2)}</span>
      </div>
      <div style={styles.row}>
        <span>(-) RETIROS/GASTOS:</span>
        <span>${cashOut.toFixed(2)}</span>
      </div>

      <div style={styles.separator}></div>

      {/* BALANCE FINAL */}
      <div style={{textAlign: 'right', fontSize: '14px', fontWeight: 'bold'}}>
        <div>EFECTIVO EN CAJA:</div>
        <div style={{fontSize: '18px'}}>${finalCashExpected.toFixed(2)}</div>
      </div>

      <div style={{marginTop: '20px', textAlign: 'center', fontSize: '10px'}}>
        {type === 'Z' ? '--- FIN DEL TURNO ---' : '--- REPORTE INFORMATIVO ---'}
      </div>
    </div>
  );
};