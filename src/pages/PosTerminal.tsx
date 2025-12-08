import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Trash2, Plus, Minus, CreditCard, 
  Banknote, RotateCcw, Save, Truck, PackageX,
  AlertCircle, Zap, Scale, Box, Tag, Info, Printer, MoreHorizontal, Lock, Layers, User, UserCheck, Wallet
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Product, CartItem, ViewState, Client } from '../types';

// --- COMPONENTES ---
import { PaymentModal } from '../components/PaymentModal'; 
import { TicketTemplate } from '../components/TicketTemplate';
import { ShiftReportTicket } from '../components/ShiftReportTicket';
import { printElement } from '../utils/printHelper';
import { QuantityModal } from '../components/QuantityModal';
import { CalculatorModal } from '../components/CalculatorModal';
import { CashFlowModal } from '../components/CashFlowModal';
import { KeyboardShortcutsBar } from '../components/KeyboardShortcutsBar';
import { AdminAuthModal } from '../components/AdminAuthModal';
import { ClientSearchModal } from '../components/ClientSearchModal';

interface PosTerminalProps {
  setView: (view: ViewState) => void;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({ setView }) => {
  const { products, processSale, pendingSaleToLoad, setSaleToLoad, parkSale, generateShiftReport } = useDatabase();
  
  // --- ESTADOS ---
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('pos_autosave_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // --- MODALES ---
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');
  const [qtyModalOpen, setQtyModalOpen] = useState(false);
  const [selectedProductForQty, setSelectedProductForQty] = useState<Product | null>(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  
  // Utilidades y Seguridad
  const [calcOpen, setCalcOpen] = useState(false);
  const [cashFlowOpen, setCashFlowOpen] = useState(false);
  const [cashFlowType, setCashFlowType] = useState<'IN'|'OUT'>('IN');
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});
  const [authActionTitle, setAuthActionTitle] = useState('');

  // UI
  const [lastChange, setLastChange] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [restoredSession, setRestoredSession] = useState(false);
  const [lastTicketData, setLastTicketData] = useState<any>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- EFECTOS ---
  useEffect(() => { localStorage.setItem('pos_autosave_cart', JSON.stringify(cart)); }, [cart]);
  
  useEffect(() => { 
    if (cart.length > 0 && !pendingSaleToLoad) { 
        setRestoredSession(true); 
        setTimeout(() => setRestoredSession(false), 5000); 
    } 
  }, []); 

  useEffect(() => { 
    if (pendingSaleToLoad) { 
        setCart(pendingSaleToLoad.items); 
        setSaleToLoad(null); 
    } 
  }, [pendingSaleToLoad, setSaleToLoad]);

  // --- ATAJOS ---
  const handleShortcut = (key: string) => {
    switch(key) {
        case 'F2': setView('PENDING_SALES'); break;
        case 'F3': setView('SALES'); break;
        case 'F4': handleReprintTicket(); break;
        case 'F5': setCalcOpen(true); break;
        case 'F6': setCashFlowType('IN'); setCashFlowOpen(true); break;
        case 'F7': setCashFlowType('OUT'); setCashFlowOpen(true); break;
        case 'F8': handlePrintReport('X'); break;
        case 'F9': setAuthActionTitle('Corte Z'); setPendingAction(() => () => handlePrintReport('Z')); setAuthOpen(true); break;
        case 'F10': handleParkSale(); break;
        case 'F11': if (cart.length > 0) initiatePayment('cash'); break;
        case 'F12': if (cart.length > 0) initiatePayment('card'); break;
        case 'Escape':
            if (isPaymentOpen) setIsPaymentOpen(false);
            else if (qtyModalOpen) setQtyModalOpen(false);
            else if (clientModalOpen) setClientModalOpen(false);
            else if (calcOpen) setCalcOpen(false);
            else if (cashFlowOpen) setCashFlowOpen(false);
            else if (authOpen) setAuthOpen(false);
            else if (cart.length > 0) handleClearCartProtected();
            break;
    }
  };

  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
        if (e.key.startsWith('F') || e.key === 'Escape') {
            e.preventDefault();
            handleShortcut(e.key);
        }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [cart, isPaymentOpen, qtyModalOpen, clientModalOpen, calcOpen, cashFlowOpen, authOpen]);

  // --- REPORTES ---
  const handlePrintReport = async (type: 'X' | 'Z') => {
    try {
        const reportData = await generateShiftReport();
        const ReportComponent = <ShiftReportTicket type={type} generatedAt={reportData.generatedAt} cashSales={reportData.cashSales} cardSales={reportData.cardSales} cashIn={reportData.cashIn} cashOut={reportData.cashOut} totalSales={reportData.totalSales} finalCashExpected={reportData.expectedCashInDrawer} user="Admin" />;
        printElement(ReportComponent);
        if (type === 'Z') alert("Corte Z generado.");
    } catch (e) { alert("Error generando reporte"); }
  };

  // --- LÓGICA DE AGREGAR ---
  const handleProductClick = (product: Product) => {
    const hasPresentations = product.presentations && product.presentations.length > 0;
    const hasLegacyPack = product.packPrice && product.packQuantity;
    const hasFractional = product.contentPerUnit && product.contentUnitPrice;

    if (product.isWeighable || hasLegacyPack || hasPresentations || hasFractional) {
      setSelectedProductForQty(product);
      setQtyModalOpen(true);
    } else {
      addToCart(product, 1, null, false, false);
    }
  };

  const handleOptionsClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setSelectedProductForQty(product);
    setQtyModalOpen(true);
  };

  const addToCart = (product: Product, qty: number, presentation: any | null, isLegacyPack: boolean = false, isFractional: boolean = false) => {
    setCart(prev => {
      const variantId = isFractional ? 'fractional' : (presentation ? presentation.id : (isLegacyPack ? 'legacy_pack' : 'unit'));
      const existingIdx = prev.findIndex(item => {
        const itemVariantId = item.isFractionalSale ? 'fractional' : (item.selectedPresentation ? item.selectedPresentation.id : (item.isPackSale ? 'legacy_pack' : 'unit'));
        return item.id === product.id && itemVariantId === variantId;
      });

      let finalPrice = product.price;
      let finalName = product.name;
      let stockFactor = 1;

      if (isFractional) {
          finalPrice = product.contentUnitPrice || 0;
          finalName = `SUELTO: ${product.name}`;
          stockFactor = 1 / (product.contentPerUnit || 1);
      } else if (presentation) {
          finalPrice = presentation.price;
          finalName = `${product.name} (${presentation.name})`;
          stockFactor = presentation.quantity;
      } else if (isLegacyPack) {
          finalPrice = product.packPrice || 0;
          finalName = `CAJA: ${product.name}`;
          stockFactor = product.packQuantity || 1;
      }

      if (existingIdx >= 0) {
        return prev.map((item, index) => index === existingIdx ? { ...item, quantity: item.quantity + qty } : item);
      } 
      
      return [...prev, {
        ...product, name: finalName, price: finalPrice, quantity: qty,
        isPackSale: isLegacyPack, isFractionalSale: isFractional, selectedPresentation: presentation || undefined,
        packQuantity: stockFactor, groupId: (isLegacyPack || presentation || isFractional) ? undefined : product.groupId
      }];
    });
    setSearchTerm('');
    setTimeout(() => searchInputRef.current?.focus(), 10);
  };

  // --- GESTIÓN DE CANTIDADES ---
  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const newQty = prev[index].quantity + delta;
      if (newQty <= 0) {
         setAuthActionTitle(`Eliminar item`);
         setPendingAction(() => () => setCart(p => p.filter((_, i) => i !== index)));
         setAuthOpen(true);
         return prev;
      }
      return prev.map((item, i) => i === index ? { ...item, quantity: newQty } : item);
    });
  };

  const handleRemoveItemProtected = (index: number) => {
    setAuthActionTitle(`Eliminar item`);
    setPendingAction(() => () => setCart(prev => prev.filter((_, i) => i !== index)));
    setAuthOpen(true);
  };

  const handleClearCartProtected = () => {
    if (cart.length === 0) return;
    setAuthActionTitle('Cancelar Venta');
    setPendingAction(() => () => { setCart([]); setSelectedClient(null); localStorage.removeItem('pos_autosave_cart'); });
    setAuthOpen(true);
  };

  // --- CÁLCULOS ---
  const calculateTotals = (items: CartItem[]) => {
    const groupCounts: Record<string, number> = {};
    const groupInfo: Record<string, any> = {};
    
    items.forEach(item => {
        if (item.groupId && !item.isPackSale && !item.selectedPresentation && !item.isFractionalSale) {
            groupCounts[item.groupId] = (groupCounts[item.groupId] || 0) + item.quantity;
            if (item.wholesalePrice && item.wholesaleMin) {
                groupInfo[item.groupId] = { regular: item.price, wholesale: item.wholesalePrice, min: item.wholesaleMin };
            }
        }
    });

    let subtotal = 0;
    let savings = 0; 
    const itemsWithPrice = items.map(item => {
        let finalPrice = item.price;
        let isWholesaleApplied = false;
        if (item.groupId && !item.isPackSale && !item.selectedPresentation && !item.isFractionalSale && item.wholesaleMin && item.wholesalePrice) {
            if (groupCounts[item.groupId] >= item.wholesaleMin) {
                finalPrice = item.wholesalePrice;
                isWholesaleApplied = true;
                savings += (item.price - item.wholesalePrice) * item.quantity;
            }
        }
        subtotal += finalPrice * item.quantity;
        return { ...item, finalPrice, isWholesaleApplied };
    });

    const promoOpportunities: any[] = [];
    Object.keys(groupCounts).forEach(groupId => {
        const count = groupCounts[groupId];
        const info = groupInfo[groupId];
        if (info && count < info.min) {
            promoOpportunities.push({ groupId, missing: info.min - count, newPrice: info.wholesale, savingPerUnit: info.regular - info.wholesale });
        }
    });

    const tax = subtotal * 0.16;
    return { subtotal, tax, total: subtotal + tax, savings, itemsWithPrice, promoOpportunities };
  };

  const { subtotal, tax, total, savings, itemsWithPrice, promoOpportunities } = calculateTotals(cart);

  // --- BUSCADOR ---
  const handleScanOrSearch = () => {
    const term = searchTerm.trim();
    if (!term) return;
    let found = products.find(p => p.barcode === term || p.sku === term || p.shortCode === term);
    if (found) { handleProductClick(found); setSearchTerm(''); return; }
    const legacyPackFound = products.find(p => p.packBarcode === term);
    if (legacyPackFound) { addToCart(legacyPackFound, 1, null, true, false); setSearchTerm(''); return; }
    for (const prod of products) {
        const presFound = prod.presentations?.find(p => p.barcode === term);
        if (presFound) { addToCart(prod, 1, presFound, false, false); setSearchTerm(''); return; }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); handleScanOrSearch(); } };

  const filteredProducts = (products || []).filter((p: Product) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term) || (p.barcode && p.barcode.includes(term));
    const matchesCategory = selectedCategory === 'TODOS' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- COBRO ---
  const initiatePayment = (method: 'cash' | 'card' | 'credit') => { 
      if (method === 'credit' && !selectedClient) {
          alert("Debes seleccionar un cliente para venta a crédito.");
          setClientModalOpen(true);
          return;
      }
      setPaymentMethod(method); 
      setIsPaymentOpen(true); 
  };
  
  const handleFinishSale = async (amountTendered?: number, change?: number, refCode?: string) => {
    const clientName = selectedClient ? selectedClient.name : 'Cliente Mostrador';
    const TicketComponent = <TicketTemplate cart={itemsWithPrice} total={total} savings={savings} subtotal={subtotal} amountTendered={amountTendered || total} change={change || 0} ticketId={`V-${Date.now().toString().slice(-6)}`} customerName={clientName} />;
    setLastTicketData(TicketComponent);
    await processSale(cart, total, paymentMethod, clientName, { amountTendered, change, cardAuthCode: refCode, clientId: selectedClient?.id });
    setIsPaymentOpen(false); setLastChange(change || 0); setShowSuccess(true); 
    printElement(TicketComponent); 
    setCart([]); setSelectedClient(null); localStorage.removeItem('pos_autosave_cart'); 
    setTimeout(() => { setShowSuccess(false); setLastChange(null); }, 3000);
  };
  const handleReprintTicket = () => { if (lastTicketData) printElement(lastTicketData); else alert("No hay ticket reciente."); };
  const handleParkSale = async () => { if (cart.length === 0) return; await parkSale(cart, total, selectedClient?.name); alert("Guardado en Pendientes"); setCart([]); setSelectedClient(null); localStorage.removeItem('pos_autosave_cart'); };


  return (
    <div className="flex flex-col h-full bg-slate-100">
      
      <div className="flex-1 flex overflow-hidden p-4 gap-4 relative">
        {/* Modales */}
        <CalculatorModal isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
        <CashFlowModal isOpen={cashFlowOpen} onClose={() => setCashFlowOpen(false)} type={cashFlowType} />
        <AdminAuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={pendingAction} actionTitle={authActionTitle}/>
        <ClientSearchModal isOpen={clientModalOpen} onClose={() => setClientModalOpen(false)} onSelectClient={(client) => { setSelectedClient(client); setClientModalOpen(false); }} />

        {selectedProductForQty && (
            <QuantityModal 
                isOpen={qtyModalOpen} onClose={() => setQtyModalOpen(false)} product={selectedProductForQty}
                onConfirm={(qty, presentation, isFractional) => {
                    if (isFractional) addToCart(selectedProductForQty, qty, null, false, true);
                    else if (typeof presentation === 'object') addToCart(selectedProductForQty, qty, presentation, false);
                    else addToCart(selectedProductForQty, qty, null, !!presentation, false);
                }}
            />
        )}
        <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onConfirm={handleFinishSale} total={total} method={paymentMethod} client={selectedClient} />
        
        {showSuccess && (<div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center"><div className="bg-white p-8 rounded-3xl shadow-2xl text-center border-4 border-green-100"><div className="text-green-500 mb-4"><Banknote size={48} className="mx-auto"/></div><h2 className="text-3xl font-bold text-slate-800">¡Venta Exitosa!</h2><p className="text-slate-500 mt-2">Imprimiendo ticket...</p></div></div>)}
        {restoredSession && (<div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 fade-in"><AlertCircle size={18} /><span className="text-sm font-medium">Sesión restaurada</span></div>)}

        {/* IZQUIERDA: CATÁLOGO */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input ref={searchInputRef} type="text" placeholder="Buscar, escanear, PLU..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={handleKeyDown} autoFocus />
                </div>
                <select className="p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                    <option value="TODOS">Todas</option>
                    <option value="Abarrotes">Abarrotes</option>
                    <option value="Electrónica">Electrónica</option>
                    <option value="Ropa">Ropa</option>
                </select>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-2">
                    {filteredProducts.map((product) => (
                    <button key={product.id} onClick={() => handleProductClick(product)} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-start text-left group border border-transparent hover:border-indigo-500 relative">
                        {(product.packPrice || (product.presentations && product.presentations.length > 0) || (product.contentPerUnit && product.contentUnitPrice)) && (
                            <div onClick={(e) => handleOptionsClick(e, product)} className="absolute top-2 right-2 z-10 bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 p-1.5 rounded-lg transition-colors cursor-pointer"><MoreHorizontal size={16} /></div>
                        )}
                        {!product.packPrice && product.wholesalePrice && (<div className="absolute top-2 right-2 pointer-events-none bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><Tag size={10} /> Oferta</div>)}

                        <div className="w-full h-20 bg-slate-50 rounded-lg mb-2 flex items-center justify-center text-slate-400 font-bold text-2xl pointer-events-none">
                            {product.isWeighable ? <Scale size={32} className="text-orange-300"/> : 
                            product.image ? <img src={product.image} className="w-full h-full object-cover rounded-lg"/> : product.name.charAt(0)}
                        </div>
                        <h3 className="font-bold text-slate-700 line-clamp-2 text-sm h-10 w-full pointer-events-none">{product.name}</h3>
                        
                        {/* FRANJA DE MAYOREO CORREGIDA */}
                        {product.wholesalePrice && product.wholesaleMin ? (
                            <div className="w-full mt-1 mb-2 bg-indigo-50 border border-indigo-100 rounded px-2 py-1 text-[10px] text-indigo-700 flex justify-between items-center pointer-events-none">
                                <span className="font-bold">Mayoreo: ${product.wholesalePrice}</span>
                                <span>A partir de: {product.wholesaleMin}</span>
                            </div>
                        ) : <div className="w-full mt-1 mb-2 h-[26px]"></div>}

                        <div className="w-full text-xs text-slate-400 mb-1 flex items-center gap-1 h-4">
                            {product.packQuantity ? <div className="flex gap-1 items-center"><Box size={10} /><span>Caja x{product.packQuantity}</span></div> : 
                            product.presentations?.length ? <div className="flex gap-1 items-center"><Layers size={10} /><span>{product.presentations.length} Vars</span></div> : null}
                        </div>

                        <div className="w-full flex justify-between items-center mt-auto border-t border-slate-100 pt-2 pointer-events-none">
                            <span className="font-bold text-lg text-indigo-600">${product.price.toFixed(2)}</span>
                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${product.stock > 5 ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'}`}>
                                Stock: {product.stock} {product.isWeighable ? 'kg' : 'pz'}
                            </span>
                        </div>
                    </button>
                    ))}
                </div>
            </div>
        </div>

        {/* DERECHA: TICKET */}
        <div className="w-96 bg-white rounded-xl shadow-lg flex flex-col border border-slate-200 h-full shrink-0">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                <h2 className="font-bold text-slate-700 flex items-center gap-2">Ticket Actual {selectedClient && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">{selectedClient.name}</span>}</h2>
                <div className="flex gap-2">
                    <button onClick={() => setClientModalOpen(true)} title="Asignar Cliente" className={`transition-colors ${selectedClient ? 'text-indigo-600' : 'text-slate-400 hover:text-blue-500'}`}><UserCheck size={18}/></button>
                    <button onClick={handleReprintTicket} title="Reimprimir" className="text-slate-400 hover:text-blue-500 transition-colors"><Printer size={18}/></button>
                    <button onClick={handleClearCartProtected} title="Cancelar" className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {itemsWithPrice.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 select-none"><PackageX size={48}/><p>Carrito vacío</p></div>
                ) : (
                    itemsWithPrice.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="flex gap-3 items-center group animate-in slide-in-from-right-4 duration-200">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-slate-800 truncate">{item.name}</p>
                                <div className="flex gap-2 text-xs items-center flex-wrap">
                                    <span className={item.isWholesaleApplied ? 'text-green-600 font-bold' : 'text-indigo-600'}>${(item.finalPrice * item.quantity).toFixed(2)}</span>
                                    {item.isPackSale && <span className="bg-blue-100 text-blue-700 px-1 rounded text-[10px] border border-blue-200">Caja</span>}
                                    {item.isFractionalSale && <span className="bg-purple-100 text-purple-700 px-1 rounded text-[10px] border border-purple-200">Suelto</span>}
                                    {item.selectedPresentation && <span className="bg-purple-100 text-purple-700 px-1 rounded text-[10px] border border-purple-200">{item.selectedPresentation.name}</span>}
                                    {item.isWholesaleApplied && <span className="bg-green-100 text-green-700 px-1 rounded text-[10px] border border-green-200">Ahorro</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                                <button onClick={() => updateQuantity(idx, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-red-600 active:scale-95 transition-all"><Minus size={14}/></button>
                                <span className="w-8 text-center font-bold text-sm text-slate-700">{item.quantity}</span>
                                <button onClick={() => updateQuantity(idx, 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-green-600 active:scale-95 transition-all"><Plus size={14}/></button>
                            </div>
                            <button onClick={() => handleRemoveItemProtected(idx)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><Lock size={14}/></button>
                        </div>
                    ))
                )}
            </div>

            {promoOpportunities.length > 0 && (
                <div className="px-4 pb-2">
                    {promoOpportunities.map((promo) => (
                    <div key={promo.groupId} className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-2 flex items-start gap-3 animate-in slide-in-from-bottom-2 fade-in shadow-sm">
                        <div className="bg-blue-100 p-1.5 rounded-full text-blue-600 shrink-0"><Zap size={16} fill="currentColor" /></div>
                        <div>
                            <p className="text-xs text-blue-900 font-bold">¡Faltan {promo.missing} de <span className="uppercase">{promo.groupId}</span>!</p>
                            <p className="text-[10px] text-blue-700">Precio bajará a <span className="font-bold">${promo.newPrice.toFixed(2)}</span> c/u.</p>
                        </div>
                    </div>
                    ))}
                </div>
            )}

            <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl space-y-3">
                <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                {savings > 0 && (<div className="flex justify-between text-sm text-green-600 font-bold"><span>Ahorro aplicado</span><span>-${savings.toFixed(2)}</span></div>)}
                <div className="flex justify-between text-2xl font-bold text-slate-900 pt-2 border-t"><span>Total</span><span>${total.toFixed(2)}</span></div>
                
                <div className="grid grid-cols-3 gap-2 mt-2">
                    <button onClick={() => initiatePayment('cash')} disabled={cart.length === 0} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex flex-col justify-center items-center text-xs gap-1 transition-colors">
                        <Banknote size={18}/> Efectivo
                    </button>
                    <button onClick={() => initiatePayment('card')} disabled={cart.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex flex-col justify-center items-center text-xs gap-1 transition-colors">
                        <CreditCard size={18}/> Tarjeta
                    </button>
                    <button onClick={() => initiatePayment('credit')} disabled={cart.length === 0} className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold flex flex-col justify-center items-center text-xs gap-1 transition-colors">
                        <Wallet size={18}/> Crédito
                    </button>
                </div>
            </div>
        </div>
      </div>

      <KeyboardShortcutsBar onPress={handleShortcut} />
    </div>
  );
};