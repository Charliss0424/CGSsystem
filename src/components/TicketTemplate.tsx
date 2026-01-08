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
  isReprint?: boolean;
  // AGREGADO: Recibimos el desglose de impuestos
  taxBreakdown?: Record<string, number>; 
}

export const TicketTemplate: React.FC<TicketTemplateProps> = ({ 
  cart, total, subtotal, savings, amountTendered, change, ticketId, customerName, isReprint, taxBreakdown 
}) => {
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX');
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  // --- LÓGICA DE CONTEO DE ARTÍCULOS ---
  const totalItemsCount = cart.reduce((acc, item) => {
    // Si es pesable (granel), cuenta como 1 "bulto"
    if (item.isWeighable) return acc + 1;
    // Si es unitario, sumamos la cantidad de piezas
    return acc + item.quantity;
  }, 0);

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
      margin: '0 auto' // Centrar en vista previa
    },
    header: { textAlign: 'center' as const, marginBottom: '10px' },
    separator: { borderBottom: '1px dashed #000', margin: '5px 0' },
    colQty: { width: '15%', textAlign: 'left' as const, paddingRight: '2px' }, // Ajuste leve para números grandes
    colDesc: { width: '60%', textAlign: 'left' as const, whiteSpace: 'normal' as const, paddingRight: '2px' },
    colPrice: { width: '25%', textAlign: 'right' as const },
    totalsRow: { display: 'flex', justifyContent: 'space-between', width: '100%' }
  };

  return (
    <div id="print-area" style={styles.container}>
      {isReprint && (
        <div style={{
            position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: '24px', fontWeight: 'bold', color: 'rgba(0,0,0,0.1)', border: '2px solid rgba(0,0,0,0.1)', padding: '10px', zIndex: 0, pointerEvents: 'none'
        }}>
            REIMPRESIÓN
        </div>
      )}
      
      {/* HEADER */}
      <div style={styles.header}>
        {isReprint && <div style={{fontWeight:'bold'}}>*** DUPLICADO ***</div>}
        <div style={{fontSize: '16px', fontWeight: 'bold'}}>{STORE_DATA.name}</div>
        <div>{STORE_DATA.address}</div>
        <div>TEL: {STORE_DATA.phone}</div>
        <div>RFC: {STORE_DATA.rfc}</div>
      </div>

      {/* INFO TICKET */}
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <span>FECHA: {dateStr} {timeStr}</span>
      </div>
      <div>TICKET: #{ticketId || 'PEND'}</div>
      <div style={{marginBottom: '5px'}}>CLIENTE: {customerName || 'MOSTRADOR'}</div>

      {/* TABLA DE PRODUCTOS */}
      <div style={styles.separator}></div>
      <div style={{display: 'flex', fontWeight: 'bold'}}>
        <span style={styles.colQty}>CANT</span>
        <span style={styles.colDesc}>DESCRIPCION</span>
        <span style={styles.colPrice}>IMPORTE</span>
      </div>
      <div style={styles.separator}></div>

      {cart.map((item, idx) => {
        // Cálculo de precio original para mostrar ahorro si aplica
        const originalTotal = item.price * item.quantity;
        const currentTotal = item.finalPrice ? item.finalPrice * item.quantity : item.price * item.quantity;
        const discount = originalTotal - currentTotal;
        
        // Cantidad visual: Si es pesable, mostramos 3 decimales (0.500), si no, entero (1)
        const displayQty = item.isWeighable ? item.quantity.toFixed(3) : item.quantity;

        // Lógica de desglose de contenido (Cajas/Paquetes)
        let contentInfo = "";
        if (item.isPackSale && item.packQuantity) {
            const unitType = item.isWeighable ? 'kg' : 'pzas';
            contentInfo = `(CONT. ${item.packQuantity} ${unitType})`;
        }

        return (
          <div key={idx} style={{marginBottom: '6px'}}>
            <div style={{display: 'flex', alignItems: 'flex-start'}}>
              <span style={styles.colQty}>{displayQty}</span>
              <span style={styles.colDesc}>
                <div>{item.name}</div>
                {contentInfo && (
                    <div style={{fontSize: '10px', fontStyle: 'italic', marginTop: '1px', textTransform: 'none'}}>
                        {contentInfo}
                    </div>
                )}
              </span>
              <span style={styles.colPrice}>
                ${currentTotal.toFixed(2)}
              </span>
            </div>

            {/* Mostrar descuento individual si existe */}
            {discount > 0.01 && (
              <div style={{display: 'flex', justifyContent: 'flex-end', fontSize: '10px', fontStyle:'italic'}}>
                <span style={{marginRight: '5px'}}>AHORRO:</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
          </div>
        );
      })}

      <div style={styles.separator}></div>

      {/* TOTALES */}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
        
        {/* CONTEO DE ARTÍCULOS */}
        <div style={{width:'100%', textAlign:'center', marginBottom:'5px', fontWeight:'bold'}}>
            *** {totalItemsCount} ARTÍCULOS VENDIDOS ***
        </div>

        <div style={styles.totalsRow}>
            <span>SUBTOTAL:</span>
            <span>${subtotal.toFixed(2)}</span>
        </div>

        {/* DESGLOSE DE IMPUESTOS */}
        {taxBreakdown && Object.entries(taxBreakdown).map(([label, amount]) => (
            <div key={label} style={{...styles.totalsRow, fontSize: '11px'}}>
                <span>{label}:</span>
                <span>${amount.toFixed(2)}</span>
            </div>
        ))}

        {savings > 0 && (
          <div style={{...styles.totalsRow, marginTop: '2px'}}>
            <span>AHORRO TOTAL:</span>
            <span>-${savings.toFixed(2)}</span>
          </div>
        )}

        <div style={{...styles.totalsRow, fontSize: '18px', fontWeight: 'bold', borderTop: '1px solid black', marginTop: '4px', paddingTop: '2px'}}>
          <span>TOTAL:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div style={styles.separator}></div>

      {/* PAGO Y CAMBIO */}
      {amountTendered !== undefined && (
        <div style={{textAlign: 'right'}}>
          <div>EFECTIVO: ${amountTendered.toFixed(2)}</div>
          <div style={{fontWeight: 'bold', fontSize: '14px'}}>CAMBIO: ${((change || 0)).toFixed(2)}</div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{marginTop: '15px', textAlign: 'center', whiteSpace: 'pre-line'}}>
        {STORE_DATA.footerMessage}
      </div>
    </div>
  );
};