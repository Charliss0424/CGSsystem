import React, { useState, useEffect } from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { Header } from './components/Header';
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
import { ActivationScreen } from './pages/ActivationScreen'; // <--- IMPORTAMOS
import { ViewState } from './types';
import { validateLicense } from './services/licenseService'; // <--- IMPORTAMOS
import { AccountsReceivable } from './pages/AccountsReceivable'; // Importar nuevo archivo

// Wrapper interno (El sistema real)
const AppContent = () => {
  const { currentUser } = useDatabase();
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');

  if (!currentUser) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard setView={setCurrentView} />;
      case 'POS': return <PosTerminal setView={setCurrentView} />;
      case 'INVENTORY': return <Inventory />;
      case 'SALES': return <SalesHistory />;
      case 'REPORTS': return <Reports onBack={() => setCurrentView('DASHBOARD')} />;
      case 'PENDING_SALES': return <PendingSales setView={setCurrentView} />;
      case 'CLIENTS_DASHBOARD': return <ClientsDashboard setView={setCurrentView} />;
      case 'ORDERS': return <Orders setView={setCurrentView} />;
      case 'ROUTE_SALES': return <RouteSales setView={setCurrentView} />;
      case 'SETTINGS': return <div className="p-8 text-center text-slate-500">Configuración</div>;
      case 'CLIENTS_DASHBOARD': return <ClientsDashboard setView={setCurrentView} />; // Ahora es el CRM bonito
      case 'ACCOUNTS_RECEIVABLE': return <AccountsReceivable setView={setCurrentView} />; // Nuevo módulo de cobro
      default: return <Dashboard setView={setCurrentView} />;
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

// Componente Principal con Lógica de Seguridad
function App() {
  const [isLicensed, setIsLicensed] = useState<boolean>(false);
  const [isCheckingLicense, setIsCheckingLicense] = useState<boolean>(true);

  useEffect(() => {
    const checkLicense = async () => {
      // 1. Buscamos si ya hay una licencia guardada en este navegador
      const savedKey = localStorage.getItem('CGSystem_license_key');

      if (savedKey) {
        // 2. Opcional: Validar contra el servidor cada vez que abre la app (Más seguro)
        // O validar solo si ha pasado X tiempo.
        // Por ahora, validamos siempre para asegurar el "Machine ID Lock"
        const result = await validateLicense(savedKey);
        
        if (result.isValid) {
          setIsLicensed(true);
        } else {
          // Si la licencia caducó o es otra máquina, la borramos y bloqueamos
          localStorage.removeItem('CGSystem_license_key');
          localStorage.removeItem('CGSystem_plan');
          setIsLicensed(false);
        }
      }
      
      // Terminamos de checar
      setIsCheckingLicense(false);
    };

    checkLicense();
  }, []);

  // Pantalla de carga mientras verifica licencia
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

  // Si no tiene licencia válida, mostramos pantalla de activación
  if (!isLicensed) {
    return <ActivationScreen onActivationSuccess={() => setIsLicensed(true)} />;
  }

  // Si tiene licencia, cargamos el sistema normal
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
}

export default App;