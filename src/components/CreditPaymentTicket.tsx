import React from 'react';

// Reutilizamos los datos de la tienda
const STORE_DATA = {
  name: "ABARROTES EL PUNTO",
  address: "Av. Revolución #123, Centro",
  city: "CDMX, México",
  phone: "55-1234-5678",
  footerMessage: "¡Gracias por su pago!\nConserve este comprobante."
};

// Estructura de un "Renglón" de deuda en el ticket
export interface DebtItem {
  ticketId: string;      // ID de la venta original
  originalDate: string;  // Fecha de la venta
  totalDebt: number;     // Deuda que tenía ese ticket antes del abono
  amountPaid: number;    // Cuánto de este abono se fue a este ticket
  remaining: number;     // Cuánto queda debiendo de este ticket específico
}

interface CreditPaymentTicketProps {
  paymentId: string;
  customerName: string;
  paymentDate: string;
  previousBalance: number; // Saldo total antes del pago
  amountTendered: number;  // El abono que dio
  newBalance: number;      // Saldo total después del pago
  affectedTickets: DebtItem[]; // El desglose importante
}

export const CreditPaymentTicket: React.FC<CreditPaymentTicketProps> = ({ 
  paymentId, customerName, paymentDate, 
  previousBalance, amountTendered, newBalance, affectedTickets 
}) => {
  
  const styles = {
    container: {
      width: '72mm', 
      fontFamily: '"Courier New", Courier, monospace', 
      fontSize: '12px',
      lineHeight: '1.2',
      color: '#000',
      backgroundColor: '#fff',
      padding: '5px',
      textTransform: 'uppercase' as const,
    },
    header: { textAlign: 'center' as const, marginBottom: '10px' },
    separator: { borderBottom: '1px dashed #000', margin: '5px 0' },
    bold: { fontWeight: 'bold' },
    row: { display: 'flex', justifyContent: 'space-between' },
    right: { textAlign: 'right' as const }
  };

  return (
    <div style={styles.container}>
      
      {/* ENCABEZADO */}
      <div style={styles.header}>
        <div style={{fontSize: '16px', fontWeight: 'bold'}}>{STORE_DATA.name}</div>
        <div>COMPROBANTE DE ABONO</div>
      </div>

      {/* DATOS DEL PAGO */}
      <div style={styles.row}>
        <span>FECHA: {new Date(paymentDate).toLocaleString('es-MX')}</span>
      </div>
      <div style={styles.row}>
        <span>FOLIO PAGO: #{paymentId.slice(0,8)}</span>
      </div>
      <div style={{marginBottom: '5px'}}>CLIENTE: {customerName}</div>

      <div style={styles.separator}></div>

      {/* RESUMEN DE SALDOS */}
      <div style={styles.row}>
        <span>SALDO ANTERIOR:</span>
        <span>${previousBalance.toFixed(2)}</span>
      </div>
      <div style={{...styles.row, fontSize: '14px', fontWeight: 'bold', margin: '5px 0'}}>
        <span>ABONO RECIBIDO:</span>
        <span>${amountTendered.toFixed(2)}</span>
      </div>

      <div style={styles.separator}></div>
      <div style={{textAlign: 'center', fontWeight: 'bold', marginBottom: '5px'}}>DETALLE DE APLICACIÓN</div>
      
      {/* TABLA DE TICKETS AFECTADOS */}
      <div style={{fontSize: '11px'}}>
        <div style={{display: 'flex', fontWeight: 'bold', marginBottom: '2px'}}>
            <span style={{width: '30%'}}>TICKET</span>
            <span style={{width: '25%', textAlign: 'right'}}>ABONO</span>
            <span style={{width: '45%', textAlign: 'right'}}>RESTANTE</span>
        </div>

        {affectedTickets.map((item, idx) => (
            <div key={idx} style={{display: 'flex', marginBottom: '2px'}}>
                <span style={{width: '30%'}}>#{item.ticketId.slice(0,6)}</span>
                <span style={{width: '25%', textAlign: 'right'}}>${item.amountPaid.toFixed(2)}</span>
                <span style={{width: '45%', textAlign: 'right'}}>
                    {item.remaining <= 0.01 ? 'PAGADO' : `$${item.remaining.toFixed(2)}`}
                </span>
            </div>
        ))}
      </div>

      <div style={styles.separator}></div>

      {/* SALDO FINAL */}
      <div style={{...styles.row, fontSize: '14px', fontWeight: 'bold', marginTop: '5px'}}>
        <span>NUEVO SALDO:</span>
        <span>${newBalance.toFixed(2)}</span>
      </div>

      <div style={{marginTop: '20px', textAlign: 'center'}}>
        <p>__________________________</p>
        <p>FIRMA DE CONFORMIDAD</p>
      </div>

      <div style={{marginTop: '15px', textAlign: 'center', fontSize: '10px'}}>
        <p>{STORE_DATA.footerMessage}</p>
      </div>
    </div>
  );
};