import React, { useState, useEffect } from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { Header } from './components/Header';

// --- PÁGINAS ---
import { Dashboard } from './pages/Dashboard';
import { PosTerminal } from './pages/PosTerminal';
import { Inventory } from './pages/Inventory';
import { SalesHistory } from './pages/SalesHistory';
import { Reports } from './pages/Reports';
import { PendingSales } from './pages/PendingSales';
import { ClientsDashboard } from './pages/ClientsDashboard';
import { Orders } from './pages/Orders';
import { RouteSales } from './pages/RouteSales';
import { Login } from './pages/Login';
import { ActivationScreen } from './pages/ActivationScreen';
import { AccountsReceivable } from './pages/AccountsReceivable';
import { PosReturns } from './pages/PosReturns';
import { ClientsCatalog } from './pages/ClientsCatalog';
import { TaxSettings } from './pages/TaxSettings';
import { HardwareSettings } from './pages/HardwareSettings';
import { UsersSettings } from './pages/UsersSettings';
import { SuppliersDashboard } from './pages/SuppliersDashboard';
import Purchases from "./pages/Purchases";
import InventoryMovements from './pages/InventoryMovements';

// --- COMPONENTES AUXILIARES ---
import PurchaseOrders from './components/PurchaseOrders';
import { CalendarWidget } from './components/CalendarWidget'; // <--- IMPORTANTE

// --- UTILERÍAS ---
import { ViewState } from './types';
import { validateLicense } from './services/licenseService';


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
      case ViewState.DASHBOARD:
        return <Dashboard setView={setCurrentView} />;

      // --- VENTAS ---
      case ViewState.POS:
        return <PosTerminal setView={setCurrentView} />;
      case ViewState.POS_RETURNS:
        return <PosReturns setView={setCurrentView} />;
      case ViewState.PENDING_SALES:
        return <PendingSales setView={setCurrentView} />;
      case ViewState.ORDERS:
        return <Orders setView={setCurrentView} />;
      case ViewState.ROUTE_SALES:
        return <RouteSales setView={setCurrentView} />;
      case ViewState.SALES:
        return <SalesHistory />;
      
      // CALENDARIO DE VENTAS (Entregas)
      case ViewState.SALES_CALENDAR:
        return (
          <div className="h-full p-6 flex flex-col animate-fade-in bg-slate-50">
             <div className="mb-4">
                <h1 className="text-2xl font-bold text-blue-900">Agenda de Entregas</h1>
                <p className="text-slate-500 text-sm">Logística de pedidos a clientes.</p>
             </div>
             <div className="flex-1">
                <CalendarWidget mode="SALES" />
             </div>
          </div>
        );

      // --- CLIENTES ---
      case ViewState.CLIENTS_DASHBOARD:
        return <ClientsDashboard setView={setCurrentView} />;
      case ViewState.CLIENTS_CATALOG:
        return <ClientsCatalog setView={setCurrentView} />;

      // --- INVENTARIOS ---
      case ViewState.INVENTORY:
        return <Inventory setView={setCurrentView} />;
      case ViewState.INVENTORY_MOVEMENTS:
        return <InventoryMovements setView={setCurrentView} />;
      case ViewState.INVENTORY_AUDIT:
        return (
          <div className="p-10 text-center text-xl text-slate-600">
            Auditoría de inventario (pendiente de implementar)
          </div>
        );

      // --- COMPRAS Y PROVEEDORES ---
      case ViewState.SUPPLIERS:
        return <SuppliersDashboard />;
      case ViewState.PURCHASE_ORDERS:
        return <PurchaseOrders setView={setCurrentView} />;
      case ViewState.PURCHASES:
        return <Purchases setView={setCurrentView} />;
      
      // CALENDARIO DE COMPRAS (Recepciones)
      case ViewState.PURCHASE_CALENDAR: // También cubre 'CALENDAR' legacy
      case ViewState.CALENDAR:
        return (
          <div className="h-full p-6 flex flex-col animate-fade-in bg-slate-50">
             <div className="mb-4">
                <h1 className="text-2xl font-bold text-emerald-900">Agenda de Recepción</h1>
                <p className="text-slate-500 text-sm">Programación de llegada de mercancía de proveedores.</p>
             </div>
             <div className="flex-1">
                <CalendarWidget mode="PURCHASES" />
             </div>
          </div>
        );

      // --- CONTABILIDAD Y FINANZAS ---
      case ViewState.ACCOUNTS_RECEIVABLE:
        return <AccountsReceivable setView={setCurrentView} />;

      case ViewState.ACCOUNTS_PAYABLE:
        return (
            <div className="p-10 text-center text-slate-500 bg-slate-50 h-full flex items-center justify-center flex-col">
                <h2 className="text-2xl font-bold text-slate-700 mb-2">Módulo de Cuentas por Pagar</h2>
                <p>En construcción... (Aquí verás la lista de facturas pendientes de pago)</p>
            </div>
        );

      // CALENDARIO FINANCIERO (Flujo de Caja)
      case ViewState.FINANCE_CALENDAR:
         return (
          <div className="h-full p-6 flex flex-col animate-fade-in bg-slate-50">
             <div className="mb-4">
                <h1 className="text-2xl font-bold text-purple-900">Agenda Financiera</h1>
                <p className="text-slate-500 text-sm">Flujo de caja, vencimientos de facturas y gastos operativos.</p>
             </div>
             <div className="flex-1">
                <CalendarWidget mode="FINANCE" />
             </div>
          </div>
        );

      // --- REPORTES ---
      case ViewState.REPORTS:
        return <Reports onBack={() => setCurrentView(ViewState.DASHBOARD)} />;

      // --- CONFIGURACIÓN ---
      case ViewState.SETTINGS:
        return <div className="p-8 text-center text-slate-500">Configuración General</div>;
      case ViewState.CONF_HARDWARE:
        return <HardwareSettings setView={setCurrentView} />;
      case ViewState.CONF_TAXES:
        return <TaxSettings setView={setCurrentView} />;
      case ViewState.CONF_USERS:
        return <UsersSettings setView={setCurrentView} />;
      case ViewState.CONF_DATABASE:
        return <div className="p-8 text-center text-slate-500">Configuración de Base de Datos</div>;

      default:
        return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 flex flex-col">
      <Header setView={setCurrentView} />
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
};


// ==========================
//   APP PRINCIPAL (Licencia)
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
          console.error("Error validando licencia", e);
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
        <div className="text-white flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Verificando licencia...</p>
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