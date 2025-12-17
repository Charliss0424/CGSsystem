import React from 'react';
import { ShiftReport } from '../types';

const STORE_NAME = "ABARROTES EL PUNTO";

interface ShiftReportTicketProps {
  report: ShiftReport;
  cashierName: string;
  type?: 'X' | 'Z';
  detailed?: boolean; // <--- Nueva opción para imprimir detalle
}

export const ShiftReportTicket: React.FC<ShiftReportTicketProps> = ({ 
  report, cashierName, type = 'Z', detailed = false 
}) => {
  
  const styles = {
    container: { width: '72mm', fontFamily: '"Courier New", Courier, monospace', fontSize: '12px', lineHeight: '1.3', color: '#000', backgroundColor: '#fff', padding: '5px', textTransform: 'uppercase' as const },
    header: { textAlign: 'center' as const, marginBottom: '10px', fontWeight: 'bold' },
    separator: { borderBottom: '1px dashed #000', margin: '8px 0' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
    bold: { fontWeight: 'bold' },
    sectionTitle: { textAlign: 'center' as const, fontWeight: 'bold', margin: '10px 0 5px 0', borderBottom: '1px solid #000' }
  };

  // Créditos aproximados (Total - Efectivo - Tarjeta)
  const creditSales = report.totalSales - report.cashSales - report.cardSales;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{fontSize: '14px'}}>{STORE_NAME}</div>
        <div style={{marginTop: '5px'}}>
          {type === 'Z' ? '*** CORTE FINAL (Z) ***' : '*** CORTE PARCIAL (X) ***'}
        </div>
        {detailed && <div style={{fontSize: '10px'}}>(DETALLADO)</div>}
      </div>

      <div style={styles.row}><span>FECHA:</span><span>{new Date(report.generatedAt).toLocaleDateString()}</span></div>
      <div style={styles.row}><span>HORA:</span><span>{new Date(report.generatedAt).toLocaleTimeString()}</span></div>
      <div style={styles.row}><span>CAJERO:</span><span>{cashierName}</span></div>

      <div style={styles.separator}></div>

      {/* --- RESUMEN FINANCIERO (Siempre sale) --- */}
      <div style={styles.sectionTitle}>RESUMEN DE VENTAS</div>
      <div style={styles.row}><span>EFECTIVO:</span><span>${report.cashSales.toFixed(2)}</span></div>
      <div style={styles.row}><span>TARJETA:</span><span>${report.cardSales.toFixed(2)}</span></div>
      <div style={styles.row}><span>CRÉDITO:</span><span>${creditSales.toFixed(2)}</span></div>
      <div style={{...styles.row, borderTop: '1px solid #000', paddingTop: '4px', fontWeight: 'bold'}}>
        <span>TOTAL VENTAS:</span><span>${report.totalSales.toFixed(2)}</span>
      </div>

      <div style={styles.sectionTitle}>ARQUEO DE CAJA</div>
      <div style={styles.row}><span>FONDO INICIAL:</span><span>${report.initialFund.toFixed(2)}</span></div>
      <div style={styles.row}><span>(+) VENTAS EFECTIVO:</span><span>${report.cashSales.toFixed(2)}</span></div>
      <div style={styles.row}><span>(+) ENTRADAS:</span><span>${report.cashIn.toFixed(2)}</span></div>
      <div style={styles.row}><span>(-) SALIDAS:</span><span>${report.cashOut.toFixed(2)}</span></div>
      <div style={{...styles.row, fontWeight: 'bold', fontSize: '14px', marginTop: '10px'}}>
        <span>EN CAJA:</span><span>${report.expectedCashInDrawer.toFixed(2)}</span>
      </div>

      {/* --- SECCIÓN DETALLADA (Opcional) --- */}
      {detailed && report.soldProducts && report.soldProducts.length > 0 && (
        <>
            <div style={styles.separator}></div>
            <div style={styles.sectionTitle}>DETALLE DE PRODUCTOS</div>
            <div style={{display: 'flex', fontWeight: 'bold', fontSize: '10px', marginBottom: '5px'}}>
                <span style={{width: '15%'}}>CANT</span>
                <span style={{width: '60%'}}>PRODUCTO</span>
                <span style={{width: '25%', textAlign: 'right'}}>TOTAL</span>
            </div>
            {report.soldProducts.map((p, i) => (
                <div key={i} style={{display: 'flex', fontSize: '10px', marginBottom: '2px'}}>
                    <span style={{width: '15%'}}>{p.quantity}</span>
                    <span style={{width: '60%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{p.name}</span>
                    <span style={{width: '25%', textAlign: 'right'}}>${p.total.toFixed(2)}</span>
                </div>
            ))}
        </>
      )}

      <div style={styles.separator}></div>
      <div style={{marginTop: '20px', textAlign: 'center'}}>__________________________<br/>FIRMA SUPERVISOR</div>
    </div>
  );
};