import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Trash2, Plus, Minus, CreditCard, 
  Banknote, Wallet, PackageX, Box, Tag, Scale, 
  MoreHorizontal, User, Printer, Lock, AlertCircle, Zap, Layers, Clock
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Product, CartItem, ViewState } from '../types';
import { PaymentModal } from '../components/PaymentModal'; 
import { TicketTemplate } from '../components/TicketTemplate';
import { printElement } from '../utils/printHelper';
import { QuantityModal } from '../components/QuantityModal';
import { KeyboardShortcutsBar } from '../components/KeyboardShortcutsBar';
import { CreditSaleModal } from '../components/CreditSaleModal';
import { ClientSearchModal } from '../components/ClientSearchModal';
import { AdminAuthModal } from '../components/AdminAuthModal';

interface PosTerminalProps {
  setView: (view: ViewState) => void;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({ setView }) => {
  const { products, processSale, pendingSaleToLoad, setSaleToLoad, parkSale } = useDatabase();
  
  // --- ESTADOS ---
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('pos_autosave_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // --- MODALES ---
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [qtyModalOpen, setQtyModalOpen] = useState(false);
  const [selectedProductForQty, setSelectedProductForQty] = useState<Product | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [isClientSearchOpen, setIsClientSearchOpen] = useState(false);
  
  // --- SEGURIDAD ---
  const [showAuth, setShowAuth] = useState(false);
  const [authAction, setAuthAction] = useState<'DELETE_ITEM' | 'CLEAR_CART' | null>(null);
  const [itemToDeleteIndex, setItemToDeleteIndex] = useState<number | null>(null);

  // --- UI ---
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastChange, setLastChange] = useState<number | null>(null);
  const [restoredSession, setRestoredSession] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const endOfListRef = useRef<HTMLDivElement>(null);

  // --- EFECTOS ---
  useEffect(() => { 
      localStorage.setItem('pos_autosave_cart', JSON.stringify(cart));
      endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cart]);
  
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
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
        if (isPaymentOpen || isCreditModalOpen || qtyModalOpen || showAuth) return;
        switch(e.key) {
            case 'F10': e.preventDefault(); if(cart.length > 0) initiatePayment('cash'); break;
            case 'F11': e.preventDefault(); if(cart.length > 0) initiatePayment('card'); break;
            case 'F12': e.preventDefault(); if(cart.length > 0) initiateCredit(); break;
        }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [cart, isPaymentOpen, isCreditModalOpen, qtyModalOpen, showAuth]);


  // --- LÓGICA AGREGAR ---
  const handleProductClick = (product: Product) => {
    const hasPresentations = product.presentations && product.presentations.length > 0;
    const hasLegacyPack = product.packPrice && product.packQuantity;
    if (product.isWeighable || hasLegacyPack || hasPresentations) {
      setSelectedProductForQty(product);
      setQtyModalOpen(true);
    } else {
      addToCart(product, 1, null, false);
    }
  };

  const handleOptionsClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation(); 
    setSelectedProductForQty(product);
    setQtyModalOpen(true);
  };

  // Agregamos el último parámetro: isFractional
  const addToCart = (product: Product, qty: number, presentation: any | null, isLegacyPack: boolean = false, isFractional: boolean = false) => {
    setCart(prev => {
      // Definimos un ID único para que no mezcle cigarros sueltos con cajetillas cerradas
      const variantId = presentation 
          ? presentation.id 
          : (isLegacyPack ? 'legacy_pack' : (isFractional ? 'loose_unit' : 'unit'));

      const existingIdx = prev.findIndex(item => {
        const itemVariantId = item.selectedPresentation 
            ? item.selectedPresentation.id 
            : (item.isPackSale ? 'legacy_pack' : (item.name.includes('(Suelto)') ? 'loose_unit' : 'unit'));
        return item.id === product.id && itemVariantId === variantId;
      });

      let finalPrice = product.price; // Precio por defecto ($70)
      let finalName = product.name;
      let packContent = 1;

      // --- LÓGICA DE PRECIOS ---
      if (presentation) {
        finalPrice = presentation.price;
        finalName = `${product.name} (${presentation.name})`;
        packContent = presentation.quantity;
      } else if (isLegacyPack) {
        finalPrice = product.packPrice || 0;
        finalName = `CAJA: ${product.name}`;
        packContent = product.packQuantity || 1;
      } else if (isFractional) {
        // AQUÍ ESTÁ EL ARREGLO: Usamos el precio de contenido ($7.00)
        finalPrice = product.contentUnitPrice || 0;
        finalName = `${product.name} (Suelto)`;
        // Opcional: si quieres descontar inventario decimal, ajusta aquí.
        // Por ahora solo arreglamos el precio.
      }

      if (existingIdx >= 0) {
        return prev.map((item, index) => index === existingIdx ? { ...item, quantity: item.quantity + qty } : item);
      } 
      
      return [...prev, {
        ...product, 
        name: finalName, 
        price: finalPrice, 
        quantity: qty, 
        isPackSale: isLegacyPack,
        selectedPresentation: presentation || undefined, 
        packQuantity: packContent, 
        groupId: (isLegacyPack || presentation || isFractional) ? undefined : product.groupId
      }];
    });
    setSearchTerm('');
    setTimeout(() => searchInputRef.current?.focus(), 10);
  };

  // --- SEGURIDAD ---
  const requestRemoveItem = (index: number) => {
    setItemToDeleteIndex(index);
    setAuthAction('DELETE_ITEM');
    setShowAuth(true);
  };
  const requestClearCart = () => {
    setAuthAction('CLEAR_CART');
    setShowAuth(true);
  };
  const handleAuthSuccess = () => {
    setShowAuth(false);
    if (authAction === 'DELETE_ITEM' && itemToDeleteIndex !== null) {
        setCart(prev => prev.filter((_, i) => i !== itemToDeleteIndex));
        setItemToDeleteIndex(null);
    } else if (authAction === 'CLEAR_CART') {
        setCart([]);
        localStorage.removeItem('pos_autosave_cart');
        setSelectedClient(null);
    }
    setAuthAction(null);
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const newQty = prev[index].quantity + delta;
      if (newQty <= 0) {
          setTimeout(() => requestRemoveItem(index), 0);
          return prev;
      }
      return prev.map((item, i) => i === index ? { ...item, quantity: newQty } : item);
    });
  };

  // --- CÁLCULOS ---
  const calculateTotals = (items: CartItem[]) => {
    const groupCounts: Record<string, number> = {};
    const groupInfo: Record<string, any> = {};
    items.forEach(item => {
        if (item.groupId && !item.isPackSale && !item.selectedPresentation) {
            groupCounts[item.groupId] = (groupCounts[item.groupId] || 0) + item.quantity;
            if (item.wholesalePrice && item.wholesaleMin) groupInfo[item.groupId] = { regular: item.price, wholesale: item.wholesalePrice, min: item.wholesaleMin };
        }
    });

    let subtotal = 0; let savings = 0; 
    const itemsWithPrice = items.map(item => {
        let finalPrice = item.price;
        let isWholesaleApplied = false;
        if (item.groupId && !item.isPackSale && !item.selectedPresentation && item.wholesaleMin && item.wholesalePrice) {
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
            promoOpportunities.push({ groupId, missing: info.min - count, newPrice: info.wholesale });
        }
    });

    const tax = subtotal * 0.16; 
    const total = subtotal + tax; 
    return { subtotal, tax, total, savings, itemsWithPrice, promoOpportunities };
  };

  const { subtotal, total, savings, itemsWithPrice, promoOpportunities } = calculateTotals(cart);

  // --- ESCÁNER ---
  const handleScanOrSearch = () => {
    const term = searchTerm.trim();
    if (!term) return;
    let found = products.find(p => p.barcode === term || p.sku === term || p.shortCode === term);
    if (found) { handleProductClick(found); setSearchTerm(''); return; }
    const legacyPackFound = products.find(p => p.packBarcode === term);
    if (legacyPackFound) { addToCart(legacyPackFound, 1, null, true); setSearchTerm(''); return; }
    for (const prod of products) {
        if (prod.presentations?.find(p => p.barcode === term)) {
            addToCart(prod, 1, prod.presentations.find(p => p.barcode === term), false);
            setSearchTerm(''); return;
        }
    }
  };

  const filteredProducts = (products || []).filter((p: Product) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term) || (p.barcode && p.barcode.includes(term));
    return (matchesSearch && (selectedCategory === 'TODOS' || p.category === selectedCategory));
  });

  // --- COBRO ---
  const initiatePayment = (method: 'cash' | 'card') => { setPaymentMethod(method); setIsPaymentOpen(true); };
  
  const handleFinishSale = async (amountTendered?: number, change?: number, refCode?: string) => {
    const TicketComponent = <TicketTemplate cart={itemsWithPrice} total={total} savings={savings} subtotal={subtotal} amountTendered={amountTendered || total} change={change || 0} ticketId={`V-${Date.now().toString().slice(-6)}`} customerName={selectedClient?.name || "Cliente Mostrador"} />;
    await processSale(cart, total, paymentMethod, selectedClient?.name || 'Cliente Mostrador', { amountTendered, change, cardAuthCode: refCode });
    setIsPaymentOpen(false); setLastChange(change || 0); setShowSuccess(true); printElement(TicketComponent); setCart([]); setSelectedClient(null); localStorage.removeItem('pos_autosave_cart'); setTimeout(() => { setShowSuccess(false); setLastChange(null); }, 3000);
  };
  const initiateCredit = () => { if (!selectedClient) { setIsClientSearchOpen(true); } else { setIsCreditModalOpen(true); } };
  const handleFinishCreditSale = async () => {
    if (!selectedClient) return;
    await processSale(cart, total, 'credit', selectedClient.name, { amountTendered: 0, change: 0, cardAuthCode: '' });
    setIsCreditModalOpen(false); setShowSuccess(true);
    const TicketComponent = <TicketTemplate cart={itemsWithPrice} total={total} savings={savings} subtotal={subtotal} amountTendered={0} change={0} ticketId={`CRED-${Date.now().toString().slice(-6)}`} customerName={selectedClient.name} />;
    printElement(TicketComponent);
    setCart([]); setSelectedClient(null); localStorage.removeItem('pos_autosave_cart'); setTimeout(() => setShowSuccess(false), 3000);
  };
  const handleParkSale = async () => {
    if (cart.length === 0) return;
    if (selectedClient) {
        if (confirm(`¿Guardar venta para EVENTO de ${selectedClient.name}?`)) {
            await parkSale(cart, total, selectedClient.name, 'CONSIGNMENT', 'Venta a Consumo');
            alert("Guardado en Eventos"); setCart([]); localStorage.removeItem('pos_autosave_cart'); return;
        }
    }
    const name = selectedClient ? selectedClient.name : prompt("Nombre para identificar venta:");
    if (name) { await parkSale(cart, total, name, 'GENERAL'); alert("Venta Pausada"); setCart([]); localStorage.removeItem('pos_autosave_cart'); }
  };

  return (
    // CONTENEDOR FLEX VERTICAL: Ocupa el 100% de la altura disponible (h-[calc(100vh-65px)]) asumiendo header ~65px
    // Si el header es más alto, ajusta el 65px. Esto asegura que la barra gris quede abajo.
    <div className="flex flex-col h-[calc(100vh-65px)] bg-slate-100 overflow-hidden">
      
      {/* ZONA SUPERIOR: PRODUCTOS Y TICKET (Flexible) */}
      <div className="flex-1 flex p-2 gap-2 overflow-hidden relative z-0">
        
        {/* IZQUIERDA: CATÁLOGO */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
          {/* Buscador */}
          <div className="bg-white p-3 rounded-xl shadow-sm flex gap-2 items-center shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                ref={searchInputRef} 
                type="text" 
                placeholder="Buscar, escanear, PLU..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleScanOrSearch()} 
                autoFocus 
              />
            </div>
            <select 
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm" 
              value={selectedCategory} 
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="TODOS">Todas</option>
              <option value="Abarrotes">Abarrotes</option>
              <option value="Electrónica">Electrónica</option>
              <option value="Ropa">Ropa</option>
            </select>
          </div>

          {/* Grid Productos */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredProducts.map((product) => (
                <button 
                  key={product.id} 
                  onClick={() => handleProductClick(product)} 
                  className="bg-white p-2 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-start text-left group border border-transparent hover:border-indigo-500 relative"
                >
                  {(product.packPrice || (product.presentations && product.presentations.length > 0)) && (
                    <div 
                      onClick={(e) => handleOptionsClick(e, product)} 
                      className="absolute top-1 right-1 z-10 bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 p-1 rounded-lg cursor-pointer"
                    >
                      <MoreHorizontal size={14} />
                    </div>
                  )}
                  
                  {(product.wholesalePrice && !product.packPrice) && (
                    <div className="absolute top-1 right-1 pointer-events-none bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Tag size={8} /> Oferta
                    </div>
                  )}
                  
                  <div className="w-full h-16 bg-slate-50 rounded-lg mb-1 flex items-center justify-center text-slate-400 font-bold text-xl pointer-events-none">
                    {product.isWeighable ? (
                      <Scale size={24} className="text-orange-300"/>
                    ) : product.image ? (
                      <img src={product.image} className="w-full h-full object-cover rounded-lg"/>
                    ) : (
                      product.name.charAt(0)
                    )}
                  </div>
                  
                  <h3 className="font-bold text-slate-700 line-clamp-2 text-xs h-8 w-full pointer-events-none leading-tight">
                    {product.name}
                  </h3>
                  
                  {product.wholesalePrice && product.wholesaleMin ? (
                    <div className="w-full mt-1 mb-1 bg-indigo-50 border border-indigo-100 rounded px-1 py-0.5 text-[9px] text-indigo-700 flex justify-between items-center pointer-events-none">
                      <span className="font-bold">Mayoreo: ${product.wholesalePrice}</span>
                      <span>A partir de: {product.wholesaleMin}</span>
                    </div>
                  ) : (
                    <div className="w-full mt-1 mb-1 h-[20px]"></div>
                  )}
                  
                  {/* LÍNEA MODIFICADA: */}
                  <div className="w-full flex justify-between items-center mt-auto border-t border-slate-100 pt-1 pointer-events-none">
                    <span className="font-bold text-sm text-indigo-600">${product.price.toFixed(2)}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${product.stock > 5 ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'}`}>
                      Stock: {product.stock} {product.isWeighable ? 'kg' : ''}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div> {/* ← CIERRE DEL DIV IZQUIERDO (CATÁLOGO) */}

        {/* DERECHA: TICKET */}
        <div className="w-[420px] bg-white rounded-xl shadow-2xl flex flex-col border-l border-slate-200 h-full shrink-0 z-10 overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
            <div>
              <h2 className="font-bold text-lg text-slate-800">Ticket de Venta</h2>
              <div className="flex items-center gap-1 mt-1">
                <button 
                  onClick={() => setIsClientSearchOpen(true)} 
                  className={`text-xs font-bold px-2 py-1 rounded border flex items-center gap-1 transition-colors ${selectedClient ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-slate-400 border-slate-200 hover:border-blue-400 hover:text-blue-500'}`}
                >
                  <User size={14}/> {selectedClient ? selectedClient.name : 'Cliente General'}
                </button>
                <button className="text-slate-400 hover:text-indigo-500 p-1" title="Reimprimir Último">
                  <Printer size={16}/>
                </button>
                <button onClick={handleParkSale} className="text-slate-400 hover:text-orange-500 p-1" title="Pausar Venta">
                  <Clock size={16}/>
                </button>
              </div>
            </div>
            <button onClick={requestClearCart} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition-colors" title="Vaciar Carrito">
              <Trash2 size={20}/>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50 min-h-0">
            {itemsWithPrice.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 select-none">
                <PackageX size={64}/>
                <p className="mt-4 font-medium">Carrito vacío</p>
              </div>
            ) : (
              itemsWithPrice.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-200">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-xs text-slate-800 leading-tight flex-1">{item.name}</p>
                    <button onClick={() => requestRemoveItem(idx)} className="text-slate-300 hover:text-red-500 ml-2 p-0.5 hover:bg-red-50 rounded transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                      <button onClick={() => updateQuantity(idx, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-red-500 hover:bg-red-50">
                        <Minus size={14}/>
                      </button>
                      <span className="text-sm font-bold text-slate-700 w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(idx, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-green-600 hover:bg-green-50">
                        <Plus size={14}/>
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-indigo-900">${(item.finalPrice * item.quantity).toFixed(2)}</p>
                      <div className="flex flex-wrap justify-end gap-1">
                        {item.isPackSale && <span className="bg-blue-100 text-blue-700 px-1 rounded text-[9px] font-bold border border-blue-200">Caja</span>}
                        {item.isWholesaleApplied && <span className="bg-green-100 text-green-700 px-1 rounded text-[9px] font-bold border border-green-200">Mayoreo</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={endOfListRef}></div>
          </div>

          {/* SECCIÓN INFERIOR FIJA */}
          <div className="p-3 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 shrink-0">
            {promoOpportunities.length > 0 && (
              <div className="mb-2">
                {promoOpportunities.map((promo) => (
                  <div key={promo.groupId} className="flex items-center gap-2 text-xs mb-1 last:mb-0 bg-blue-50 p-1 rounded border border-blue-100 text-blue-800">
                    <Zap size={12} fill="currentColor" />
                    <div>Faltan <b>{promo.missing}</b> de {promo.groupId} para precio <b>${promo.newPrice.toFixed(2)}</b></div>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-slate-500 text-xs">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-green-600 text-xs font-bold">
                  <span>Ahorro</span>
                  <span>-${savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-3xl font-bold text-slate-900 pt-1 border-t border-dashed">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => initiatePayment('cash')} 
                disabled={cart.length === 0} 
                className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex flex-col justify-center items-center text-xs gap-0.5 shadow-lg shadow-green-100 transition-all active:scale-95"
              >
                <span className="text-[9px] opacity-70">[F10]</span>
                <div className="flex items-center gap-1">
                  <Banknote size={16}/> Efectivo
                </div>
              </button>
              <button 
                onClick={() => initiatePayment('card')} 
                disabled={cart.length === 0} 
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex flex-col justify-center items-center text-xs gap-0.5 shadow-lg shadow-blue-100 transition-all active:scale-95"
              >
                <span className="text-[9px] opacity-70">[F11]</span>
                <div className="flex items-center gap-1">
                  <CreditCard size={16}/> Tarjeta
                </div>
              </button>
              <button 
                onClick={initiateCredit} 
                disabled={cart.length === 0} 
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold flex flex-col justify-center items-center text-xs gap-0.5 shadow-lg shadow-purple-100 transition-all active:scale-95"
              >
                <span className="text-[9px] opacity-70">[F12]</span>
                <div className="flex items-center gap-1">
                  <Wallet size={16}/> Crédito
                </div>
              </button>
            </div>
          </div>
        </div>
      </div> {/* ← CIERRE DEL DIV SUPERIOR (PRODUCTOS Y TICKET) */}

      {/* BARRA INFERIOR (ESTÁTICA AL FINAL) */}
      <div className="bg-slate-900 shrink-0 z-50">
        <KeyboardShortcutsBar setView={setView} />
      </div>

      {/* MODALES */}
      {selectedProductForQty && (
        <QuantityModal 
          isOpen={qtyModalOpen} 
          onClose={() => setQtyModalOpen(false)} 
          onConfirm={(qty, presentation, isFractional) => { 
            // Ahora pasamos explícitamente los 3 valores a addToCart
            // (product, qty, presentation, isLegacyPack, isFractional)
            addToCart(selectedProductForQty, qty, presentation, false, isFractional || false); 
          }} 
          product={selectedProductForQty} 
        />
      )}
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onConfirm={handleFinishSale} total={total} method={paymentMethod} />
      <CreditSaleModal isOpen={isCreditModalOpen} onClose={() => setIsCreditModalOpen(false)} onConfirm={handleFinishCreditSale} total={total} client={selectedClient} />
      <ClientSearchModal isOpen={isClientSearchOpen} onClose={() => setIsClientSearchOpen(false)} onSelectClient={(c) => { setSelectedClient(c); setIsClientSearchOpen(false); }} />
      <AdminAuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} actionName={authAction === 'DELETE_ITEM' ? "Eliminar Producto" : "Vaciar Carrito"} />
      {showSuccess && (
        <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center border-4 border-green-100">
            <div className="text-green-500 mb-4">
              <Banknote size={48} className="mx-auto"/>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">¡Venta Exitosa!</h2>
            <p className="text-slate-500 mt-2">Imprimiendo ticket...</p>
          </div>
        </div>
      )}
      {restoredSession && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 fade-in">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">Sesión restaurada</span>
        </div>
      )}
    </div>
  );
};