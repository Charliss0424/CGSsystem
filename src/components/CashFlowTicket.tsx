import React from 'react';

const STORE_NAME = "ABARROTES EL PUNTO";

interface CashFlowTicketProps {
  type: 'IN' | 'OUT';
  amount: number;
  reason: string;
  date: string;
  user: string;
  authorizedBy?: string;
}

export const CashFlowTicket: React.FC<CashFlowTicketProps> = ({ type, amount, reason, date, user, authorizedBy }) => {
  const styles = {
    container: { width: '72mm', fontFamily: '"Courier New", Courier, monospace', fontSize: '12px', textTransform: 'uppercase' as const, padding: '5px' },
    header: { textAlign: 'center' as const, fontWeight: 'bold', marginBottom: '10px' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
    title: { fontSize: '14px', fontWeight: 'bold', borderBottom: '1px dashed black', paddingBottom: '5px', marginBottom: '5px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>{STORE_NAME}</div>
        <div>COMPROBANTE DE {type === 'IN' ? 'ENTRADA' : 'SALIDA'}</div>
      </div>

      <div style={styles.row}><span>FECHA:</span><span>{new Date(date).toLocaleString()}</span></div>
      <div style={styles.row}><span>USUARIO:</span><span>{user}</span></div>
      {authorizedBy && <div style={styles.row}><span>AUTORIZÓ:</span><span>{authorizedBy}</span></div>}

      <div style={{borderBottom: '1px dashed black', margin: '10px 0'}}></div>

      <div style={{textAlign: 'center', margin: '10px 0'}}>
        <div style={{fontSize: '10px', color: '#555'}}>CONCEPTO</div>
        <div style={{fontSize: '14px', fontWeight: 'bold'}}>{reason}</div>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid black', paddingTop: '5px'}}>
        <span>MONTO:</span>
        <span>${amount.toFixed(2)}</span>
      </div>

      <div style={{marginTop: '30px', textAlign: 'center'}}>
        <p>__________________________</p>
        <p>FIRMA DE {type === 'IN' ? 'ENTREGA' : 'RECIBIDO'}</p>
      </div>
    </div>
  );
};