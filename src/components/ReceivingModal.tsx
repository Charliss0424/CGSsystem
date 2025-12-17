import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, Package, AlertCircle, Truck, 
  User, Calendar, CheckSquare, Square, FileText
} from 'lucide-react';

interface ReceivingModalProps {
  isOpen: boolean;
  order: any | null;
  onClose: () => void;
  onComplete: (receiptData: any) => void;
}

export const ReceivingModal: React.FC<ReceivingModalProps> = ({
  isOpen,
  order,
  onClose,
  onComplete
}) => {
  const [receiptItems, setReceiptItems] = useState<any[]>([]);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isPartial, setIsPartial] = useState(false);

  useEffect(() => {
    if (order && order.items) {
      // Inicializar items para recepción
      const items = order.items.map((item: any) => ({
        ...item,
        quantityToReceive: item.quantity - (item.receivedQuantity || 0),
        quantityReceived: 0,
        condition: 'GOOD',
        notes: ''
      }));
      setReceiptItems(items);
      
      // Generar número de recepción automático
      const date = new Date();
      const formattedDate = date.getFullYear().toString() +
                           (date.getMonth() + 1).toString().padStart(2, '0') +
                           date.getDate().toString().padStart(2, '0');
      setReceiptNumber(`REC-${formattedDate}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
      setReceiptDate(date.toISOString().split('T')[0]);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...receiptItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Si cambia la cantidad recibida, actualizar automáticamente
    if (field === 'quantityReceived') {
      const qty = parseInt(value) || 0;
      const max = newItems[index].quantityToReceive;
      newItems[index].quantityReceived = Math.min(Math.max(0, qty), max);
    }
    
    setReceiptItems(newItems);
  };

  const toggleSelectAll = () => {
    const allChecked = receiptItems.every(item => item.quantityReceived > 0);
    const newItems = receiptItems.map(item => ({
      ...item,
      quantityReceived: allChecked ? 0 : item.quantityToReceive
    }));
    setReceiptItems(newItems);
  };

  const getItemStatus = (item: any) => {
    if (item.quantityReceived === 0) return 'PENDING';
    if (item.quantityReceived === item.quantityToReceive) return 'COMPLETE';
    return 'PARTIAL';
  };

  const calculateReceiptSummary = () => {
    const totalItems = receiptItems.length;
    const itemsToReceive = receiptItems.reduce((sum, item) => sum + item.quantityToReceive, 0);
    const itemsReceived = receiptItems.reduce((sum, item) => sum + item.quantityReceived, 0);
    const completedItems = receiptItems.filter(item => item.quantityReceived === item.quantityToReceive).length;
    
    return {
      totalItems,
      itemsToReceive,
      itemsReceived,
      completedItems,
      percentage: itemsToReceive > 0 ? Math.round((itemsReceived / itemsToReceive) * 100) : 0
    };
  };

  const handleComplete = () => {
    const summary = calculateReceiptSummary();
    
    // Validar que al menos un item tenga cantidad recibida
    if (summary.itemsReceived === 0) {
      alert('Debe recibir al menos un producto');
      return;
    }

    const receiptData = {
      orderId: order.id,
      receiptNumber,
      receiptDate,
      notes,
      items: receiptItems.map(item => ({
        orderItemId: item.id,
        productId: item.productId,
        quantityReceived: item.quantityReceived,
        condition: item.condition,
        notes: item.notes
      })),
      isPartial: summary.itemsReceived < summary.itemsToReceive,
      summary
    };

    onComplete(receiptData);
  };

  const summary = calculateReceiptSummary();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Truck className="text-emerald-600"/>
                Recepción de Mercancía
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-slate-600">
                  Orden: <span className="font-bold">#{order.orderNumber}</span>
                </div>
                <div className="text-slate-600">
                  Proveedor: <span className="font-bold">{order.supplierName}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X size={20}/>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {/* Información de recepción */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <FileText size={18}/> Recepción
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Número de Recepción</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Fecha de Recepción</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <AlertCircle size={18}/> Resumen
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Productos a recibir:</span>
                  <span className="font-bold">{summary.totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Unidades pendientes:</span>
                  <span className="font-bold">{summary.itemsToReceive}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Unidades recibidas:</span>
                  <span className="font-bold text-emerald-600">{summary.itemsReceived}</span>
                </div>
                <div className="pt-2">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${summary.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 text-center mt-1">
                    {summary.percentage}% completado
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <FileText size={18}/> Notas
              </h3>
              <textarea
                className="w-full h-32 p-2 border border-slate-300 rounded-lg resize-none"
                placeholder="Observaciones, daños, diferencias..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de productos */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Package size={18}/> Productos a Recibir
              </h3>
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
              >
                {receiptItems.every(item => item.quantityReceived > 0) ? (
                  <>
                    <CheckSquare size={16}/> Desmarcar Todos
                  </>
                ) : (
                  <>
                    <Square size={16}/> Marcar Todos
                  </>
                )}
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-bold text-slate-600 w-8"></th>
                      <th className="text-left p-3 text-sm font-bold text-slate-600">Producto</th>
                      <th className="text-left p-3 text-sm font-bold text-slate-600">Pendiente</th>
                      <th className="text-left p-3 text-sm font-bold text-slate-600">Recibido</th>
                      <th className="text-left p-3 text-sm font-bold text-slate-600">Condición</th>
                      <th className="text-left p-3 text-sm font-bold text-slate-600">Notas</th>
                      <th className="text-left p-3 text-sm font-bold text-slate-600">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptItems.map((item, index) => {
                      const status = getItemStatus(item);
                      return (
                        <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={item.quantityReceived > 0}
                              onChange={(e) => updateItem(index, 'quantityReceived', e.target.checked ? item.quantityToReceive : 0)}
                              className="rounded border-slate-300"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-slate-500">SKU: {item.sku}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{item.quantityToReceive}</div>
                            <div className="text-xs text-slate-500">
                              Original: {item.quantity}
                              {item.receivedQuantity > 0 && ` (Ya recibido: ${item.receivedQuantity})`}
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="0"
                              max={item.quantityToReceive}
                              className="w-20 p-2 border border-slate-300 rounded-lg text-center font-bold"
                              value={item.quantityReceived}
                              onChange={(e) => updateItem(index, 'quantityReceived', e.target.value)}
                            />
                          </td>
                          <td className="p-3">
                            <select
                              className="w-full p-2 border border-slate-300 rounded-lg"
                              value={item.condition}
                              onChange={(e) => updateItem(index, 'condition', e.target.value)}
                            >
                              <option value="GOOD">Buen Estado</option>
                              <option value="DAMAGED">Dañado</option>
                              <option value="INCORRECT">Incorrecto</option>
                              <option value="MISSING">Faltante</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                              placeholder="Observaciones..."
                              value={item.notes}
                              onChange={(e) => updateItem(index, 'notes', e.target.value)}
                            />
                          </td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              status === 'COMPLETE' ? 'bg-emerald-100 text-emerald-800' :
                              status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {status === 'COMPLETE' && 'Completo'}
                              {status === 'PARTIAL' && 'Parcial'}
                              {status === 'PENDING' && 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Validaciones y alertas */}
          {receiptItems.some(item => item.condition !== 'GOOD') && (
            <div className="mb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={18}/> Alertas de Calidad
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  {receiptItems
                    .filter(item => item.condition !== 'GOOD' && item.quantityReceived > 0)
                    .map((item, index) => (
                      <li key={index}>
                        • {item.productName}: {item.condition === 'DAMAGED' ? 'Dañado' : 
                          item.condition === 'INCORRECT' ? 'Producto incorrecto' : 'Faltante'}
                        {item.notes && ` - ${item.notes}`}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <div className="flex justify-between items-center">
            <div>
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  checked={isPartial}
                  onChange={(e) => setIsPartial(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span>Es una recepción parcial</span>
              </label>
              <p className="text-xs text-slate-500 mt-1">
                {isPartial 
                  ? 'La orden permanecerá activa para recibir el resto después'
                  : 'La orden se marcará como completamente recibida'}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleComplete}
                disabled={summary.itemsReceived === 0}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle size={20}/>
                Completar Recepción
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};