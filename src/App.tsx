import React, { useState, useEffect } from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { Header } from './components/Header';

// Páginas existentes
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

// Módulo de Compras
import PurchaseOrders from './components/PurchaseOrders';
import Purchases from "./pages/Purchases"
import CalendarView from './components/CalendarView';

// Inventarios nuevos
import InventoryMovements from './pages/InventoryMovements';

// Utilerías y Tipos
import { ViewState } from './types';
import { validateLicense } from './services/licenseService';


// ==========================
//   SISTEMA INTERNO
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

      // --- CONTABILIDAD ---
      case ViewState.ACCOUNTS_RECEIVABLE:
        return <AccountsReceivable setView={setCurrentView} />;

      // --- COMPRAS ---
      case ViewState.PURCHASE_ORDERS:
        return <PurchaseOrders setView={setCurrentView} />;
      case ViewState.PURCHASES:
        return <Purchases setView={setCurrentView} />;
      //case ViewState.PURCHASE_HISTORY:
        return <Purchases setView={setCurrentView} />;
      case ViewState.CALENDAR:
        return <CalendarView setView={setCurrentView} />;

      // --- GESTIÓN ---
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
//   APP PRINCIPAL
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