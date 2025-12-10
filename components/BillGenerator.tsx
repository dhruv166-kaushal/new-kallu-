import React from 'react';
import { Transaction } from '../types';
import { X, Printer } from 'lucide-react';

interface BillGeneratorProps {
  transaction: Transaction;
  onClose: () => void;
}

export const BillGenerator: React.FC<BillGeneratorProps> = ({ transaction, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Hidden on Print */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 no-print">
          <h3 className="font-semibold text-slate-800">Transaction Receipt</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* PRINTABLE CONTENT START */}
        <div className="p-8 overflow-y-auto flex-1 bg-white" id="printable-section">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 uppercase">New Kallu Medical Store</h1>
            <p className="text-sm text-slate-600 font-medium mt-1">by Rinku</p>
            <div className="w-16 h-1 bg-emerald-500 mx-auto mt-2 rounded-full no-print"></div>
          </div>

          <div className="mb-6 text-sm text-slate-500 flex justify-between">
            <div className="text-left">
              <p>Date: {new Date(transaction.timestamp).toLocaleDateString()}</p>
              <p>Time: {new Date(transaction.timestamp).toLocaleTimeString()}</p>
            </div>
            <div className="text-right">
              <p>ID: #{transaction.id.slice(-6)}</p>
              <p className="capitalize">Pay: {transaction.paymentMethod}</p>
            </div>
          </div>

          <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
             <p className="text-xs text-slate-400 uppercase font-bold mb-1">Remark</p>
             <p className="text-sm text-slate-800">{transaction.remark}</p>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-slate-100 text-slate-500">
                <th className="text-left py-2 font-semibold">Item</th>
                <th className="text-center py-2 font-semibold">Qty</th>
                <th className="text-right py-2 font-semibold">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transaction.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 text-slate-800">{item.name}</td>
                  <td className="py-2 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-2 text-right text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-slate-800 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
               <span>Subtotal</span>
               <span>₹{transaction.subtotal ? transaction.subtotal.toFixed(2) : transaction.total.toFixed(2)}</span>
            </div>
            {transaction.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount</span>
                <span>-₹{transaction.discount.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between items-end pt-2 border-t border-slate-100">
              <div className="text-sm text-slate-500">
                Total Items: {transaction.items.reduce((a, b) => a + b.quantity, 0)}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 uppercase">Total Amount</div>
                <div className="text-3xl font-bold text-emerald-600">₹{transaction.total.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400">
            <p>Thank you for your business!</p>
            <p className="mt-2 text-slate-300">Created by Dhruv Kaushal</p>
          </div>
        </div>
        {/* PRINTABLE CONTENT END */}

        {/* Footer - Hidden on Print */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3 no-print">
          <button 
            onClick={() => window.print()} 
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-lg"
          >
            <Printer size={18} /> Print Bill
          </button>
        </div>
      </div>
    </div>
  );
};