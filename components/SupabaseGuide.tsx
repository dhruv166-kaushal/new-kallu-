import React from 'react';
import { Database, Terminal, ShieldCheck, ArrowLeft, Copy, Check } from 'lucide-react';

interface GuideProps {
  onClose?: () => void;
}

export const SupabaseGuide: React.FC<GuideProps> = ({ onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const sqlScript = `-- 1. Create Tables (Safe to run multiple times)
create table if not exists vendors (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  vendor_id text not null references vendors(id) on delete cascade,
  name text not null,
  price numeric not null,
  stock integer not null default 0,
  location text,
  usage text,
  low_stock_threshold integer default 2,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  vendor_id text not null references vendors(id) on delete cascade,
  timestamp bigint not null,
  items jsonb not null, 
  subtotal numeric,
  discount numeric,
  total numeric not null,
  payment_method text,
  remark text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. CRITICAL: Disable Row Level Security (Fixes "Permission Denied" / "Simply Not Working")
alter table vendors disable row level security;
alter table products disable row level security;
alter table transactions disable row level security;

-- 3. Optimization Indexes
create index if not exists idx_products_vendor on products(vendor_id);
create index if not exists idx_transactions_vendor on transactions(vendor_id);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-full overflow-y-auto bg-slate-50">
      {onClose && (
        <button 
          onClick={onClose}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Back to Login
        </button>
      )}

      <header className="mb-8 border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Database className="text-emerald-600" /> Database Setup
        </h2>
        <p className="text-slate-600 mt-2">
          If the app is <strong>"not working"</strong>, <strong>"stuck loading"</strong>, or saying <strong>"Permission Denied"</strong>, you MUST run this script in Supabase once.
        </p>
      </header>

      <div className="space-y-8 pb-12">
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden ring-4 ring-emerald-50">
           <div className="absolute top-0 right-0 p-4 opacity-10">
            <Terminal size={100} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-mono">1</span>
            Copy & Run this SQL
          </h3>
          <p className="text-slate-600 mb-4 text-sm">
            1. Go to your Supabase Dashboard.<br/>
            2. Click <strong>SQL Editor</strong> in the left sidebar.<br/>
            3. Paste this code and click <strong>Run</strong>.
          </p>
          
          <div className="relative">
            <button 
              onClick={handleCopy}
              className="absolute right-2 top-2 p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs flex items-center gap-2 transition"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy SQL'}
            </button>
            <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner h-64">
              <pre>{sqlScript}</pre>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck size={100} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-mono">2</span>
            Why do I need this?
          </h3>
          <ul className="space-y-3 text-slate-600 text-sm">
            <li className="flex gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Creates Tables:</strong> The app needs places to store Vendors, Products, and Transactions.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Disables RLS:</strong> By default, Supabase blocks all connections. This script opens the database so your specific Vendor ID can save data.</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};