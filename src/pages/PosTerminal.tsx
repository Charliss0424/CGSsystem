import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Trash2, Plus, Minus, CreditCard, 
  Banknote, Wallet, PackageX, Box, Tag, Scale, 
  MoreHorizontal, User, Printer, Clock,
  ZoomIn, X, AlertCircle, Zap, RotateCcw, Users, Coffee, 
  ChevronDown, ChevronUp, Move, ArrowUpCircle, ArrowDownCircle, FileText,
  ArrowLeft, RefreshCw, ChevronRight, CheckCircle, List, Check
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Product, CartItem, ViewState, PendingSale } from '../types';
// Componentes Externos
import { PaymentModal } from '../components/PaymentModal'; 
import { TicketTemplate } from '../components/TicketTemplate';
import { QuantityModal } from '../components/QuantityModal';
import { CreditSaleModal } from '../components/CreditSaleModal';
import { ClientSearchModal } from '../components/ClientSearchModal';
import { AdminAuthModal } from '../components/AdminAuthModal';
import { WeightModal } from '../components/WeightModal';
import { ConsignmentModal } from '../components/ConsignmentModal'; 
import { printElement } from '../utils/printHelper';

// ==========================================
// 0. COMPONENTE AUXILIAR: TICKET DE CORTE (DISEÑO EXACTO)
// ==========================================
const ShiftTicketTemplate: React.FC<{ title: string; data: any; date: string; cashier: string }> = ({ title, data, date, cashier }) => (
  <div style={{ fontFamily: 'Courier New, monospace', fontSize: '12px', width: '72mm', padding: '5px', color: 'black', backgroundColor: 'white' }}>
    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>ABARROTES EL PUNTO</div>
      <div style={{ fontWeight: 'bold', margin: '5px 0' }}>*** {title} ***</div>
      <div style={{ fontSize: '10px' }}>(DETALLADO)</div>
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
      <span>FECHA:</span><span>{date.split(',')[0]}</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
      <span>HORA:</span><span>{date.split(',')[1] || ''}</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
      <span>CAJERO:</span><span style={{ textTransform: 'uppercase' }}>{cashier}</span>
    </div>
    
    <div style={{ borderTop: '1px dashed black', margin: '5px 0' }}></div>
    
    <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '5px 0' }}>RESUMEN DE VENTAS</div>
    <div style={{ borderBottom: '1px solid black', marginBottom: '5px' }}></div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}><span>EFECTIVO:</span><span>${data.totalCash.toFixed(2)}</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}><span>TARJETA:</span><span>${data.totalCard.toFixed(2)}</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}><span>CRÉDITO:</span><span>${data.totalCredit.toFixed(2)}</span></div>
    
    <div style={{ borderTop: '1px solid black', margin: '5px 0' }}></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>TOTAL VENTAS:</span><span>${data.totalSales.toFixed(2)}</span></div>
    
    <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '15px 0 5px 0' }}>ARQUEO DE CAJA</div>
    <div style={{ borderBottom: '1px solid black', marginBottom: '5px' }}></div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}><span>FONDO INICIAL:</span><span>$0.00</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}><span>(+) VENTAS EFECTIVO:</span><span>${data.totalCash.toFixed(2)}</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}><span>(+) ENTRADAS:</span><span>${data.totalEntries.toFixed(2)}</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}><span>(-) SALIDAS:</span><span>${data.totalExits.toFixed(2)}</span></div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '10px', fontSize: '14px' }}>
      <span>EN CAJA:</span><span>${data.cashInBox.toFixed(2)}</span>
    </div>
    
    <div style={{ borderTop: '1px dashed black', margin: '20px 0 40px 0' }}></div>
    
    <div style={{ textAlign: 'center', borderTop: '1px solid black', paddingTop: '5px', width: '80%', margin: '0 auto', fontSize: '10px' }}>
      FIRMA SUPERVISOR
    </div>
  </div>
);

const OperationTicket: React.FC<{ title: string; amount: string; reason: string; date: string; cashier: string }> = ({ title, amount, reason, date, cashier }) => (
    <div style={{ fontFamily: 'Courier New, monospace', fontSize: '12px', width: '72mm', padding: '5px', color: 'black', backgroundColor: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>ABARROTES EL PUNTO</div>
        <div style={{ fontWeight: 'bold', margin: '5px 0' }}>*** {title.toUpperCase()} ***</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>FECHA:</span><span>{date}</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>USUARIO:</span><span>{cashier}</span></div>
      <div style={{ borderTop: '1px dashed black', margin: '10px 0' }}></div>
      <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center', margin: '10px 0' }}>MONTO: ${parseFloat(amount).toFixed(2)}</div>
      <div style={{ marginBottom: '10px' }}><strong>CONCEPTO:</strong><br/>{reason}</div>
      <div style={{ borderTop: '1px dashed black', margin: '20px 0' }}></div>
      <div style={{ textAlign: 'center' }}>FIRMA</div>
    </div>
);

// ==========================================
// 1. PANTALLA INTERNA: VENTAS PENDIENTES (F2)
// ==========================================
interface PendingSalesScreenProps {
  onBack: () => void;
  onLoadSale: (sale: PendingSale) => void;
  onSettleSale: (sale: PendingSale) => void;
  onDeleteSale: (id: string) => void;
}

const PendingSalesScreen: React.FC<PendingSalesScreenProps> = ({ onBack, onLoadSale, onSettleSale, onDeleteSale }) => {
  const { getPendingSales } = useDatabase();
  const [sales, setSales] = useState<PendingSale[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getPendingSales();
    setSales(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const formatDate = (dateInput: any) => {
    if (!dateInput) return "Fecha desconocida";
    try {
        const date = dateInput.seconds ? new Date(dateInput.seconds * 1000) : new Date(dateInput);
        if (isNaN(date.getTime())) return "Fecha desconocida";
        return date.toLocaleString('es-MX', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit', hour12: true 
        });
    } catch (e) {
        return "Fecha inválida";
    }
  };

  // --- BUSCADOR DE NOMBRES MEJORADO ---
  const getSaleName = (sale: any) => {
      // 1. Buscamos cualquier propiedad que pueda contener el nombre
      const foundName = sale.customerName || sale.clientName || sale.name || sale.nombre || sale.title;
      
      // 2. Si encontramos algo y NO es el genérico, lo devolvemos
      if (foundName && typeof foundName === 'string' && foundName.trim() !== '') {
          // Ignoramos si la base de datos guardó literalmente "Cliente General" pero queremos ver si hay otro dato
          if (foundName !== 'Cliente General' && foundName !== 'Consumo General') {
              return foundName;
          }
      }
      
      // 3. Si no hay nada específico, usamos el genérico según el tipo
      return sale.type === 'CONSIGNMENT' ? 'Consumo General' : 'Cliente General';
  };

  const pausedSales = sales.filter(s => s.type === 'GENERAL');
  const eventSales = sales.filter(s => s.type === 'CONSIGNMENT');

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"><ArrowLeft size={24} /></button>
          <div><h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Clock className="text-orange-500" /> Ventas Pendientes</h1><p className="text-sm text-slate-500">Administra ventas pausadas y eventos.</p></div>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors"><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Actualizar Lista</button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Box size={20} className="text-slate-400"/> Ventas Pausadas</h2>
            <div className="space-y-3">
              {pausedSales.length === 0 && <div className="text-slate-400 italic text-sm p-4 border border-dashed border-slate-300 rounded-lg text-center">No hay ventas pausadas</div>}
              {pausedSales.map(sale => (
                <div key={sale.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight uppercase">{getSaleName(sale)}</h3>
                      <p className="text-xs text-slate-400">{formatDate(sale.date)}</p>
                      <p className="text-blue-600 font-bold text-sm mt-1">{sale.itemCount} prods - <span className="text-base">${sale.total.toFixed(2)}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => onDeleteSale(sale.id)} className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={20}/></button>
                    <button onClick={() => onLoadSale(sale)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-blue-200 shadow-md">Retomar <ChevronRight size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Coffee size={20} className="text-slate-400"/> Eventos a Consumo</h2>
            <div className="space-y-3">
              {eventSales.length === 0 && <div className="text-slate-400 italic text-sm p-4 border border-dashed border-slate-300 rounded-lg text-center">No hay eventos activos</div>}
              {eventSales.map(sale => (
                <div key={sale.id} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-4">
                      <div className="flex items-center gap-2 text-indigo-900 font-bold text-lg uppercase"><User size={18} className="text-indigo-400"/> {getSaleName(sale)}</div>
                      <p className="text-xs text-slate-400 ml-6">{formatDate(sale.date)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="bg-white text-indigo-700 font-bold text-sm px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">Mercancía: ${sale.total.toFixed(2)}</span>
                    <div className="flex flex-col items-end gap-1">
                        <button onClick={() => onSettleSale(sale)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"><CheckCircle size={16}/> Liquidar</button>
                        <button onClick={() => onDeleteSale(sale.id)} className="text-red-400 hover:text-red-600 text-[10px] flex items-center gap-1 pr-1 font-medium transition-colors"><Trash2 size={12}/> Cancelar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. PANTALLA INTERNA: DEVOLUCIONES (F3)
// ==========================================
const ReturnsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { sales } = useDatabase();
    const [searchTerm, setSearchTerm] = useState('');

    const recentSales = (sales || []).filter(sale => {
        const saleDate = sale.date?.seconds ? new Date(sale.date.seconds * 1000) : new Date(sale.date);
        const diffTime = Math.abs(new Date().getTime() - saleDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 8;
    });

    const filteredSales = recentSales.filter(s => 
        (s.id && s.id.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-full bg-slate-50 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white p-4 border-b border-slate-200 flex items-center gap-4 shadow-sm shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"><ArrowLeft size={24} /></button>
                <div><h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><RotateCcw className="text-pink-500" /> Devoluciones en Caja</h1><p className="text-sm text-slate-500">Solo tickets menores a 8 días.</p></div>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col">
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                            <input 
                                type="text" 
                                placeholder="Buscar folio o cliente..." 
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-pink-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredSales.map(sale => (
                            <button key={sale.id} className="w-full text-left p-4 border-b border-slate-100 hover:bg-pink-50 transition-colors group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-slate-700 group-hover:text-pink-700">#{sale.id ? sale.id.slice(0,8) : '---'}</span>
                                    <span className="font-bold text-slate-900">${sale.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-500">
                                    <span>{new Date(sale.date?.seconds ? sale.date.seconds * 1000 : sale.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1 text-green-600 font-bold"><Check size={12}/> VIGENTE</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-300 p-8">
                    <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center max-w-md">
                        <RefreshCw size={64} className="mb-4 opacity-20"/>
                        <p className="text-lg font-medium text-slate-400">Selecciona un ticket de la lista para gestionar la devolución</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 3. COMPONENTE INTERNO: GESTOR DE TURNOS
// ==========================================
interface ShiftOperationsModalProps { 
    isOpen: boolean; 
    onClose: () => void; 
    initialTab: 'ENTRY' | 'EXIT' | 'CUT_X' | 'CUT_Z' | 'GENERAL'; 
    cashierName: string;
    onRegisterMovement: (type: 'ENTRY' | 'EXIT', amount: number, reason: string) => void;
    movements: any[];
}

const ShiftOperationsModal: React.FC<ShiftOperationsModalProps> = ({ isOpen, onClose, initialTab, cashierName, onRegisterMovement, movements }) => {
  const { sales } = useDatabase(); 
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [viewMode, setViewMode] = useState<'SUMMARY' | 'DETAILS'>('SUMMARY'); 

  useEffect(() => { if(isOpen) { setActiveTab(initialTab); setAmount(''); setReason(''); setViewMode('SUMMARY'); } }, [isOpen, initialTab]);
  if (!isOpen) return null;

  const handleRegister = (type: 'ENTRY' | 'EXIT') => {
      const val = parseFloat(amount);
      if (isNaN(val) || val <= 0) return alert("Monto inválido");
      onRegisterMovement(type, val, reason);
      const date = new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' });
      printElement(<OperationTicket title={type === 'ENTRY' ? 'ENTRADA DE DINERO' : 'SALIDA DE DINERO'} amount={amount} reason={reason || 'Sin concepto'} date={date} cashier={cashierName} />);
      onClose();
  };

  const calculateShiftTotals = () => {
      let totalCash = 0, totalCard = 0, totalCredit = 0;
      const productMap: Record<string, {name: string, quantity: number, total: number}> = {};
      
      (sales || []).forEach(sale => {
          if (sale.paymentMethod === 'cash') totalCash += sale.total;
          else if (sale.paymentMethod === 'card') totalCard += sale.total;
          else if (sale.paymentMethod === 'credit') totalCredit += sale.total;
          
          sale.items.forEach(item => {
              if (!productMap[item.id]) { productMap[item.id] = { name: item.name, quantity: 0, total: 0 }; }
              productMap[item.id].quantity += item.quantity;
              productMap[item.id].total += (item.price * item.quantity);
          });
      });

      let totalEntries = 0;
      let totalExits = 0;
      movements.forEach(m => {
          if (m.type === 'ENTRY') totalEntries += m.amount;
          if (m.type === 'EXIT') totalExits += m.amount;
      });

      const cashInBox = totalCash + totalEntries - totalExits;

      return { totalSales: totalCash + totalCard, cashInBox, totalCash, totalCard, totalCredit, totalEntries, totalExits, products: Object.values(productMap) };
  };
  const shiftData = calculateShiftTotals();

  const handlePrintCut = () => {
      const title = activeTab === 'CUT_Z' ? 'CORTE FINAL (Z)' : 'CORTE PARCIAL (X)';
      const date = new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' });
      printElement(<ShiftTicketTemplate title={title} data={shiftData} date={date} cashier={cashierName || 'ADMIN'} />);
  };

  if (activeTab === 'ENTRY' || activeTab === 'EXIT') {
    const isEntry = activeTab === 'ENTRY';
    const colorClass = isEntry ? 'bg-emerald-600' : 'bg-red-600';
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in">
        <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
          <div className={`${colorClass} p-4 flex justify-between items-center text-white`}><div className="flex items-center gap-2 font-bold text-lg">{isEntry ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24}/>} {isEntry ? 'Entrada' : 'Salida'}</div><button onClick={onClose}><X size={24} /></button></div>
          <div className="p-6 space-y-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Monto ($)</label><input type="number" autoFocus className="w-full text-4xl font-bold text-slate-800 border-b-2 border-slate-300 focus:border-blue-500 outline-none py-2" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} /></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1">Motivo</label><input type="text" className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej. Cambio inicial..." value={reason} onChange={e => setReason(e.target.value)} /></div>
            <div className="flex gap-3 mt-6">
                <button onClick={() => { onRegisterMovement(isEntry ? 'ENTRY' : 'EXIT', parseFloat(amount), reason); onClose(); }} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-200">Solo Guardar</button>
                <button onClick={() => handleRegister(isEntry ? 'ENTRY' : 'EXIT')} className={`flex-1 ${colorClass} text-white font-bold py-3 rounded-lg hover:brightness-110`}>Imprimir Ticket</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isZ = activeTab === 'CUT_Z';
  const colorClass = isZ ? 'bg-red-800' : 'bg-purple-600';
  const title = isZ ? 'Corte Final (Z)' : 'Corte Parcial (X)';
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className={`${colorClass} p-4 flex justify-between items-center text-white shrink-0`}><div><h2 className="font-bold text-xl">{title}</h2><p className="text-xs opacity-80">{new Date().toLocaleString()}</p></div><button onClick={onClose}><X size={24} /></button></div>
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button onClick={() => setViewMode('SUMMARY')} className={`flex-1 py-3 text-sm font-bold border-b-4 transition-colors flex items-center justify-center gap-2 ${viewMode === 'SUMMARY' ? `border-${isZ ? 'red' : 'purple'}-600 text-${isZ ? 'red' : 'purple'}-700 bg-white` : 'border-transparent text-slate-500 hover:bg-slate-100'}`}><Clock size={16}/> Resumen Global</button>
          <button onClick={() => setViewMode('DETAILS')} className={`flex-1 py-3 text-sm font-bold border-b-4 transition-colors flex items-center justify-center gap-2 ${viewMode === 'DETAILS' ? `border-${isZ ? 'red' : 'purple'}-600 text-${isZ ? 'red' : 'purple'}-700 bg-white` : 'border-transparent text-slate-500 hover:bg-slate-100'}`}><List size={16}/> Detalle de Productos</button>
        </div>
        <div className="p-6 overflow-y-auto bg-slate-100 space-y-4 flex-1">
            {viewMode === 'SUMMARY' ? (
                <>
                <div className="grid grid-cols-2 gap-4"><div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas Totales</p><p className="text-4xl font-bold text-slate-800 mt-2">${shiftData.totalSales.toFixed(2)}</p></div><div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dinero en Caja</p><p className="text-4xl font-bold text-green-600 mt-2">${shiftData.cashInBox.toFixed(2)}</p></div></div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"><div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-700 text-sm">Desglose de Ingresos</div><div className="p-4 space-y-3 text-sm"><div className="flex justify-between items-center"><span className="text-slate-600">Ventas Efectivo</span><span className="font-bold text-slate-800">${shiftData.totalCash.toFixed(2)}</span></div><div className="flex justify-between items-center"><span className="text-slate-600">Ventas Tarjeta</span><span className="font-bold text-slate-800">${shiftData.totalCard.toFixed(2)}</span></div><div className="flex justify-between items-center text-slate-400"><span>Crédito (No ingresa dinero)</span><span>${shiftData.totalCredit.toFixed(2)}</span></div><div className="border-t border-slate-100 my-2 pt-2"></div><div className="flex justify-between items-center text-green-600"><span>(+) Fondo Inicial / Entradas</span><span className="font-bold">${shiftData.totalEntries.toFixed(2)}</span></div><div className="flex justify-between items-center text-red-500"><span>(-) Gastos / Retiros</span><span className="font-bold">-${shiftData.totalExits.toFixed(2)}</span></div></div></div>
                </>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]"><div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex text-xs font-bold text-slate-500 uppercase"><div className="w-16 text-center">Cant.</div><div className="flex-1">Producto</div><div className="w-24 text-right">Total</div></div><div className="divide-y divide-slate-100">{shiftData.products.length === 0 ? (<div className="p-8 text-center text-slate-400 italic">No hay ventas registradas en este turno.</div>) : (shiftData.products.map((prod, idx) => (<div key={idx} className="px-4 py-3 flex items-center text-sm hover:bg-slate-50"><div className="w-16 text-center font-bold text-slate-700">{prod.quantity}</div><div className="flex-1 font-medium text-slate-800">{prod.name}</div><div className="w-24 text-right font-bold text-slate-600">${prod.total.toFixed(2)}</div></div>)))}</div></div>
            )}
        </div>
        <div className="p-4 bg-white border-t border-slate-200 flex gap-3 shrink-0">
            <button onClick={handlePrintCut} className="flex-1 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"><Printer size={18}/> Imprimir Resumen</button>
            <button onClick={handlePrintCut} className={`flex-1 py-3 ${colorClass} text-white rounded-lg font-bold hover:brightness-110 shadow-lg flex items-center justify-center gap-2`}><FileText size={18}/> Imprimir Detallado</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. COMPONENTE: CALCULADORA FLOTANTE
// ==========================================
const DraggableCalculator: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [resetNext, setResetNext] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (isOpen && modalRef.current) setPosition({ x: (window.innerWidth - 300) / 2, y: (window.innerHeight - 450) / 2 }); }, [isOpen]);
  if (!isOpen) return null;
  const handleMouseDown = (e: React.MouseEvent) => { if (modalRef.current) { setIsDragging(true); setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y }); } };
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }); };
  const handlePress = (val: string) => {
    if (val === 'C') { setDisplay('0'); setResetNext(false); }
    else if (val === 'DEL') { setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0'); }
    else if (val === '=') { try { setDisplay(String(eval(display.replace('x', '*')))); setResetNext(true); } catch { setDisplay('Error'); setResetNext(true); } } 
    else { if (display === '0' || display === 'Error' || resetNext) { setDisplay(val); setResetNext(false); } else { setDisplay(display + val); } }
  };
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" onMouseMove={handleMouseMove} onMouseUp={() => setIsDragging(false)} onMouseLeave={() => setIsDragging(false)}>
      <div ref={modalRef} className="absolute bg-[#111827] rounded-2xl shadow-2xl w-[300px] border border-slate-600 overflow-hidden pointer-events-auto flex flex-col" style={{ left: position.x, top: position.y }}>
        <div className="bg-[#1f2937] p-3 flex justify-between items-center cursor-move select-none border-b border-slate-700" onMouseDown={handleMouseDown}><div className="flex items-center gap-2 text-white/90"><Move size={14}/><span className="font-bold text-xs tracking-wider">CALCULADORA</span></div><button onClick={onClose} className="text-white/50 hover:text-red-400"><X size={18}/></button></div>
        <div className="p-4 bg-[#111827]"><div className="bg-[#374151] rounded-lg p-4 mb-1 text-right text-4xl font-mono text-white shadow-inner h-24 flex items-center justify-end overflow-hidden break-all">{display}</div></div>
        <div className="p-4 pt-0 grid grid-cols-4 gap-2 bg-[#111827]">
          {['C', '/', '*', 'DEL'].map(btn => (<button key={btn} onClick={() => handlePress(btn)} className={`h-14 rounded-lg font-bold text-lg active:scale-95 ${btn === 'C' || btn === 'DEL' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>{btn === 'DEL' ? <X size={20} className="mx-auto"/> : btn}</button>))}
          {['7', '8', '9', '-'].map(btn => (<button key={btn} onClick={() => handlePress(btn)} className={`h-14 rounded-lg font-bold text-lg active:scale-95 ${btn === '-' ? 'bg-blue-600 text-white' : 'bg-[#374151] text-white hover:bg-[#4b5563]'}`}>{btn}</button>))}
          {['4', '5', '6', '+'].map(btn => (<button key={btn} onClick={() => handlePress(btn)} className={`h-14 rounded-lg font-bold text-lg active:scale-95 ${btn === '+' ? 'bg-blue-600 text-white' : 'bg-[#374151] text-white hover:bg-[#4b5563]'}`}>{btn}</button>))}
           {['1', '2', '3', '='].map(btn => (<button key={btn} onClick={() => handlePress(btn)} className={`h-14 rounded-lg font-bold text-lg active:scale-95 ${btn === '=' ? 'bg-blue-600 text-white row-span-2 h-full' : 'bg-[#374151] text-white hover:bg-[#4b5563]'}`} style={btn === '=' ? { gridRow: 'span 2' } : {}}>{btn}</button>))}
          {['0', '.'].map(btn => (<button key={btn} onClick={() => handlePress(btn)} className={`h-14 rounded-lg font-bold text-lg active:scale-95 ${btn === '0' ? 'col-span-2' : ''} bg-[#374151] text-white hover:bg-[#4b5563]`}>{btn}</button>))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. COMPONENTE: MODAL SIMPLE DE ZOOM
// ==========================================
const ImageZoomModal: React.FC<{ isOpen: boolean; onClose: () => void; imageUrl: string | null; productName: string; isWeighable?: boolean }> = ({ isOpen, onClose, imageUrl, productName, isWeighable }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[90] p-4 animate-in fade-in duration-200" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors z-10"><X size={24} /></button>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold text-lg z-10">{productName}</div>
      <div className="max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center p-8 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {imageUrl ? (<img src={imageUrl} alt={productName} className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-2xl" />) : isWeighable ? (<div className="bg-white/10 backdrop-blur-md rounded-3xl p-16"><Scale size={200} className="text-white/60" /></div>) : (<div className="bg-white/10 backdrop-blur-md rounded-3xl p-16 text-white text-9xl font-bold">{productName.charAt(0)}</div>)}
      </div>
    </div>
  );
};

// ==========================================
// 6. COMPONENTE PRINCIPAL: POS TERMINAL
// ==========================================
interface PosTerminalProps { setView: (view: ViewState) => void; }

export const PosTerminal: React.FC<PosTerminalProps> = ({ setView }) => {
  const { products, processSale, pendingSaleToLoad, setSaleToLoad, parkSale, taxes, deletePendingSale, currentUser, sales } = useDatabase();
  
  // ESTADOS DE DATOS
  const [cart, setCart] = useState<CartItem[]>(() => { const saved = localStorage.getItem('pos_autosave_cart'); return saved ? JSON.parse(saved) : []; });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  
  // ESTADO PARA GUARDAR MOVIMIENTOS DE CAJA
  const [cashMovements, setCashMovements] = useState<{type: 'ENTRY'|'EXIT', amount: number, reason: string}[]>(() => {
      const saved = localStorage.getItem('pos_cash_movements');
      return saved ? JSON.parse(saved) : [];
  });

  // ESTADO DE NAVEGACIÓN INTERNA
  const [currentScreen, setCurrentScreen] = useState<'POS' | 'PENDING' | 'RETURNS'>('POS');

  // UI
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // MODALES
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [qtyModalOpen, setQtyModalOpen] = useState(false);
  const [selectedProductForQty, setSelectedProductForQty] = useState<Product | null>(null);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [selectedProductForWeight, setSelectedProductForWeight] = useState<Product | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
  
  // GESTOR DE TURNOS
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftModalTab, setShiftModalTab] = useState<'ENTRY' | 'EXIT' | 'CUT_X' | 'CUT_Z' | 'GENERAL'>('GENERAL');
  const [pendingShiftTab, setPendingShiftTab] = useState<'CUT_X' | 'CUT_Z' | null>(null);

  // LIQUIDACION
  const [consignmentSaleToSettle, setConsignmentSaleToSettle] = useState<PendingSale | null>(null);

  // ZOOM
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomProductName, setZoomProductName] = useState('');
  const [zoomIsWeighable, setZoomIsWeighable] = useState(false);

  // SEGURIDAD
  const [showAuth, setShowAuth] = useState(false);
  const [authAction, setAuthAction] = useState<'DELETE_ITEM' | 'CLEAR_CART' | 'SHIFT_ACCESS' | null>(null);
  const [itemToDeleteIndex, setItemToDeleteIndex] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastChange, setLastChange] = useState<number | null>(null);
  const [restoredSession, setRestoredSession] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const endOfListRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem('pos_autosave_cart', JSON.stringify(cart)); endOfListRef.current?.scrollIntoView({ behavior: "smooth" }); }, [cart]);
  useEffect(() => { if (cart.length > 0 && !pendingSaleToLoad) { setRestoredSession(true); setTimeout(() => setRestoredSession(false), 5000); } }, []); 
  useEffect(() => { if (pendingSaleToLoad) { setCart(pendingSaleToLoad.items); setSaleToLoad(null); } }, [pendingSaleToLoad, setSaleToLoad]);

  const handleRegisterMovement = (type: 'ENTRY' | 'EXIT', amount: number, reason: string) => {
      setCashMovements(prev => {
          const updated = [...prev, { type, amount, reason }];
          localStorage.setItem('pos_cash_movements', JSON.stringify(updated));
          return updated;
      });
  };

  // --- NAVEGACION Y MODALES ---
  const openShiftModal = (tab: 'ENTRY' | 'EXIT' | 'CUT_X' | 'CUT_Z') => {
      if (tab === 'CUT_X' || tab === 'CUT_Z') {
          setPendingShiftTab(tab);
          setAuthAction('SHIFT_ACCESS');
          setShowAuth(true);
      } else {
          setShiftModalTab(tab);
          setIsShiftModalOpen(true);
      }
  };

  const handleAuthSuccess = () => { 
      setShowAuth(false); 
      if (authAction === 'DELETE_ITEM' && itemToDeleteIndex !== null) { 
          setCart(prev => prev.filter((_, i) => i !== itemToDeleteIndex)); setItemToDeleteIndex(null); 
      } else if (authAction === 'CLEAR_CART') { 
          setCart([]); localStorage.removeItem('pos_autosave_cart'); setSelectedClient(null); 
      } else if (authAction === 'SHIFT_ACCESS' && pendingShiftTab) {
          setShiftModalTab(pendingShiftTab);
          setIsShiftModalOpen(true);
          setPendingShiftTab(null);
      }
      setAuthAction(null); 
  };

  // --- LOGICA DE PENDIENTES ---
  const handleLoadPendingSale = async (sale: PendingSale) => {
    if (cart.length > 0 && !confirm("¿Reemplazar carrito actual? Los items actuales se perderán.")) return;
    setCart(sale.items);
    if(sale.id) await deletePendingSale(sale.id);
    setCurrentScreen('POS');
  };
  const handleDeletePendingSale = async (id: string) => { if(confirm("¿Eliminar permanentemente?")) { await deletePendingSale(id); } };
  const handleStartSettle = (sale: PendingSale) => setConsignmentSaleToSettle(sale);
  const handleFinishSettleConsignment = async (finalItems: any[]) => { if (consignmentSaleToSettle?.id) await deletePendingSale(consignmentSaleToSettle.id); setCart(finalItems); setConsignmentSaleToSettle(null); setCurrentScreen('POS'); };

  // --- TICKET & VENTA ---
  const handleReprintLastTicket = () => { if (!sales || sales.length === 0) return alert("Sin historial."); const last = sales[0]; const rc = last.items.map((i: any) => ({ ...i, isWeighable: i.quantity % 1 !== 0 })); printElement(<TicketTemplate cart={rc} total={last.total} subtotal={last.total/1.16} savings={0} amountTendered={last.amountTendered||0} change={last.change||0} ticketId={last.id?.slice(0,8)||'--'} customerName={last.customerName} isReprint={true}/>); };
  const initiatePayment = (method: 'cash' | 'card') => { setPaymentMethod(method); setIsPaymentOpen(true); };
  const initiateCredit = () => { if (!selectedClient) setIsClientSearchOpen(true); else setIsCreditModalOpen(true); };
  const handleSelectClient = (client: any) => { setSelectedClient(client); setIsClientSearchOpen(false); };

  // --- TECLADO ---
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
        if (isPaymentOpen || isCreditModalOpen || qtyModalOpen || isWeightModalOpen || showAuth || isShiftModalOpen || isClientSearchOpen || zoomOpen || consignmentSaleToSettle) return; 

        if (e.key === 'F2') { e.preventDefault(); setCurrentScreen('PENDING'); return; }
        if (e.key === 'F3') { e.preventDefault(); setCurrentScreen('RETURNS'); return; }
        if (e.key === 'F4') { e.preventDefault(); handleReprintLastTicket(); return; }
        if (e.key === 'F5') { e.preventDefault(); setIsCalculatorOpen(p => !p); return; }
        
        if (e.key === 'F6') { e.preventDefault(); openShiftModal('ENTRY'); return; }
        if (e.key === 'F7') { e.preventDefault(); openShiftModal('EXIT'); return; }
        if (e.key === 'F8') { e.preventDefault(); openShiftModal('CUT_X'); return; }
        if (e.key === 'F9') { e.preventDefault(); openShiftModal('CUT_Z'); return; }

        if (cart.length > 0 && currentScreen === 'POS') {
            if (e.key === '+' || e.code === 'NumpadAdd') { e.preventDefault(); updateQuantity(cart.length - 1, 1); return; }
            if (e.key === '-' || e.code === 'NumpadSubtract') { e.preventDefault(); updateQuantity(cart.length - 1, -1); return; }
            if (e.key === 'F10') { e.preventDefault(); initiatePayment('cash'); return; }
            if (e.key === 'F11') { e.preventDefault(); initiatePayment('card'); return; }
            if (e.key === 'F12') { e.preventDefault(); initiateCredit(); return; }
        }
    };
    window.addEventListener('keydown', handleKeyDownGlobal, true);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal, true);
  }, [cart, isPaymentOpen, isCreditModalOpen, qtyModalOpen, isWeightModalOpen, showAuth, isShiftModalOpen, isClientSearchOpen, zoomOpen, consignmentSaleToSettle, currentScreen]);

  // --- LOGICA CARRITO ---
  const handleProductClick = (product: Product) => { if (product.isWeighable) { setSelectedProductForWeight(product); setIsWeightModalOpen(true); return; } if ((product.packPrice && product.packQuantity) || (product.presentations && product.presentations.length > 0)) { setSelectedProductForQty(product); setQtyModalOpen(true); } else { addToCart(product, 1, null, false); } };
  const handleWeightConfirm = (weight: number) => { if (selectedProductForWeight) { addToCart(selectedProductForWeight, weight, null, false, true); setIsWeightModalOpen(false); setSelectedProductForWeight(null); } };
  const addToCart = (product: Product, qty: number, presentation: any | null, isLegacyPack: boolean = false, isFractional: boolean = false) => {
    setCart(prev => {
      const variantId = presentation ? presentation.id : (isLegacyPack ? 'legacy_pack' : (isFractional ? 'loose_unit' : 'unit'));
      const existingIdx = prev.findIndex(item => { const itemVariantId = item.selectedPresentation ? item.selectedPresentation.id : (item.isPackSale ? 'legacy_pack' : (item.name.includes('(Suelto)') ? 'loose_unit' : 'unit')); return item.id === product.id && itemVariantId === variantId; });
      let finalPrice = product.price; let finalName = product.name; let packContent = 1;
      if (presentation) { finalPrice = presentation.price; finalName = `${product.name} (${presentation.name})`; packContent = presentation.quantity; } else if (isLegacyPack) { finalPrice = product.packPrice || 0; finalName = `CAJA: ${product.name}`; packContent = product.packQuantity || 1; } else if (isFractional) { finalPrice = product.contentPerUnit > 1 ? product.contentUnitPrice || 0 : product.price; finalName = product.contentPerUnit > 1 ? `${product.name} (Suelto)` : `${product.name} (${qty.toFixed(3)}kg)`; }
      if (existingIdx >= 0) return prev.map((item, index) => index === existingIdx ? { ...item, quantity: item.quantity + qty } : item);
      return [...prev, { ...product, name: finalName, price: finalPrice, quantity: qty, isPackSale: isLegacyPack, selectedPresentation: presentation || undefined, packQuantity: packContent, groupId: (isLegacyPack || presentation || isFractional) ? undefined : product.groupId, taxIds: product.taxIds || [] }];
    });
    setSearchTerm(''); setTimeout(() => searchInputRef.current?.focus(), 10);
  };
  const updateQuantity = (index: number, delta: number) => { setCart(prev => { const newQty = prev[index].quantity + delta; if (newQty <= 0) { setTimeout(() => requestRemoveItem(index), 0); return prev; } return prev.map((item, i) => i === index ? { ...item, quantity: newQty } : item); }); };
  const requestRemoveItem = (index: number) => { setItemToDeleteIndex(index); setAuthAction('DELETE_ITEM'); setShowAuth(true); };
  const requestClearCart = () => { setAuthAction('CLEAR_CART'); setShowAuth(true); };
  
  // --- TOTALES ---
  const calculateTotals = (items: CartItem[]) => {
    let subtotal = 0; let totalTaxAmount = 0; let savings = 0; const taxBreakdown: Record<string, number> = {}; const groupCounts: Record<string, number> = {};
    items.forEach(item => { if (item.groupId && !item.isPackSale && !item.selectedPresentation) groupCounts[item.groupId] = (groupCounts[item.groupId] || 0) + item.quantity; });
    const itemsWithPrice = items.map(item => {
        let finalPrice = item.price; let isWholesaleApplied = false;
        if (item.groupId && !item.isPackSale && !item.selectedPresentation && item.wholesaleMin && item.wholesalePrice && groupCounts[item.groupId] >= item.wholesaleMin) { finalPrice = item.wholesalePrice; isWholesaleApplied = true; savings += (item.price - item.wholesalePrice) * item.quantity; }
        const lineTotal = finalPrice * item.quantity; let totalRates = 0; item.taxIds?.forEach(id => { const t = taxes.find(tx => tx.id === id); if(t) totalRates += t.rate; });
        const basePrice = lineTotal / (1 + (totalRates / 100)); subtotal += basePrice;
        item.taxIds?.forEach(id => { const t = taxes.find(tx => tx.id === id); if(t) { const taxAmt = basePrice * (t.rate / 100); totalTaxAmount += taxAmt; taxBreakdown[t.name] = (taxBreakdown[t.name] || 0) + taxAmt; } });
        return { ...item, finalPrice, isWholesaleApplied };
    });
    const promoOpportunities: any[] = []; 
    return { subtotal, tax: totalTaxAmount, taxBreakdown, total: subtotal + totalTaxAmount, savings, itemsWithPrice, promoOpportunities };
  };
  const { subtotal, total, savings, itemsWithPrice, promoOpportunities, taxBreakdown } = calculateTotals(cart);

  // --- FINALIZAR ---
  const handleScanOrSearch = () => {
    const term = searchTerm.trim(); if (!term) return;
    let found = products.find(p => p.barcode === term || p.sku === term || p.shortCode === term);
    if (found) { handleProductClick(found); setSearchTerm(''); return; }
    const legacyPackFound = products.find(p => p.packBarcode === term);
    if (legacyPackFound) { addToCart(legacyPackFound, 1, null, true); setSearchTerm(''); return; }
    for (const prod of products) { if (prod.presentations?.find(p => p.barcode === term)) { addToCart(prod, 1, prod.presentations.find(p => p.barcode === term), false); setSearchTerm(''); return; } }
  };
  const handleFinishSale = async (amountTendered?: number, change?: number, refCode?: string) => {
    const TicketComponent = <TicketTemplate cart={itemsWithPrice} total={total} savings={savings} subtotal={subtotal} amountTendered={amountTendered || total} change={change || 0} ticketId={`V-${Date.now().toString().slice(-6)}`} customerName={selectedClient?.name || "Cliente Mostrador"} />;
    await processSale(cart, total, paymentMethod, selectedClient?.name || 'Cliente Mostrador', { amountTendered, change, cardAuthCode: refCode });
    setIsPaymentOpen(false); setLastChange(change || 0); setShowSuccess(true); printElement(TicketComponent); setCart([]); setSelectedClient(null); localStorage.removeItem('pos_autosave_cart'); setTimeout(() => { setShowSuccess(false); setLastChange(null); }, 3000);
  };
  const handleFinishCreditSale = async () => { if (!selectedClient) return; await processSale(cart, total, 'credit', selectedClient.name, { amountTendered: 0, change: 0, cardAuthCode: '' }); setIsCreditModalOpen(false); setShowSuccess(true); printElement(<TicketTemplate cart={itemsWithPrice} total={total} savings={savings} subtotal={subtotal} amountTendered={0} change={0} ticketId={`CRED-${Date.now().toString().slice(-6)}`} customerName={selectedClient.name} />); setCart([]); setSelectedClient(null); localStorage.removeItem('pos_autosave_cart'); setTimeout(() => setShowSuccess(false), 3000); };
  
  // LOGICA PAUSAR / EVENTO (CORREGIDA CON NOMBRE FORZADO)
  const handleParkSale = async () => { 
      if (cart.length === 0) return; 
      
      if (total < 0) { 
          await parkSale(cart, total, selectedClient ? selectedClient.name : 'Devolución', 'RETURN'); 
          alert("Devolución Guardada"); setCart([]); localStorage.removeItem('pos_autosave_cart'); setSelectedClient(null); 
          return; 
      } 
      
      // Intentar obtener el nombre del cliente de cualquier propiedad posible
      const clientName = selectedClient ? (selectedClient.name || selectedClient.business_name || selectedClient.full_name || selectedClient.nombre || selectedClient.razon_social) : null;

      if (selectedClient) {
          if (confirm(`¿Desea registrar esta venta como CONSUMO para el evento de ${clientName}?`)) {
               // Asegurar que se guarde un string válido
               await parkSale(cart, total, clientName || 'Cliente Evento', 'CONSIGNMENT', 'Venta a Consumo');
               alert("Guardado en Eventos / Consumo"); setCart([]); localStorage.removeItem('pos_autosave_cart'); setSelectedClient(null); return;
          }
      }
      const name = clientName || prompt("Nombre para identificar venta:"); 
      if (name) { await parkSale(cart, total, name, 'GENERAL'); alert("Venta Pausada"); setCart([]); localStorage.removeItem('pos_autosave_cart'); setSelectedClient(null); } 
  };

  // --- RENDERIZADO CONDICIONAL DE PANTALLAS ---
  if (currentScreen === 'PENDING') {
      return <PendingSalesScreen onBack={() => setCurrentScreen('POS')} onLoadSale={handleLoadPendingSale} onSettleSale={handleStartSettle} onDeleteSale={handleDeletePendingSale} />;
  }

  if (currentScreen === 'RETURNS') {
      return <ReturnsScreen onBack={() => setCurrentScreen('POS')} />;
  }

  // --- RENDERIZADO PRINCIPAL (POS) ---
  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-slate-100 overflow-hidden relative">
      <div className={`flex-1 flex p-2 gap-2 overflow-hidden relative z-0 transition-all duration-300 ${showBottomBar ? 'pb-24' : 'pb-2'}`}>
        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
          <div className="bg-white p-3 rounded-xl shadow-sm flex gap-2 items-center shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input ref={searchInputRef} type="text" placeholder="Buscar, escanear, PLU..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleScanOrSearch()} autoFocus />
            </div>
            <select className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}><option value="TODOS">Todas</option><option value="Abarrotes">Abarrotes</option><option value="Electrónica">Electrónica</option><option value="Ropa">Ropa</option></select>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {(products || []).filter(p => { const term = searchTerm.toLowerCase(); const matches = p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term) || (p.barcode && p.barcode.includes(term)); return matches && (selectedCategory === 'TODOS' || p.category === selectedCategory); }).map((product) => (
                <div key={product.id} onClick={() => handleProductClick(product)} className="bg-white p-2 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-start text-left group border border-transparent hover:border-indigo-500 relative cursor-pointer">
                  {(product.image || product.isWeighable) && (<div role="button" onClick={(e) => { e.stopPropagation(); setZoomImage(product.image || null); setZoomProductName(product.name); setZoomIsWeighable(product.isWeighable || false); setZoomOpen(true); }} className="absolute top-1 left-1 z-10 bg-white/90 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 p-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"><ZoomIn size={16} /></div>)}
                  {(product.packPrice || (product.presentations && product.presentations.length > 0)) && (<div onClick={(e) => { e.stopPropagation(); setSelectedProductForQty(product); setQtyModalOpen(true); }} className="absolute top-1 right-1 z-10 bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 p-1 rounded-lg cursor-pointer"><MoreHorizontal size={14} /></div>)}
                  
                  {/* Etiqueta Oferta (MAYOREO) */}
                  {(product.wholesalePrice > 0 && (!product.packPrice || product.packPrice === 0)) && (
                    <div className="absolute top-0 right-0 z-20 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg shadow-sm flex items-center gap-1">
                        <Tag size={10} /> Oferta
                    </div>
                  )}

                  <div className="w-full h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg mb-1 flex items-center justify-center pointer-events-none overflow-hidden border border-slate-200 relative">
                    {product.image ? (<img src={product.image} alt={product.name} className="max-w-full max-h-full w-auto h-auto object-contain" />) : product.isWeighable ? (<div className="flex flex-col items-center"><Scale size={24} className="text-orange-400"/><span className="text-xs text-orange-500 mt-1">PESABLE</span></div>) : (<div className="flex flex-col items-center"><Box size={28} className="text-slate-400" /><span className="text-xs text-slate-500 mt-1">SIN IMAGEN</span></div>)}
                    {product.isWeighable && (<div className="absolute bottom-0 right-0 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl-lg">KG</div>)}
                  </div>
                  <h3 className="font-bold text-slate-700 line-clamp-2 text-sm h-9 w-full pointer-events-none leading-tight">{product.name}</h3>
                  {product.wholesalePrice > 0 && product.wholesaleMin ? (<div className="w-full mt-1 mb-1 bg-indigo-50 border border-indigo-100 rounded px-2 py-1 text-xs text-indigo-700 flex flex-col gap-0.5 pointer-events-none"><div className="flex justify-between items-center"><span className="font-bold">Mayoreo: ${product.wholesalePrice}</span><span className="font-medium">A partir de: {product.wholesaleMin}</span></div></div>) : (<div className="w-full mt-1 mb-1 h-[20px]"></div>)}
                  <div className="w-full flex justify-between items-center mt-auto border-t border-slate-100 pt-1 pointer-events-none"><span className="font-bold text-base text-indigo-600">${product.price.toFixed(2)}</span><span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'}`}>{product.stock > 0 ? <>Stock: <span className="font-bold">{product.stock}</span></> : <span className="font-bold text-red-700">AGOTADO</span>}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-[420px] bg-white rounded-xl shadow-2xl flex flex-col border-l border-slate-200 h-full shrink-0 z-10 overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
            <div><h2 className="font-bold text-lg text-slate-800">Ticket de Venta</h2><div className="flex items-center gap-1 mt-1"><button onClick={() => setIsClientSearchOpen(true)} className={`text-xs font-bold px-2 py-1 rounded border flex items-center gap-1 transition-colors ${selectedClient ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-slate-400 border-slate-200 hover:border-blue-400 hover:text-blue-500'}`}><User size={14}/> {selectedClient ? selectedClient.name : 'Cliente General'}</button><button className="text-slate-400 hover:text-indigo-500 p-1" title="Reimprimir Último"><Printer size={16}/></button><button onClick={handleParkSale} className="text-slate-400 hover:text-blue-500 p-1" title="Pausar Venta"><Box size={16}/></button></div></div>
            <button onClick={requestClearCart} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition-colors" title="Vaciar Carrito"><Trash2 size={20}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50 min-h-0">
            {itemsWithPrice.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-slate-300 select-none"><PackageX size={64}/><p className="mt-4 font-medium">Carrito vacío</p></div>) : (itemsWithPrice.map((item, idx) => (<div key={`${item.id}-${idx}`} className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-200"><div className="flex justify-between items-start mb-1"><p className="font-bold text-sm text-slate-800 leading-tight flex-1">{item.name}</p><button onClick={() => requestRemoveItem(idx)} className="text-slate-300 hover:text-red-500 ml-2 p-0.5 hover:bg-red-50 rounded transition-colors"><Trash2 size={14}/></button></div><div className="flex justify-between items-center"><div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200"><button onClick={() => updateQuantity(idx, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-red-500 hover:bg-red-50"><Minus size={14}/></button><span className="text-base font-bold text-slate-700 w-10 text-center">{item.isWeighable && typeof item.quantity === 'number' && !Number.isInteger(item.quantity) ? item.quantity.toFixed(3) : item.quantity}</span><button onClick={() => updateQuantity(idx, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-green-600 hover:bg-green-50"><Plus size={14}/></button></div><div className="text-right"><p className="text-lg font-bold text-indigo-900">${(item.finalPrice * item.quantity).toFixed(2)}</p><div className="flex flex-wrap justify-end gap-1">{item.isPackSale && <span className="bg-blue-100 text-blue-700 px-1 rounded text-[9px] font-bold border border-blue-200">Caja</span>}{item.isWholesaleApplied && <span className="bg-green-100 text-green-700 px-1 rounded text-[9px] font-bold border border-green-200">Mayoreo</span>}</div></div></div></div>)))}<div ref={endOfListRef}></div>
          </div>
          <div className="p-3 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 shrink-0">
            {promoOpportunities.length > 0 && (<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3"><div className="flex items-center gap-2 text-yellow-700 mb-1"><Zap size={16} /><span className="font-bold text-sm">¡Oportunidad de Ahorro!</span></div><div className="text-xs text-yellow-600 space-y-1">{promoOpportunities.map((opp, idx) => (<div key={idx}>Agrega {opp.missing} producto(s) más para activar precio mayoreo: ${opp.newPrice.toFixed(2)}</div>))}</div></div>)}
            <div className="space-y-2"><div className="flex justify-between text-slate-600"><span>Subtotal:</span><span className="font-bold">${subtotal.toFixed(2)}</span></div>{Object.entries(taxBreakdown).map(([label, amount]) => (<div key={label} className="flex justify-between text-slate-600"><span>{label}:</span><span className="font-bold">${amount.toFixed(2)}</span></div>))}{savings > 0 && (<div className="flex justify-between text-green-600 bg-green-50 p-1.5 rounded"><span>Ahorro por mayoreo:</span><span className="font-bold">-${savings.toFixed(2)}</span></div>)}<div className="flex justify-between text-lg font-bold text-slate-800 border-t border-slate-200 pt-2"><span>TOTAL:</span><span>${total.toFixed(2)}</span></div></div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button onClick={() => initiatePayment('cash')} disabled={cart.length === 0} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex flex-col items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all relative group"><div className="absolute top-1 right-1 bg-green-800/40 border border-white/20 text-white text-[10px] px-1.5 rounded font-bold">F10</div><Banknote size={20} /><span className="text-xs mt-1">EFECTIVO</span></button>
              <button onClick={() => initiatePayment('card')} disabled={cart.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex flex-col items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all relative group"><div className="absolute top-1 right-1 bg-blue-800/40 border border-white/20 text-white text-[10px] px-1.5 rounded font-bold">F11</div><CreditCard size={20} /><span className="text-xs mt-1">TARJETA</span></button>
              <button onClick={initiateCredit} disabled={cart.length === 0} className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold flex flex-col items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all relative group"><div className="absolute top-1 right-1 bg-purple-800/40 border border-white/20 text-white text-[10px] px-1.5 rounded font-bold">F12</div><Wallet size={20} /><span className="text-xs mt-1">CRÉDITO</span></button>
            </div>
          </div>
        </div>
      </div>
      <div className={`fixed bottom-0 left-0 right-0 bg-slate-800 p-2 shadow-lg transition-transform duration-300 z-40 ${showBottomBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <button onClick={() => setShowBottomBar(!showBottomBar)} className="absolute -top-6 left-4 bg-slate-800 text-white px-4 py-1 rounded-t-lg shadow-lg flex items-center justify-center hover:bg-slate-700 border-t border-x border-slate-700/50">{showBottomBar ? <ChevronDown size={20}/> : <ChevronUp size={20}/>}</button>
        <div className="flex items-center gap-3 justify-between max-w-full overflow-x-auto px-2">
            <div className="flex gap-2 shrink-0">
                <button onClick={() => setCurrentScreen('PENDING')} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded font-bold text-sm flex flex-col items-center leading-none min-w-[100px] shadow border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 transition-all"><span className="text-[10px] opacity-80 mb-0.5">F2</span><span>Pendientes</span></button>
                <button onClick={() => setCurrentScreen('RETURNS')} className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded font-bold text-sm flex flex-col items-center leading-none min-w-[100px] shadow border-b-4 border-pink-800 active:border-b-0 active:translate-y-1 transition-all"><span className="text-[10px] opacity-80 mb-0.5">F3</span><span>Devolución</span></button>
                <button onClick={handleReprintLastTicket} className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded font-bold text-sm flex flex-col items-center leading-none min-w-[100px] shadow border-b-4 border-teal-800 active:border-b-0 active:translate-y-1 transition-all"><span className="text-[10px] opacity-80 mb-0.5">F4</span><span>Reimp. Ticket</span></button>
                <button onClick={() => setIsCalculatorOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-sm flex flex-col items-center leading-none min-w-[100px] shadow border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"><span className="text-[10px] opacity-80 mb-0.5">F5</span><span>Calculadora</span></button>
            </div>
            <div className="w-px h-8 bg-slate-600 mx-2"></div>
            <div className="flex gap-2 shrink-0">
                <button onClick={() => openShiftModal('ENTRY')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold text-sm flex flex-col items-center leading-none min-w-[90px] shadow border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all"><span className="text-[10px] opacity-80 mb-0.5">F6</span><span>Entrada $</span></button>
                <button onClick={() => openShiftModal('EXIT')} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold text-sm flex flex-col items-center leading-none min-w-[90px] shadow border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all"><span className="text-[10px] opacity-80 mb-0.5">F7</span><span>Salida $</span></button>
                <button onClick={() => openShiftModal('CUT_X')} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-bold text-sm flex flex-col items-center leading-none min-w-[90px] shadow border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 transition-all"><span className="text-[10px] opacity-80 mb-0.5">F8</span><span>Corte X</span></button>
                <button onClick={() => openShiftModal('CUT_Z')} className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded font-bold text-sm flex flex-col items-center leading-none min-w-[90px] shadow border-b-4 border-red-950 active:border-b-0 active:translate-y-1 transition-all"><span className="text-[10px] opacity-80 mb-0.5">F9</span><span>Corte Z</span></button>
            </div>
        </div>
      </div>

      <QuantityModal isOpen={qtyModalOpen} onClose={() => setQtyModalOpen(false)} product={selectedProductForQty} onAddToCart={addToCart} />
      <WeightModal isOpen={isWeightModalOpen} onClose={() => setIsWeightModalOpen(false)} product={selectedProductForWeight} onConfirm={handleWeightConfirm} />
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} total={total} onFinishSale={handleFinishSale} paymentMethod={paymentMethod} />
      <CreditSaleModal isOpen={isCreditModalOpen} onClose={() => setIsCreditModalOpen(false)} onConfirm={handleFinishCreditSale} total={total} clientName={selectedClient?.name || selectedClient?.full_name || selectedClient?.business_name || ''} currentBalance={selectedClient?.currentBalance || 0} creditLimit={selectedClient?.creditLimit || 0} />
      <ClientSearchModal isOpen={isClientSearchOpen} onClose={() => setIsClientSearchOpen(false)} onSelectClient={handleSelectClient} />
      <AdminAuthModal isOpen={showAuth} onClose={() => { setShowAuth(false); setAuthAction(null); setItemToDeleteIndex(null); }} onSuccess={handleAuthSuccess} title={authAction === 'DELETE_ITEM' ? 'Eliminar Producto' : (authAction === 'SHIFT_ACCESS' ? 'Autorizar Corte' : 'Vaciar Carrito')} message={authAction === 'DELETE_ITEM' ? 'Se requiere autorización para eliminar producto del carrito' : (authAction === 'SHIFT_ACCESS' ? 'Se requiere autorización de supervisor para realizar el corte' : 'Se requiere autorización para vaciar todo el carrito')} />
      <ShiftOperationsModal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} initialTab={shiftModalTab} cashierName={currentUser?.fullName || 'ADMIN'} onRegisterMovement={handleRegisterMovement} movements={cashMovements} />
      <ImageZoomModal isOpen={zoomOpen} onClose={() => setZoomOpen(false)} imageUrl={zoomImage} productName={zoomProductName} isWeighable={zoomIsWeighable} />
      <DraggableCalculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
      {consignmentSaleToSettle && <ConsignmentModal isOpen={!!consignmentSaleToSettle} onClose={() => setConsignmentSaleToSettle(null)} originalItems={consignmentSaleToSettle.items} customerName={consignmentSaleToSettle.customerName || ''} creatorName={(consignmentSaleToSettle as any).created_by || 'Sistema'} liquidatorName={currentUser?.fullName || 'Cajero Actual'} onSettle={handleFinishSettleConsignment} />}
      {showSuccess && (<div className="fixed bottom-20 right-4 bg-green-500 text-white p-4 rounded-lg shadow-xl animate-in slide-in-from-bottom-4 duration-200 z-50"><div className="flex items-center gap-3"><div className="bg-white/20 p-2 rounded-full"><Banknote size={24} /></div><div><p className="font-bold">¡Venta Completada!</p>{lastChange !== null && lastChange > 0 && (<p className="text-sm">Cambio: ${lastChange.toFixed(2)}</p>)}</div></div></div>)}
      {restoredSession && (<div className="fixed bottom-20 left-4 bg-blue-500 text-white p-4 rounded-lg shadow-xl animate-in slide-in-from-left-4 duration-200 z-50"><div className="flex items-center gap-3"><AlertCircle size={24} /><div><p className="font-bold">Sesión Restaurada</p><p className="text-sm">Carrito recuperado</p></div></div></div>)}
    </div>
  );
};