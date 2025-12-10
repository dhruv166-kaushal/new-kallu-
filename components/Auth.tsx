import React, { useState } from 'react';
import { Store, UserCircle, KeyRound, ArrowRight, UserPlus, LogIn, Loader2, AlertCircle, Database } from 'lucide-react';
import { dataService } from '../services/dataService';
import { SupabaseGuide } from './SupabaseGuide';

interface AuthProps {
  onLogin: (vendorId: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (vendorName.trim().length === 0) {
      setError("Please enter a store name.");
      return;
    }

    setIsLoading(true);
    // Normalize vendor ID to be lowercase/trimmed for storage keys
    const vendorId = vendorName.trim().toLowerCase().replace(/\s+/g, '_');

    try {
      if (isRegistering) {
        // Registration Logic
        const result = await dataService.registerVendor(vendorId);
        if (result.success) {
          onLogin(vendorId);
        } else if (result.errorType === 'EXISTS') {
          setError("This Store Name is already taken. Please switch to Login below.");
        } else {
          // Display the specific error message from Supabase to help the user
          const msg = result.errorMessage || "Unknown Database Error";
          
          if (msg.includes('row-level security') || msg.includes('policy')) {
              setError("Permission Denied: Database is locked. Please click 'Database Setup Guide' below.");
          } else if (msg.includes('relation') && msg.includes('does not exist')) {
              setError("Tables Missing: Please click 'Database Setup Guide' below.");
          } else {
              setError(`Database Error: ${msg}`);
          }
        }
      } else {
        // Login Logic
        const exists = await dataService.vendorExists(vendorId);
        if (exists) {
          onLogin(vendorId);
        } else {
          setError("Store not found. Please Register first.");
        }
      }
    } catch (e: any) {
      console.error(e);
      setError(`Connection error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (showGuide) {
    return <SupabaseGuide onClose={() => setShowGuide(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Store className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">New Kallu Medical Store</h1>
          <p className="text-emerald-100 font-medium">by Rinku</p>
        </div>

        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-800">
              {isRegistering ? 'Register New Store' : 'Vendor Login'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isRegistering 
                ? 'Create a unique ID for your shop to start tracking.' 
                : 'Enter your vendor name to access your data.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Store / Vendor Name
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  required
                  placeholder={isRegistering ? "Create unique name..." : "e.g. main_store_01"}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  value={vendorName}
                  onChange={(e) => {
                    setVendorName(e.target.value);
                    setError(null);
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 text-right">
                (Simulated for demo)
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start gap-2 text-left animate-pulse">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <span className="break-words w-full">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-2 shadow-lg group disabled:bg-slate-500"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isRegistering ? (
                <>Create Store <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              ) : (
                 <>Open My Store <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          {/* Help Button */}
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="w-full mt-3 py-3 border-2 border-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2 text-sm"
          >
            <Database size={16} className="text-emerald-600" />
            Database Setup Guide (Fix Errors)
          </button>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
                setVendorName('');
              }}
              disabled={isLoading}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline flex items-center justify-center gap-2 w-full"
            >
              {isRegistering ? (
                <><LogIn size={16} /> Already have an account? Login</>
              ) : (
                <><UserPlus size={16} /> New Vendor? Register here</>
              )}
            </button>
          </div>
        </div>
        <div className="p-4 bg-slate-50 text-center text-xs text-slate-400 border-t border-slate-100">
          Created by Dhruv Kaushal
        </div>
      </div>
    </div>
  );
};