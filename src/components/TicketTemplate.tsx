import React from 'react';
import { CartItem } from '../types';

// DATOS DE LA TIENDA
const STORE_DATA = {
  name: "ABARROTES EL PUNTO",
  address: "Av. Revolución #123, Centro",
  city: "CDMX, México",
  phone: "55-1234-5678",
  rfc: "XAXX010101000",
  footerMessage: "¡Gracias por su compra!\nConserve este ticket para aclaraciones."
};

interface TicketTemplateProps {
  cart: CartItem[];
  total: number;
  subtotal: number;
  savings: number;
  amountTendered?: number;
  change?: number;
  ticketId?: string;
  customerName?: string;
  isReprint?: boolean; // <--- Nuevo
  
}

export const TicketTemplate: React.FC<TicketTemplateProps> = ({ 
  cart, total, savings, amountTendered, change, ticketId, customerName, isReprint 
}) => {
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX');
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

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
    colQty: { width: '10%', textAlign: 'left' as const },
    colDesc: { width: '65%', textAlign: 'left' as const, whiteSpace: 'normal' as const }, // Permitir salto de línea
    colPrice: { width: '25%', textAlign: 'right' as const },
  };

  return (
    <div style={styles.container}>
      {isReprint && (
        <div style={{
            position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: '24px', fontWeight: 'bold', color: 'rgba(0,0,0,0.1)', border: '2px solid rgba(0,0,0,0.1)', padding: '10px', zIndex: 0
        }}>
            REIMPRESIÓN
        </div>
      )}
      <div style={styles.header}>
        {isReprint && <div style={{fontWeight:'bold'}}>*** DUPLICADO ***</div>}
        <div style={{fontSize: '16px', fontWeight: 'bold'}}>{STORE_DATA.name}</div>
        <div>{STORE_DATA.address}</div>
        <div>TEL: {STORE_DATA.phone}</div>
        <div>RFC: {STORE_DATA.rfc}</div>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <span>FECHA: {dateStr} {timeStr}</span>
      </div>
      <div>TICKET: #{ticketId || 'PEND'}</div>
      <div style={{marginBottom: '5px'}}>CLIENTE: {customerName || 'MOSTRADOR'}</div>

      <div style={styles.separator}></div>
      <div style={{display: 'flex', fontWeight: 'bold'}}>
        <span style={styles.colQty}>CANT</span>
        <span style={styles.colDesc}>DESCRIPCION</span>
        <span style={styles.colPrice}>IMPORTE</span>
      </div>
      <div style={styles.separator}></div>

      {cart.map((item, idx) => {
        const originalTotal = item.price * item.quantity;
        const discount = originalTotal - ((item.finalPrice || item.price) * item.quantity);
        
        // Lógica de desglose de contenido
        let contentInfo = "";
        if (item.isPackSale && item.packQuantity) {
            const unitType = item.isWeighable ? 'kg' : 'pzas';
            // Ej: (Cont. 12 pzas) o (Cont. 25 kg)
            contentInfo = `(CONT. ${item.packQuantity} ${unitType})`;
        }

        return (
          <div key={idx} style={{marginBottom: '6px'}}>
            <div style={{display: 'flex'}}>
              <span style={styles.colQty}>{item.quantity}</span>
              <span style={styles.colDesc}>
                {item.name}
                {/* Mostramos el contenido aquí para que el cliente lo vea claro */}
                {contentInfo && (
                    <div style={{fontSize: '10px', fontStyle: 'italic', marginTop: '2px'}}>
                        {contentInfo} - Total: {item.quantity * (item.packQuantity || 1)} {item.isWeighable ? 'kg' : 'pzas'}
                    </div>
                )}
              </span>
              <span style={styles.colPrice}>
                {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>

            {discount > 0.01 && (
              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <span style={{marginRight: '10px', fontSize: '11px'}}>AHORRO/DESC.</span>
                <span style={{fontWeight: 'bold'}}>-{discount.toFixed(2)}</span>
              </div>
            )}
          </div>
        );
      })}

      <div style={styles.separator}></div>

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
        {savings > 0 && (
          <div style={{display: 'flex', justifyContent: 'space-between', width: '60%'}}>
            <span>AHORRO:</span><span>-{savings.toFixed(2)}</span>
          </div>
        )}
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid black', paddingTop: '2px'}}>
          <span>TOTAL:</span><span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div style={styles.separator}></div>

      {amountTendered !== undefined && (
        <div style={{textAlign: 'right'}}>
          <div>EFECTIVO: ${amountTendered.toFixed(2)}</div>
          <div style={{fontWeight: 'bold'}}>CAMBIO: ${((change || 0)).toFixed(2)}</div>
        </div>
      )}

      <div style={{marginTop: '15px', textAlign: 'center'}}>
        <p>{STORE_DATA.footerMessage}</p>
      </div>
    </div>
  );
};