import React from 'react';
import { LogOut, Monitor, User as UserIcon } from 'lucide-react';
import { ViewState } from '../types';
import { useDatabase } from '../context/DatabaseContext';

interface HeaderProps {
  setView: (view: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ setView }) => {
  const { currentUser, logout } = useDatabase();

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setView('DASHBOARD')}
      >
        <div className="relative w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white shadow-lg transform group-hover:scale-105 transition-transform">
            <Monitor size={24} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tighter group-hover:text-slate-600 transition-colors font-sans">
          CG<span className="font-light">System</span>
        </h1>
      </div>
      
      {currentUser && (
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{currentUser.role}</p>
            <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                {currentUser.fullName}
            </p>
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition-colors px-4 py-2 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      )}
    </div>
  );
};