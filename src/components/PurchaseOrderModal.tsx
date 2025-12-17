import React, { useState, useEffect } from 'react';
import { 
  X, Printer, Mail, CheckCircle, XCircle, Package, 
  Truck, Calendar, DollarSign, User, FileText, AlertCircle,
  Copy, Download, Eye
} from 'lucide-react';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  order: any | null;
  onClose: () => void;
  onReceive: () => void;
  onPrint?: () => void;
  onEmail?: () => void;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  isOpen,
  order,
  onClose,
  onReceive,
  onPrint,
  onEmail
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  // Calcular totales
  const calculateTotals = () => {
    const subtotal = order.items?.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unitCost * (1 - (item.discount || 0) / 100)), 0) || 0;
    
    const tax = subtotal * (order.taxRate || 0.16);
    const discount = order.items?.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unitCost * (item.discount || 0) / 100), 0) || 0;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      discount: discount.toFixed(2),
      total: (subtotal + tax).toFixed(2)
    };
  };

  const totals = calculateTotals();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800';
      case 'RECEIVED': return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING': return <AlertCircle size={16} className="inline mr-1"/>;
      case 'RECEIVED': return <CheckCircle size={16} className="inline mr-1"/>;
      case 'CANCELLED': return <XCircle size={16} className="inline mr-1"/>;
      default: return null;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800">Orden de Compra #{order.orderNumber}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status === 'PENDING' && 'Pendiente'}
                  {order.status === 'RECEIVED' && 'Recibida'}
                  {order.status === 'CANCELLED' && 'Cancelada'}
                </span>
              </div>
              <p className="text-slate-500 mt-1">
                Creada el {new Date(order.createdAt).toLocaleDateString()} • 
                {order.reference && ` Referencia: ${order.reference}`}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onPrint}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                title="Imprimir"
              >
                <Printer size={20}/>
              </button>
              <button
                onClick={onEmail}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                title="Enviar por email"
              >
                <Mail size={20}/>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X size={20}/>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {/* Información de proveedor y entrega */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <User size={18}/> Proveedor
              </h3>
              <div className="space-y-2">
                <p className="font-bold">{order.supplierName}</p>
                {order.supplierContact && <p className="text-sm">{order.supplierContact}</p>}
                {order.supplierEmail && <p className="text-sm text-blue-600">{order.supplierEmail}</p>}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Truck size={18}/> Entrega y Pago
              </h3>
              <div className="space-y-2">
                {order.deliveryDate && (
                  <p className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400"/>
                    <span className="font-medium">Entrega:</span>
                    {new Date(order.deliveryDate).toLocaleDateString()}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <DollarSign size={16} className="text-slate-400"/>
                  <span className="font-medium">Condiciones:</span>
                  {order.paymentTerms || 'Contado'}
                </p>
              </div>
            </div>
          </div>

          {/* Items de la orden */}
          <div className="mb-8">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Package size={18}/> Productos
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-bold text-slate-600">Producto</th>
                    <th className="text-left p-3 text-sm font-bold text-slate-600">Cantidad</th>
                    <th className="text-left p-3 text-sm font-bold text-slate-600">Precio Unit.</th>
                    <th className="text-left p-3 text-sm font-bold text-slate-600">Desc.</th>
                    <th className="text-left p-3 text-sm font-bold text-slate-600">Total</th>
                    <th className="text-left p-3 text-sm font-bold text-slate-600">Recibido</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: any, index: number) => (
                    <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-slate-500">{item.sku}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{item.quantity}</div>
                        {item.receivedQuantity !== undefined && (
                          <div className="text-xs text-slate-500">
                            Pendiente: {item.quantity - (item.receivedQuantity || 0)}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-medium">${item.unitCost.toFixed(2)}</td>
                      <td className="p-3">
                        {item.discount ? (
                          <span className="text-emerald-600 font-medium">{item.discount}%</span>
                        ) : '-'}
                      </td>
                      <td className="p-3 font-bold">${item.totalCost?.toFixed(2) || (item.quantity * item.unitCost).toFixed(2)}</td>
                      <td className="p-3">
                        {item.receivedQuantity !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${item.receivedQuantity === item.quantity ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {item.receivedQuantity}/{item.quantity}
                            </span>
                            <Eye size={14} className="text-slate-400 cursor-pointer hover:text-slate-600"/>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notas */}
          {order.notes && (
            <div className="mb-8">
              <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText size={18}/> Notas
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-slate-700">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Totales */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">${totals.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Descuento</span>
                  <span className="font-medium text-emerald-600">-${totals.discount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">IVA (16%)</span>
                  <span className="font-medium">${totals.tax}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3">
                  <span className="text-lg font-bold text-slate-800">Total</span>
                  <span className="text-2xl font-bold text-slate-800">${totals.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={() => copyToClipboard(order.orderNumber)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 flex items-center gap-2"
              >
                <Copy size={16}/>
                {copied ? '¡Copiado!' : 'Copiar Número'}
              </button>
              <button
                onClick={onPrint}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 flex items-center gap-2"
              >
                <Download size={16}/>
                Descargar PDF
              </button>
            </div>
            
            <div className="flex gap-3">
              {order.status === 'PENDING' && (
                <button
                  onClick={onReceive}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"
                >
                  <CheckCircle size={20}/>
                  Recibir Mercancía
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};