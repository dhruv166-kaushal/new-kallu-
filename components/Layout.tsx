import React from 'react';
import { ViewState } from '../types';
import { Store, ShoppingCart, BarChart3, BrainCircuit, LogOut } from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  vendorId: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, onLogout, vendorId, children }) => {
  const navItems = [
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Store },
    { id: 'sales', label: 'Sales & Orders', icon: BarChart3 },
    { id: 'ai-insights', label: 'AI Manager', icon: BrainCircuit },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="bg-slate-900 text-white w-full md:w-72 flex-shrink-0 flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-slate-700 bg-slate-900">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent leading-tight">
            New Kallu Medical Store
          </h1>
          <p className="text-emerald-100/80 text-sm font-medium mt-1">by Rinku</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 p-2 rounded border border-slate-700">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             Vendor: <span className="font-mono text-slate-200">{vendorId}</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id as ViewState)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    currentView === item.id 
                      ? 'bg-emerald-600 text-white shadow-lg translate-x-1' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 border-t border-slate-800 space-y-4">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-2 text-sm"
          >
            <LogOut size={16} /> Logout / Switch Vendor
          </button>
          
          <div className="text-center pt-4 border-t border-slate-800/50">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">System Info</p>
            <p className="text-xs text-slate-400 font-medium">Created by Dhruv Kaushal</p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col bg-slate-50 relative">
        {children}
      </main>
    </div>
  );
};