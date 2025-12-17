import React, { useState, useMemo } from 'react';
import { 
  User, Search, DollarSign, CheckCircle, 
  AlertCircle, Clock, Printer, X, Eye 
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ViewState, Sale, Client } from '../types';
import { printElement } from '../utils/printHelper';
import { CreditPaymentTicket, DebtItem } from '../components/CreditPaymentTicket';
import { TicketHistoryModal } from '../components/TicketHistoryModal';

interface AccountsReceivableProps {
  setView: (view: ViewState) => void;
}

export const AccountsReceivable: React.FC<AccountsReceivableProps> = ({ setView }) => {
  const { clients, sales, registerClientPayment } = useDatabase();
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [historyTicket, setHistoryTicket] = useState<Sale | null>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const selectedClient = clients.find(c => c.id === selectedClientId);

  // --- FUNCIÓN HELPER: Calcular deuda real de un cliente ---
  // Esta función se usa tanto para el detalle derecho como para la lista izquierda
  // para garantizar que los números sean IDÉNTICOS.
  const calculateDebt = (clientId: string, clientName: string) => {
    return sales
      .filter(s => 
        (s.clientId === clientId || s.customerName === clientName) &&
        (s.paymentMethod === 'credit' || (s.remainingBalance !== undefined && s.remainingBalance > 0))
      )
      .reduce((sum, s) => {
          const debt = s.remainingBalance !== undefined ? s.remainingBalance : (s.total - (s.amountTendered || 0));
          return sum + Math.max(0, debt);
      }, 0);
  };

  // 2. Calcular Datos del Cliente Seleccionado
  const clientData = useMemo(() => {
    if (!selectedClient) return null;

    const totalDebt = calculateDebt(selectedClient.id, selectedClient.name);
    const creditLimit = selectedClient.creditLimit || 0;
    const available = Math.max(0, creditLimit - totalDebt);

    // Obtener las ventas para la tabla
    const clientSales = sales
      .filter(s => 
        (s.clientId === selectedClient.id || s.customerName === selectedClient.name) &&
        (s.paymentMethod === 'credit' || (s.remainingBalance !== undefined && s.remainingBalance > 0))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { sales: clientSales, totalDebt, creditLimit, available };
  }, [sales, selectedClient]); // Se recalcula si cambian las ventas

  // --- PROCESAR PAGO ---
  const handlePayment = async () => {
    if (!selectedClient || !clientData) return;
    const amount = parseFloat(paymentAmount);

    if (!amount || amount <= 0) return alert("Monto inválido");
    if (amount > clientData.totalDebt + 0.5) return alert("No puedes abonar más de la deuda total");

    setIsProcessing(true);

    const result = await registerClientPayment(selectedClient.id, amount, "Abono en Caja");

    if (result && result.success) {
        const affectedTickets: DebtItem[] = result.details.map(d => ({
            ticketId: d.ticketId,
            originalDate: new Date().toISOString(),
            totalDebt: d.paidAmount + d.remainingBalance,
            amountPaid: d.paidAmount,
            remaining: d.remainingBalance
        }));

        const TicketComponent = (
            <CreditPaymentTicket 
                paymentId={result.paymentId}
                customerName={result.clientName}
                paymentDate={result.date}
                previousBalance={result.previousBalance}
                amountTendered={result.amountPaid}
                newBalance={result.newBalance}
                affectedTickets={affectedTickets}
            />
        );

        printElement(TicketComponent);
        setShowPaymentModal(false);
        setPaymentAmount('');
    }
    
    setIsProcessing(false);
  };

  const getStatusBadge = (pending: number, total: number) => {
    if (pending <= 0.01) return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Pagado</span>;
    if (pending < total) return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Parcial</span>;
    return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={12}/> Pendiente</span>;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-hidden">
      
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Cuentas por Cobrar</h1>
            <p className="text-slate-500">Gestión de cartera y abonos.</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        
        {/* --- COLUMNA IZQUIERDA: LISTA SINCRONIZADA --- */}
        <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Buscar cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {filteredClients.map(client => {
                    // CÁLCULO EN TIEMPO REAL PARA SINCRONIZACIÓN PERFECTA
                    const realDebt = calculateDebt(client.id, client.name);
                    const limit = client.creditLimit || 0;
                    const available = Math.max(0, limit - realDebt);

                    return (
                        <button
                            key={client.id}
                            onClick={() => setSelectedClientId(client.id)}
                            className={`w-full p-4 border-b border-slate-50 hover:bg-slate-50 transition-all text-left group
                                ${selectedClientId === client.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0">
                                    {client.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold truncate text-sm ${selectedClientId === client.id ? 'text-indigo-900' : 'text-slate-700'}`}>{client.name}</p>
                                    <p className="text-xs text-slate-400">{client.phone || 'S/N'}</p>
                                </div>
                            </div>

                            {/* Resumen Financiero Sincronizado */}
                            <div className="flex justify-between items-center bg-white/60 p-2 rounded-lg gap-2">
                                <div className="text-center flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Saldo</p>
                                    <p className={`text-xs font-bold ${realDebt > 0.01 ? 'text-red-500' : 'text-slate-600'}`}>
                                        ${realDebt.toFixed(2)}
                                    </p>
                                </div>
                                <div className="w-px h-6 bg-slate-200"></div>
                                <div className="text-center flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Límite</p>
                                    <p className="text-xs font-bold text-slate-600">${limit.toFixed(2)}</p>
                                </div>
                                <div className="w-px h-6 bg-slate-200"></div>
                                <div className="text-center flex-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Disp.</p>
                                    <p className="text-xs font-bold text-green-600">${available.toFixed(2)}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* DETALLE (Igual) */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            {selectedClient && clientData ? (
                <>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><User size={24} /></div>
                            <div><h2 className="text-2xl font-bold text-slate-800">{selectedClient.name}</h2><div className="flex items-center gap-2 text-slate-500 text-sm"><span className="text-xs">ID: {selectedClient.id.slice(0,8)}</span></div></div>
                        </div>
                        <button onClick={() => setShowPaymentModal(true)} disabled={clientData.totalDebt <= 0.01} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"><DollarSign size={20}/> Realizar Abono</button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase mb-1">SALDO DEUDOR</p><p className="text-3xl font-bold text-red-500">${clientData.totalDebt.toFixed(2)}</p></div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase mb-1">LÍMITE DE CRÉDITO</p><p className="text-3xl font-bold text-slate-700">${clientData.creditLimit.toFixed(2)}</p></div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase mb-1">DISPONIBLE</p><p className="text-3xl font-bold text-green-600">${clientData.available.toFixed(2)}</p></div>
                    </div>

                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-4 border-b bg-slate-50 font-bold text-xs text-slate-500 uppercase flex">
                            <span className="w-24">FECHA</span><span className="flex-1">TICKET</span><span className="w-24 text-right">TOTAL</span><span className="w-28 text-right">PENDIENTE</span><span className="w-24 text-center">ESTADO</span><span className="w-16 text-center">TRAZA</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {clientData.sales.map(sale => {
                                const pending = sale.remainingBalance !== undefined ? sale.remainingBalance : (sale.total - (sale.amountTendered || 0));
                                return (
                                    <div key={sale.id} className="flex p-4 border-b border-slate-50 hover:bg-slate-50 text-sm items-center transition-colors">
                                        <span className="w-24 text-slate-500">{new Date(sale.date).toLocaleDateString()}</span>
                                        <span className="flex-1 font-mono text-indigo-600 font-bold">#{sale.id.slice(0,8)}</span>
                                        <span className="w-24 text-right text-slate-500">${sale.total.toFixed(2)}</span>
                                        <span className={`w-28 text-right font-bold ${pending > 0.01 ? 'text-red-600' : 'text-slate-300'}`}>${pending.toFixed(2)}</span>
                                        <span className="w-24 flex justify-center">{getStatusBadge(pending, sale.total)}</span>
                                        <div className="w-16 flex justify-center"><button onClick={() => setHistoryTicket(sale)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver historial"><Eye size={18} /></button></div>
                                    </div>
                                );
                            })}
                            {clientData.sales.length === 0 && <div className="p-8 text-center text-slate-400">Sin historial de créditos.</div>}
                        </div>
                    </div>
                </>
            ) : (<div className="flex-1 flex flex-col items-center justify-center text-slate-300"><User size={64} className="mb-4 bg-white p-4 rounded-full shadow-sm border border-slate-100"/><p>Selecciona un cliente</p></div>)}
        </div>
      </div>

      {showPaymentModal && selectedClient && clientData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="bg-indigo-600 p-6 text-white flex justify-between items-start">
                    <div><h3 className="text-xl font-bold">Realizar Abono</h3><p className="text-indigo-200 text-sm">{selectedClient.name}</p></div>
                    <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white"><X size={24}/></button>
                </div>
                <div className="p-6">
                    <div className="mb-6 text-center"><p className="text-xs text-slate-500 uppercase font-bold mb-1">DEUDA TOTAL ACTUAL</p><p className="text-4xl font-bold text-red-500">${clientData.totalDebt.toFixed(2)}</p></div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Monto a Abonar</label>
                    <div className="relative mb-6"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">$</span><input type="number" autoFocus value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePayment()} className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-slate-800 border-2 border-indigo-100 rounded-xl outline-none focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white" placeholder="0.00"/></div>
                    <button onClick={handlePayment} disabled={isProcessing || !paymentAmount} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all flex justify-center items-center gap-2">{isProcessing ? 'Procesando...' : 'Confirmar e Imprimir'}<Printer size={20} /></button>
                </div>
            </div>
        </div>
      )}

      <TicketHistoryModal isOpen={!!historyTicket} onClose={() => setHistoryTicket(null)} sale={historyTicket} />
    </div>
  );
};