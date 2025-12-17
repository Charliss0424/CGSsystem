import React, { useState, useEffect } from 'react';
import { X, Beer, User, Printer, RotateCcw, Box } from 'lucide-react';
import { CartItem } from '../types';
import { printElement } from '../utils/printHelper';
import { ConsignmentTicket } from './ConsignmentTicket';

interface ConsignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalItems: CartItem[];
  customerName: string;
  creatorName: string;
  liquidatorName: string;
  onSettle: (finalItems: CartItem[]) => void;
}

export const ConsignmentModal: React.FC<ConsignmentModalProps> = ({ 
  isOpen, onClose, originalItems, customerName, creatorName, liquidatorName, onSettle 
}) => {
  const [returnerName, setReturnerName] = useState('');
  const [grandTotal, setGrandTotal] = useState(0); 
  const [items, setItems] = useState(originalItems.map(i => ({
      ...i, returnedFull: 0, returnedEmpty: 0, hasShell: i.name.toLowerCase().includes('caja') || i.name.toLowerCase().includes('retornable'), shellPrice: 50
  })));

  useEffect(() => {
    let total = 0;
    items.forEach(item => {
        const consumed = Math.max(0, item.quantity - item.returnedFull);
        total += consumed * item.price;
        if (item.hasShell) {
            const missing = Math.max(0, item.quantity - (item.returnedFull + item.returnedEmpty));
            total += missing * item.shellPrice;
        }
    });
    setGrandTotal(total * 1.16); 
  }, [items]);

  if (!isOpen) return null;

  const updateVal = (idx: number, field: string, val: string) => {
    let num = parseFloat(val); if (isNaN(num) || num < 0) num = 0;
    setItems(prev => {
        const newItems = [...prev]; const updatedItem = { ...newItems[idx] };
        if (field === 'returnedFull' && num > updatedItem.quantity) num = updatedItem.quantity;
        (updatedItem as any)[field] = num;
        newItems[idx] = updatedItem;
        return newItems;
    });
  };

  const toggleShells = (idx: number) => {
      setItems(prev => { const newItems = [...prev]; newItems[idx] = { ...newItems[idx], hasShell: !newItems[idx].hasShell }; return newItems; });
  };

  const handleSettlement = () => {
    if (!returnerName.trim()) return alert("Ingresa el nombre de la persona que entrega.");
    const finalCart: any[] = [];
    let subtotalToPrint = 0;
    
    items.forEach(item => {
        const consumed = item.quantity - item.returnedFull;
        if (consumed > 0) {
            finalCart.push({ ...item, quantity: consumed, name: `${item.name} (Consumo)`, isPackSale: true });
            subtotalToPrint += consumed * item.price;
        }
        if (item.hasShell) {
            const missing = Math.max(0, item.quantity - (item.returnedFull + item.returnedEmpty));
            if (missing > 0) {
                finalCart.push({ id: 'envase-' + item.id, name: `IMPORTE ENVASE (${item.name})`, price: item.shellPrice, quantity: missing, isPackSale: true });
                subtotalToPrint += missing * item.shellPrice;
            }
        }
    });

    const Ticket = <ConsignmentTicket originalItems={items} customerName={customerName} returnerName={returnerName} settlementDate={new Date().toISOString()} totalToPay={subtotalToPrint * 1.16} creatorName={creatorName} cashierName={liquidatorName} />;
    printElement(Ticket);
    onSettle(finalCart);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center"><h2 className="text-xl font-bold flex items-center gap-2"><Beer/> Liquidación de Evento</h2><button onClick={onClose}><X/></button></div>
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-4 items-end">
            <div className="flex-1"><label className="block text-sm font-bold text-slate-700 mb-1">Entregó:</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input autoFocus value={returnerName} onChange={(e) => setReturnerName(e.target.value)} className="w-full pl-10 p-2 border border-slate-300 rounded-lg outline-none" placeholder="Nombre..."/></div></div>
            <div className="text-right"><p className="text-xs text-slate-500 font-bold uppercase">Total Estimado</p><p className="text-3xl font-bold text-indigo-700">${grandTotal.toFixed(2)}</p></div>
        </div>
        <div className="flex-1 overflow-auto p-4">
            <table className="w-full text-left border-collapse"><thead className="bg-slate-100 text-slate-500 text-xs font-bold uppercase sticky top-0 z-10"><tr><th className="p-3 border-b">Producto</th><th className="p-3 text-center border-b">Se Llevó</th><th className="p-3 text-center bg-green-50 text-green-700 border-b border-l border-white">Regresó Lleno</th><th className="p-3 text-center bg-gray-50 border-b border-l border-white w-10">¿Envase?</th><th className="p-3 text-center bg-blue-50 text-blue-700 border-b border-l border-white">Regresó Vacío</th><th className="p-3 text-center bg-orange-50 text-orange-700 border-b border-l border-white">Costo Importe</th><th className="p-3 text-center text-red-600 border-b border-l border-white">Subtotal</th></tr></thead>
            <tbody className="text-sm">{items.map((item, idx) => {
                const consumed = item.quantity - item.returnedFull; const missingShells = Math.max(0, (item.quantity - item.returnedFull) - item.returnedEmpty);
                return (<tr key={idx} className="border-b border-slate-100"><td className="p-3 font-medium text-slate-700">{item.name}<div className="text-[10px] text-slate-400">${item.price.toFixed(2)} c/u</div></td><td className="p-3 text-center font-bold text-lg">{item.quantity}</td><td className="p-3 text-center bg-green-50/30"><div className="flex items-center justify-center gap-1"><RotateCcw size={14} className="text-green-400"/><input type="number" min="0" max={item.quantity} className="w-16 p-1 border border-green-200 rounded text-center font-bold outline-none" value={item.returnedFull} onChange={(e) => updateVal(idx, 'returnedFull', e.target.value)} /></div></td><td className="p-3 text-center bg-gray-50/30"><input type="checkbox" checked={!!item.hasShell} onChange={() => toggleShells(idx)} className="w-5 h-5 cursor-pointer"/></td><td className="p-3 text-center bg-blue-50/30">{item.hasShell ? (<div className="flex items-center justify-center gap-1"><Box size={14} className="text-blue-400"/><input type="number" min="0" className="w-16 p-1 border border-blue-200 rounded text-center font-bold outline-none" value={item.returnedEmpty} onChange={(e) => updateVal(idx, 'returnedEmpty', e.target.value)} /></div>) : <span className="text-slate-300">-</span>}</td><td className="p-3 text-center bg-orange-50/30">{item.hasShell ? (<div className="relative w-20 mx-auto"><span className="absolute left-1 top-1/2 -translate-y-1/2 text-orange-400 text-xs">$</span><input type="number" min="0" className="w-full pl-3 p-1 border border-orange-200 rounded text-center text-xs outline-none" value={item.shellPrice} onChange={(e) => updateVal(idx, 'shellPrice', e.target.value)} /></div>) : <span className="text-slate-300">-</span>}</td><td className="p-3 text-right font-bold text-slate-700 bg-red-50/10 border-l border-slate-100"><div className="text-indigo-600 flex justify-between w-full gap-4"><span className="text-[10px] text-slate-400 self-center">{consumed} liq.</span><span>${(consumed * item.price).toFixed(2)}</span></div>{(item.hasShell && missingShells > 0) && (<div className="text-red-500 text-xs border-t border-dashed border-red-200 mt-1 pt-1 flex justify-between w-full gap-4"><span className="text-[10px] opacity-80">{missingShells} env.</span><span>+${(missingShells * item.shellPrice).toFixed(2)}</span></div>)}</td></tr>)
            })}</tbody></table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3"><button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button><button onClick={handleSettlement} className="px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg flex items-center gap-2"><Printer size={20}/> Imprimir y Cobrar</button></div>
      </div>
    </div>
  );
};