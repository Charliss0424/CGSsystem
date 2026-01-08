import React, { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { User, Lock, Scan, Keyboard, Delete, LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';

// Importa tu logo localmente - AJUSTA LA RUTA SEGÚN DONDE ESTÉ TU LOGO
import logoImage from '../assets/images/logo.png';

export const Login: React.FC = () => {
  const { login } = useDatabase();
  const [activeTab, setActiveTab] = useState<'pin' | 'password' | 'barcode'>('pin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // PIN State
  const [pin, setPin] = useState('');
  const pinInputRef = useRef<HTMLInputElement>(null);
  
  // Password State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Barcode State
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeRef = useRef<HTMLInputElement>(null);

  // Focus management
  useEffect(() => {
    if (activeTab === 'barcode' && barcodeRef.current) {
        barcodeRef.current.focus();
    }
    if (activeTab === 'pin' && pinInputRef.current) {
        pinInputRef.current.focus();
    }
  }, [activeTab]);

  // Handle keyboard input for PIN
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'pin') return;
      
      // Handle number keys (0-9) from both keyboard sections
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        if (pin.length < 4) {
          const newPin = pin + e.key;
          setPin(newPin);
          if (newPin.length === 4) {
            attemptLogin('pin', newPin);
          }
        }
      }
      
      // Handle backspace
      else if (e.key === 'Backspace') {
        e.preventDefault();
        setPin(prev => prev.slice(0, -1));
        setError('');
      }
      
      // Handle Enter to submit PIN
      else if (e.key === 'Enter' && pin.length > 0) {
        e.preventDefault();
        attemptLogin('pin', pin);
      }
      
      // Handle Escape to clear PIN
      else if (e.key === 'Escape') {
        e.preventDefault();
        setPin('');
        setError('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, pin]);

  // Handle PIN Input from virtual keyboard
  const handlePinClick = (num: string) => {
      if (pin.length < 4) {
          const newPin = pin + num;
          setPin(newPin);
          if (newPin.length === 4) {
              attemptLogin('pin', newPin);
          }
      }
  };

  const handleBackspace = () => {
      setPin(prev => prev.slice(0, -1));
      setError('');
  };

  const clearPin = () => {
      setPin('');
      setError('');
  };

  const attemptLogin = async (method: 'pin' | 'password' | 'barcode', value: string) => {
      setIsLoading(true);
      setError('');
      
      let success = false;
      if (method === 'password') {
          success = await login('password', JSON.stringify({ username, password }));
      } else {
          success = await login(method, value);
      }

      if (!success) {
          setError('Credenciales incorrectas. Intente nuevamente.');
          setIsLoading(false);
          if (method === 'pin') setPin('');
          if (method === 'barcode') setBarcodeInput('');
      }
  };

  // Barcode Listener
  const handleBarcodeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (barcodeInput) attemptLogin('barcode', barcodeInput);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[150px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[150px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="w-full max-w-6xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row z-10 min-h-[700px]">
            
            {/* Left Side: Branding (Desktop) */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-slate-800/80 to-slate-900/90 p-12 flex-col justify-center items-center border-r border-white/5 relative text-center">
                
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    {/* Logo - Reemplazado por imagen local */}
                    <div className="w-80 h-80 mb-8 flex items-center justify-center">
                        <img 
                            src={logoImage}
                            alt="CGSystem Logo" 
                            className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    
                    <h1 className="text-7xl font-bold text-white tracking-tighter mb-4">
                        CG<span className="font-light text-slate-300">System</span>
                    </h1>
                    <p className="text-slate-400 text-xl font-light tracking-wide max-w-md mt-2">
                        Punto de Venta Profesional
                    </p>
                </div>

                <div className="absolute bottom-6 text-slate-600 text-xs font-medium tracking-widest uppercase">
                    &copy; 2025 Enterprise Edition
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-slate-900/40">
                
                {/* Mobile Header with Logo */}
                <div className="md:hidden flex flex-col items-center mb-8">
                    <div className="w-48 h-48 mb-4 flex items-center justify-center">
                        <img 
                            src={logoImage}
                            alt="CGSystem Logo" 
                            className="w-full h-full object-contain drop-shadow-lg"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white">CGSystem</h1>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-10 bg-slate-800/50 p-1.5 rounded-2xl w-fit mx-auto backdrop-blur-md shadow-inner">
                    <TabButton 
                        active={activeTab === 'pin'} 
                        onClick={() => setActiveTab('pin')} 
                        icon={Lock} 
                        label="PIN" 
                    />
                    <TabButton 
                        active={activeTab === 'password'} 
                        onClick={() => setActiveTab('password')} 
                        icon={Keyboard} 
                        label="Contraseña" 
                    />
                    <TabButton 
                        active={activeTab === 'barcode'} 
                        onClick={() => setActiveTab('barcode')} 
                        icon={Scan} 
                        label="Tarjeta" 
                    />
                </div>

                {/* Login Forms */}
                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                    
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-center text-sm animate-fade-in flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                            {error}
                        </div>
                    )}

                    {/* PIN Login */}
                    {activeTab === 'pin' && (
                        <div className="animate-fade-in flex flex-col items-center">
                            <h2 className="text-2xl font-bold text-white mb-8">Ingrese su PIN</h2>
                            
                            {/* Hidden input para capturar teclado físico */}
                            <input
                                ref={pinInputRef}
                                type="password"
                                className="opacity-0 absolute h-0 w-0"
                                value={pin}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 4) {
                                        setPin(value);
                                        if (value.length === 4) {
                                            attemptLogin('pin', value);
                                        }
                                    }
                                }}
                                autoComplete="off"
                                autoFocus
                            />
                            
                            {/* PIN Dots Display */}
                            <div className="flex gap-5 mb-10">
                                {[0, 1, 2, 3].map(i => (
                                    <div 
                                        key={i} 
                                        className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > i ? 'bg-blue-500 scale-125 shadow-[0_0_15px_#3b82f6]' : 'bg-slate-700'}`}
                                    ></div>
                                ))}
                            </div>
                            
                                                        
                            {/* Virtual PIN Pad */}
                            <div className="grid grid-cols-3 gap-5 w-full">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                    <PinButton 
                                        key={num} 
                                        num={num.toString()} 
                                        onClick={() => handlePinClick(num.toString())} 
                                    />
                                ))}
                                <button 
                                    onClick={clearPin}
                                    className="h-16 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-all active:scale-95 border border-red-500/30"
                                >
                                    C
                                </button>
                                <PinButton num="0" onClick={() => handlePinClick('0')} />
                                <button 
                                    onClick={handleBackspace}
                                    className="h-16 rounded-2xl bg-slate-800/50 hover:bg-red-500/20 text-white flex items-center justify-center transition-all active:scale-95 group border border-white/5"
                                >
                                    <Delete size={24} className="group-hover:text-red-400 transition-colors" />
                                </button>
                            </div>
                            
                            {/* Submit Button */}
                            <button
                                onClick={() => pin.length > 0 && attemptLogin('pin', pin)}
                                disabled={isLoading || pin.length === 0}
                                className={`mt-8 w-full py-4 rounded-xl font-bold transition-all ${
                                    isLoading 
                                        ? 'bg-slate-700 text-slate-300' 
                                        : pin.length === 4
                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20'
                                        : 'bg-slate-800/50 hover:bg-slate-700/70 text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Verificando...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <LogIn size={20} />
                                        <span>{pin.length === 4 ? 'Acceder' : 'Ingresar PIN'}</span>
                                    </div>
                                )}
                            </button>
                            
                        </div>
                    )}

                    {/* Password Login */}
                    {activeTab === 'password' && (
                        <div className="animate-fade-in space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-4 text-center">Acceso Administrativo</h2>
                            
                            <div>
                                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                                    Usuario
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                        placeholder="Ingrese usuario"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                                    Contraseña
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-12 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                                        placeholder="Ingrese contraseña"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <button 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            
                            <button 
                                disabled={isLoading || !username || !password}
                                onClick={() => attemptLogin('password', '')}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
                                <span>Iniciar Sesión</span>
                            </button>
                        </div>
                    )}

                    {/* Barcode Login */}
                    {activeTab === 'barcode' && (
                        <div className="animate-fade-in flex flex-col items-center justify-center text-center h-full py-10">
                            <div className="w-40 h-40 bg-slate-800/50 rounded-full flex items-center justify-center mb-8 border-2 border-dashed border-slate-600 relative group">
                                <Scan size={64} className="text-blue-500 animate-pulse" />
                                <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping opacity-20"></div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Escanee su Credencial</h2>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
                                Acerque su tarjeta de empleado al lector de código de barras para ingresar automáticamente.
                            </p>
                            <form onSubmit={handleBarcodeSubmit} className="w-full max-w-xs">
                                <input 
                                    ref={barcodeRef}
                                    type="text" 
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white text-center focus:ring-2 focus:ring-blue-500 outline-none opacity-50 hover:opacity-100 transition-opacity font-mono"
                                    placeholder="Esperando lectura..."
                                    value={barcodeInput}
                                    onChange={e => setBarcodeInput(e.target.value)}
                                    autoFocus
                                />
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

// Componente para los botones de pestañas
interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-slate-700 text-white shadow-lg ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
    >
        <Icon size={18} />
        <span>{label}</span>
    </button>
);

// Componente para los botones del PIN
interface PinButtonProps {
    num: string;
    onClick: () => void;
}

const PinButton: React.FC<PinButtonProps> = ({ num, onClick }) => (
    <button 
        onClick={onClick}
        className="h-16 w-full rounded-2xl bg-slate-800/50 hover:bg-slate-700 text-white text-2xl font-bold border border-white/5 shadow-sm hover:shadow-md transition-all active:scale-95 active:bg-slate-600"
    >
        {num}
    </button>
);