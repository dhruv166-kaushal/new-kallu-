import React, { useMemo } from 'react';
import { Transaction, Product } from '../types';
import { TrendingUp, Package, AlertTriangle, List, Trash2 } from 'lucide-react';

interface SalesSummaryProps {
  transactions: Transaction[];
  products: Product[];
  onResetHistory?: () => void;
}

export const SalesSummary: React.FC<SalesSummaryProps> = ({ transactions, products, onResetHistory }) => {
  
  const stats = useMemo(() => {
    const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
    
    // Calculate items sold per product
    const soldCounts: Record<string, number> = {};
    transactions.forEach(t => {
      t.items.forEach(item => {
        soldCounts[item.name] = (soldCounts[item.name] || 0) + item.quantity;
      });
    });

    // Create sorted list of sold items (The "Order List" concept)
    const orderList = Object.entries(soldCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return { totalRevenue, orderList };
  }, [transactions]);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sales & Order List</h2>
          <p className="text-slate-500 text-sm">Track your overall sales and see the full order list.</p>
        </div>
        {onResetHistory && transactions.length > 0 && (
          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to delete all sales history? This cannot be undone.')) {
                onResetHistory();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
          >
            <Trash2 size={16} /> Reset History
          </button>
        )}
      </header>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-sm text-slate-500 font-medium">Total Revenue</div>
            <div className="text-2xl font-bold text-slate-800">₹{stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <div className="text-sm text-slate-500 font-medium">Total Transactions</div>
            <div className="text-2xl font-bold text-slate-800">{transactions.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-sm text-slate-500 font-medium">Low Stock Alerts</div>
            <div className="text-2xl font-bold text-slate-800">
              {products.filter(p => p.stock <= (p.lowStockThreshold || 10)).length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order List / Most Sold */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ring-4 ring-slate-50">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <List size={18} className="text-emerald-600" />
            <h3 className="font-bold text-slate-800">Order List (Overall Items Sold)</h3>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="p-4">Item Name</th>
                  <th className="p-4 text-right">Total Quantity Sold</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.orderList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400">No sales recorded yet.</td>
                  </tr>
                ) : (
                  stats.orderList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-700">{item.name}</td>
                      <td className="p-4 text-right font-bold text-emerald-600">{item.count}</td>
                      <td className="p-4 text-right">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Sold</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <List size={18} className="text-slate-500" />
            <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
          </div>
          <div className="p-0">
             <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {transactions.slice().reverse().map(t => (
                  <div key={t.id} className="p-4 hover:bg-slate-50 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-slate-800">Order #{t.id.slice(-6)}</div>
                      <div className="text-xs text-slate-500">{new Date(t.timestamp).toLocaleDateString()} at {new Date(t.timestamp).toLocaleTimeString()}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {t.items.length} items: {t.items.map(i => i.name).join(', ').slice(0, 30)}...
                      </div>
                       {/* Show Remark in history */}
                       <div className="text-xs text-slate-500 italic mt-1 bg-slate-100 p-1 rounded inline-block">
                         Remark: {t.remark}
                       </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-800">₹{t.total.toFixed(2)}</div>
                      <div className="text-xs uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500 inline-block mt-1">{t.paymentMethod}</div>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="p-8 text-center text-slate-400">No transactions yet.</div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};