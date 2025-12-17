import React from 'react';
import { CartItem } from '../types';

const STORE_NAME = "ABARROTES EL PUNTO";

interface ConsignmentTicketProps {
  originalItems: CartItem[];
  customerName: string;
  returnerName: string;
  settlementDate: string;
  totalToPay: number;
  // Nombres de responsables
  creatorName: string;
  liquidatorName: string;
}

export const ConsignmentTicket: React.FC<ConsignmentTicketProps> = ({ 
  originalItems, customerName, returnerName, settlementDate, totalToPay, creatorName, liquidatorName 
}) => {
  
  const subtotal = totalToPay / 1.16;
  const tax = totalToPay - subtotal;

  const styles = {
    container: { width: '72mm', fontFamily: '"Courier New", Courier, monospace', fontSize: '11px', textTransform: 'uppercase' as const, padding: '5px' },
    header: { textAlign: 'center' as const, fontWeight: 'bold', marginBottom: '10px' },
    separator: { borderBottom: '1px dashed #000', margin: '5px 0' },
    tableHeader: { display: 'flex', fontWeight: 'bold', borderBottom: '1px solid #000', marginBottom: '4px' },
    bold: { fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>{STORE_NAME}</div>
        <div>LIQUIDACIÓN DE CONSUMO</div>
      </div>

      <div>FECHA: {new Date(settlementDate).toLocaleString()}</div>
      <div style={styles.separator}></div>
      
      <div>AUTORIZÓ SALIDA: {creatorName}</div>
      <div>CAJERO: {liquidatorName}</div>
      <div style={styles.separator}></div>

      <div>CLIENTE: {customerName}</div>
      <div>ENTREGÓ MERCANCÍA: {returnerName}</div>

      <div style={styles.separator}></div>

      <div style={styles.tableHeader}>
        <span style={{width: '40%'}}>PRODUCTO</span>
        <span style={{width: '20%', textAlign: 'center'}}>LLEVÓ</span>
        <span style={{width: '20%', textAlign: 'center'}}>REG.</span>
        <span style={{width: '20%', textAlign: 'right'}}>PAGA</span>
      </div>

      {originalItems.map((item: any, idx) => {
        const consumed = item.quantity - (item.returnedFull || 0);
        const expectedEmpty = item.quantity - item.returnedFull;
        const missingShells = Math.max(0, expectedEmpty - item.returnedEmpty);
        
        if (consumed === 0 && (!item.hasShell || missingShells === 0)) return null;

        return (
          <div key={idx} style={{marginBottom: '4px'}}>
            <div style={{fontWeight: 'bold'}}>{item.name}</div>
            <div style={{display: 'flex'}}>
                <span style={{width: '40%'}}></span>
                <span style={{width: '20%', textAlign: 'center'}}>{item.quantity}</span>
                <span style={{width: '20%', textAlign: 'center'}}>{item.returnedFull}</span>
                <span style={{width: '20%', textAlign: 'right'}}>{consumed}</span>
            </div>
            <div style={{textAlign: 'right', fontSize: '10px'}}>
                Importe: ${(consumed * item.price).toFixed(2)}
            </div>
            {item.hasShell && missingShells > 0 && (
                <div style={{textAlign: 'right', fontSize: '10px', color: 'black', fontStyle: 'italic'}}>
                    + {missingShells} Envases (${(missingShells * item.shellPrice).toFixed(2)})
                </div>
            )}
          </div>
        );
      })}

      <div style={styles.separator}></div>

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '60%'}}><span>SUBTOTAL:</span><span>${subtotal.toFixed(2)}</span></div>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '60%'}}><span>IVA (16%):</span><span>${tax.toFixed(2)}</span></div>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid black', paddingTop: '2px', marginTop: '2px'}}><span>TOTAL NETO:</span><span>${totalToPay.toFixed(2)}</span></div>
      </div>

      <div style={{marginTop: '30px', textAlign: 'center'}}>
        <p>__________________________</p>
        <p>FIRMA DE CONFORMIDAD</p>
        <p>({returnerName})</p>
      </div>
    </div>
  );
};