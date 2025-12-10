import React from 'react';
import { Transaction } from '../types';
import { X, Printer, Camera } from 'lucide-react';

interface BillGeneratorProps {
  transaction: Transaction;
  onClose: () => void;
}

export const BillGenerator: React.FC<BillGeneratorProps> = ({ transaction, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Hidden on Print */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 no-print">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Camera size={18} className="text-emerald-600" /> Bill Generated
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* PRINTABLE CONTENT START */}
        <div className="p-8 overflow-y-auto flex-1 bg-white" id="printable-section">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">New Kallu Medical Store</h1>
            <p className="text-sm text-slate-600 font-medium mt-1">Managed by Rinku</p>
            <div className="w-16 h-1 bg-emerald-500 mx-auto mt-2 rounded-full no-print"></div>
          </div>

          <div className="mb-6 text-sm text-slate-500 flex justify-between border-b border-slate-100 pb-4">
            <div className="text-left space-y-1">
              <p><span className="font-semibold text-slate-700">Date:</span> {new Date(transaction.timestamp).toLocaleDateString()}</p>
              <p><span className="font-semibold text-slate-700">Time:</span> {new Date(transaction.timestamp).toLocaleTimeString()}</p>
            </div>
            <div className="text-right space-y-1">
              <p><span className="font-semibold text-slate-700">Bill ID:</span> #{transaction.id.slice(-6)}</p>
              <p className="capitalize"><span className="font-semibold text-slate-700">Mode:</span> {transaction.paymentMethod}</p>
            </div>
          </div>

          {transaction.remark && (
            <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
               <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Customer / Remark</p>
               <p className="text-sm text-slate-800 font-medium">{transaction.remark}</p>
            </div>
          )}

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-slate-800 text-slate-600">
                <th className="text-left py-2 font-bold">Item Description</th>
                <th className="text-center py-2 font-bold">Qty</th>
                <th className="text-right py-2 font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaction.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 text-slate-800 font-medium">{item.name}</td>
                  <td className="py-2.5 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-2.5 text-right text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</td>
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
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                <span>Discount Applied</span>
                <span>-₹{transaction.discount.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between items-end pt-2 border-t border-slate-100">
              <div className="text-sm text-slate-500">
                Total Items: {transaction.items.reduce((a, b) => a + b.quantity, 0)}
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Amount</div>
                <div className="text-3xl font-bold text-emerald-600">₹{transaction.total.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400">
            <p>Thank you for visiting New Kallu Medical Store!</p>
            <p className="mt-1">Please take a screenshot of this bill for your records.</p>
          </div>
        </div>
        {/* PRINTABLE CONTENT END */}

        {/* Footer - Hidden on Print */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3 no-print">
          <button 
            onClick={() => window.print()} 
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-lg font-medium"
          >
            <Printer size={18} /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};