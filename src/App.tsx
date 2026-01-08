import React, { useState, useEffect } from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { Header } from './components/Header';

// --- SERVICIOS Y TIPOS ---
import { validateLicense } from './services/licenseService';
import { ViewState } from './types';

// --- COMPONENTES AUXILIARES ---
import PurchaseOrders from './components/PurchaseOrders';
import { CalendarWidget } from './components/CalendarWidget';

// --- PÁGINAS PRINCIPALES ---
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { ActivationScreen } from './pages/ActivationScreen';

// --- MÓDULOS DE NEGOCIO ---
import { PosTerminal } from './pages/PosTerminal';
import { PosReturns } from './pages/PosReturns';
import { PendingSales } from './pages/PendingSales';
import { Orders } from './pages/Orders';
import { RouteSales } from './pages/RouteSales';
import { SalesHistory } from './pages/SalesHistory';
import { ClientsDashboard } from './pages/ClientsDashboard';
import { ClientsCatalog } from './pages/ClientsCatalog';
import { Inventory } from './pages/Inventory';
import InventoryMovements from './pages/InventoryMovements';
import { SuppliersDashboard } from './pages/SuppliersDashboard';
import Purchases from "./pages/Purchases";
import { ReportsCenter } from './pages/Reports/ReportsCenter'; 
import { AccountsReceivable } from './pages/AccountsReceivable';
import { TaxSettings } from './pages/TaxSettings';
import { HardwareSettings } from './pages/HardwareSettings';
import { UsersSettings } from './pages/UsersSettings';

// ==========================
//   CONTENIDO DEL SISTEMA
// ==========================
const AppContent = () => {
  const { currentUser } = useDatabase();
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  if (!currentUser) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      // --- DASHBOARD ---
      case ViewState.DASHBOARD: return <Dashboard setView={setCurrentView} />;

      // --- VENTAS Y POS ---
      case ViewState.POS: return <PosTerminal setView={setCurrentView} />;
      case ViewState.POS_RETURNS: return <PosReturns setView={setCurrentView} />;
      case ViewState.PENDING_SALES: return <PendingSales setView={setCurrentView} />;
      case ViewState.ORDERS: return <Orders setView={setCurrentView} />;
      case ViewState.ROUTE_SALES: return <RouteSales setView={setCurrentView} />;
      case ViewState.SALES: return <SalesHistory />;
      case ViewState.SALES_CALENDAR: 
        return (
          <div className="h-full p-4 overflow-auto">
            <h1 className="text-2xl font-bold mb-4">Agenda de Entregas</h1>
            <CalendarWidget mode="SALES" />
          </div>
        );

      // --- CLIENTES ---
      case ViewState.CLIENTS_DASHBOARD: return <ClientsDashboard setView={setCurrentView} />;
      case ViewState.CLIENTS_CATALOG: return <ClientsCatalog setView={setCurrentView} />;

      // --- INVENTARIO ---
      case ViewState.INVENTORY: return <Inventory setView={setCurrentView} />;
      case ViewState.INVENTORY_MOVEMENTS: return <InventoryMovements setView={setCurrentView} />;
      case ViewState.INVENTORY_AUDIT: 
        return <div className="flex h-full items-center justify-center text-slate-500">Módulo de Auditoría en Construcción</div>;

      // --- COMPRAS Y PROVEEDORES ---
      case ViewState.SUPPLIERS: return <SuppliersDashboard />;
      case ViewState.PURCHASE_ORDERS: return <PurchaseOrders setView={setCurrentView} />;
      case ViewState.PURCHASES: return <Purchases setView={setCurrentView} />;
      case ViewState.PURCHASE_CALENDAR: 
      case ViewState.CALENDAR: // Legacy fallback
        return (
          <div className="h-full p-4 overflow-auto">
            <h1 className="text-2xl font-bold mb-4">Agenda de Recepción</h1>
            <CalendarWidget mode="PURCHASES" />
          </div>
        );

      // --- FINANZAS ---
      case ViewState.ACCOUNTS_RECEIVABLE: return <AccountsReceivable setView={setCurrentView} />;
      case ViewState.ACCOUNTS_PAYABLE: 
        return <div className="flex h-full items-center justify-center text-slate-500">Cuentas por Pagar en Construcción</div>;
      case ViewState.FINANCE_CALENDAR:
        return (
          <div className="h-full p-4 overflow-auto">
            <h1 className="text-2xl font-bold mb-4">Agenda Financiera</h1>
            <CalendarWidget mode="FINANCE" />
          </div>
        );

      // --- REPORTES ---
      case ViewState.REPORTS: return <ReportsCenter />;

      // --- CONFIGURACIÓN ---
      case ViewState.SETTINGS: return <div className="p-8 text-center">Configuración General</div>;
      case ViewState.CONF_HARDWARE: return <HardwareSettings setView={setCurrentView} />;
      case ViewState.CONF_TAXES: return <TaxSettings setView={setCurrentView} />;
      case ViewState.CONF_USERS: return <UsersSettings setView={setCurrentView} />;
      case ViewState.CONF_DATABASE: return <div className="p-8 text-center">Base de Datos</div>;

      default: return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    // LAYOUT PRINCIPAL (CORREGIDO PARA EVITAR SCROLL GLOBAL)
    // h-screen: Fuerza altura exacta de la ventana
    // overflow-hidden: Evita que el body haga scroll (el scroll será interno en cada vista)
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* 1. HEADER (Fijo, no se encoge) */}
      <div className="shrink-0 bg-white border-b border-slate-200 shadow-sm z-50">
           <Header setView={setCurrentView} />
      </div>

      {/* 2. ÁREA DE CONTENIDO (Ocupa el resto del espacio) */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto relative overflow-hidden">
        {renderView()}
      </main>

    </div>
  );
};


// ==========================
//   APP ROOT (Licencia y Contexto)
// ==========================
function App() {
  const [isLicensed, setIsLicensed] = useState<boolean>(false);
  const [isCheckingLicense, setIsCheckingLicense] = useState<boolean>(true);

  useEffect(() => {
    const checkLicense = async () => {
      const savedKey = localStorage.getItem('CGSystem_license_key');

      if (savedKey) {
        try {
          const result = await validateLicense(savedKey);
          if (result.isValid) {
            setIsLicensed(true);
          } else {
            localStorage.removeItem('CGSystem_license_key');
            localStorage.removeItem('CGSystem_plan');
            setIsLicensed(false);
          }
        } catch (e) {
          console.error("Error de conexión al validar licencia", e);
          setIsLicensed(false);
        }
      }
      setIsCheckingLicense(false);
    };

    checkLicense();
  }, []);

  if (isCheckingLicense) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-light tracking-wider">CARGANDO SISTEMA...</p>
        </div>
      </div>
    );
  }

  if (!isLicensed) {
    return <ActivationScreen onActivationSuccess={() => setIsLicensed(true)} />;
  }

  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
}

export default App;