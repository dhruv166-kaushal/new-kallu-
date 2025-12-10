import React, { useState, useMemo } from 'react';
import { Product, CartItem, Transaction } from '../types';
import { ShoppingCart, Plus, Minus, Trash, Search, CreditCard, MapPin, Stethoscope, AlertCircle, Percent, DollarSign, X } from 'lucide-react';
import { BillGenerator } from './BillGenerator';

interface POSProps {
  products: Product[];
  onCheckout: (transaction: Transaction) => void;
}

export const PointOfSale: React.FC<POSProps> = ({ products, onCheckout }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBill, setShowBill] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  
  // Checkout States
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [remark, setRemark] = useState<string>('');
  const [remarkError, setRemarkError] = useState(false);

  const addToCart = (product: Product) => {
    if (product.stock === 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Don't exceed stock
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const calculatedDiscount = useMemo(() => {
    if (!discountValue || discountValue < 0) return 0;
    let val = 0;
    if (discountType === 'amount') {
      val = discountValue;
    } else {
      val = (subTotal * discountValue) / 100;
    }
    // Discount cannot exceed subtotal
    return Math.min(val, subTotal);
  }, [discountValue, discountType, subTotal]);

  const finalTotal = subTotal - calculatedDiscount;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!remark.trim()) {
      setRemarkError(true);
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      items: [...cart],
      subtotal: subTotal,
      discount: calculatedDiscount,
      total: finalTotal,
      paymentMethod: 'cash', // Default for now
      remark: remark.trim()
    };

    onCheckout(transaction);
    setLastTransaction(transaction);
    setShowBill(true);
    setCart([]);
    setDiscountValue(0);
    setRemark('');
    setRemarkError(false);
    setIsMobileCartOpen(false); // Close mobile cart after checkout
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.usage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex h-full flex-col lg:flex-row overflow-hidden relative">
        {/* Product Grid Area */}
        <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden">
          <div className="p-4 lg:p-6 pb-2">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">New Sale</h2>
                <p className="text-slate-500 text-sm">Find items by name or medical usage.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search name, issue (e.g. fever)..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full outline-none focus:border-emerald-500 shadow-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-24 lg:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className={`flex flex-col p-4 rounded-xl border transition-all text-left group relative ${
                    product.stock === 0 
                      ? 'bg-red-50 border-red-200 opacity-70 cursor-not-allowed' 
                      : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 w-full">
                    {product.stock === 0 && (
                      <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">
                        Out of Stock
                      </span>
                    )}
                    {product.stock > 0 && (
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">
                        In Stock
                        </span>
                    )}
                    <span className="font-bold text-emerald-600">₹{product.price.toFixed(2)}</span>
                  </div>
                  
                  <h3 className="font-semibold text-slate-800 mb-1 leading-tight pr-4">{product.name}</h3>
                  
                  {/* Additional Details for Vendor */}
                  <div className="space-y-1 mt-2 mb-3">
                    {product.usage && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Stethoscope size={12} className="text-blue-400" />
                            <span className="truncate">{product.usage}</span>
                        </div>
                    )}
                    {product.location && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin size={12} className="text-amber-500" />
                            <span className="truncate">{product.location}</span>
                        </div>
                    )}
                  </div>

                  <div className="mt-auto pt-2 border-t border-slate-100 w-full flex justify-between items-center">
                    <div className={`text-xs ${product.stock === 0 ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                        {product.stock} left
                    </div>
                    {product.stock > 0 && (
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Plus size={14} />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {filteredProducts.length === 0 && (
                <div className="text-center text-slate-400 py-10">
                    <p>No medicines found.</p>
                </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Cart Bar (Visible only on small screens) */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">{cart.reduce((acc, item) => acc + item.quantity, 0)} Items</span>
            <span className="text-lg font-bold text-emerald-600">₹{finalTotal.toFixed(2)}</span>
          </div>
          <button 
             onClick={() => setIsMobileCartOpen(true)}
             className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
          >
             <ShoppingCart size={18} /> View Cart
          </button>
        </div>

        {/* Cart Sidebar (Responsive: Modal on mobile, Sidebar on Desktop) */}
        <div className={`
            flex flex-col bg-white shadow-xl z-30 transition-transform duration-300
            fixed inset-0 lg:static lg:w-96 lg:border-l lg:border-slate-200 lg:h-full lg:translate-y-0
            ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-full'}
        `}>
          {/* Mobile Header */}
          <div className="lg:hidden p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
               <ShoppingCart size={20} className="text-emerald-600" /> Current Order
             </h3>
             <button onClick={() => setIsMobileCartOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-red-500">
                <X size={20} />
             </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
              <ShoppingCart size={20} className="text-emerald-600" />
              Current Order
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <ShoppingCart size={24} className="opacity-50" />
                </div>
                <p className="text-sm">Cart is empty</p>
                <button 
                   onClick={() => setIsMobileCartOpen(false)}
                   className="lg:hidden text-emerald-600 text-sm font-medium hover:underline"
                >
                    Go back to add items
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 text-sm">{item.name}</div>
                    <div className="text-xs text-slate-500">₹{item.price.toFixed(2)} / unit</div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-emerald-600"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center text-black">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-emerald-600"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <div className="space-y-3 mb-4">
              {/* Discount Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Discount</label>
                <div className="flex gap-2">
                  <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 shrink-0">
                    <button
                      onClick={() => setDiscountType('amount')}
                      className={`p-1.5 rounded-md transition-all ${discountType === 'amount' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Fixed Amount"
                    >
                      <DollarSign size={16} />
                    </button>
                    <button
                      onClick={() => setDiscountType('percent')}
                      className={`p-1.5 rounded-md transition-all ${discountType === 'percent' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Percentage"
                    >
                      <Percent size={16} />
                    </button>
                  </div>
                  <div className="relative flex-1">
                    <input 
                      type="number"
                      min="0"
                      step={discountType === 'amount' ? "0.01" : "1"}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder={discountType === 'amount' ? "Amount (₹)" : "Percentage (%)"}
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                {discountType === 'percent' && discountValue > 0 && (
                   <div className="text-[10px] text-right text-emerald-600 mt-1 font-medium">
                     - ₹{calculatedDiscount.toFixed(2)}
                   </div>
                )}
              </div>

              {/* Compulsory Remark */}
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                   Remark <span className="text-red-500">*</span>
                 </label>
                 <input 
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${remarkError ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                    placeholder="Patient info or reason..."
                    value={remark}
                    onChange={(e) => {
                      setRemark(e.target.value);
                      if(e.target.value.trim()) setRemarkError(false);
                    }}
                 />
                 {remarkError && <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={10} /> This field is required</span>}
              </div>

              <div className="h-px bg-slate-200 my-2"></div>

              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
               {calculatedDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount {discountType === 'percent' && `(${discountValue}%)`}</span>
                  <span>-₹{calculatedDiscount.toFixed(2)}</span>
                </div>
               )}
              <div className="flex justify-between text-xl font-bold text-slate-800 pt-2">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none transition-all flex justify-center items-center gap-2"
            >
              <CreditCard size={20} />
              Checkout Now
            </button>
          </div>
        </div>
      </div>

      {showBill && lastTransaction && (
        <BillGenerator 
          transaction={lastTransaction} 
          onClose={() => setShowBill(false)} 
        />
      )}
    </>
  );
};