import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Trash2, Edit2, Search, Package, MapPin, Stethoscope, AlertOctagon, Filter } from 'lucide-react';

interface InventoryManagerProps {
  products: Product[];
  onSave: (product: Product) => void;
  onDelete: (id: string) => void;
}

type FilterType = 'all' | 'zero-stock' | 'low-stock';

export const InventoryManager: React.FC<InventoryManagerProps> = ({ products, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    stock: 0,
    location: '',
    usage: '',
    lowStockThreshold: 2 // Updated Default to 2
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price === undefined || formData.stock === undefined) return;

    const newProduct: Product = {
      id: isEditing || Date.now().toString(),
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      category: 'General',
      location: formData.location || 'Unassigned',
      usage: formData.usage || 'General Health',
      lowStockThreshold: formData.lowStockThreshold !== undefined ? Number(formData.lowStockThreshold) : 2 // Default to 2
    };

    onSave(newProduct);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', price: 0, stock: 0, location: '', usage: '', lowStockThreshold: 2 });
    setIsEditing(null);
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setIsEditing(product.id);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.usage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ? true :
      filterType === 'zero-stock' ? p.stock === 0 :
      filterType === 'low-stock' ? p.stock > 0 && p.stock <= p.lowStockThreshold : true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-full p-6 gap-6 overflow-hidden">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
          <p className="text-slate-500 text-sm">Add, update, or remove items from your pharmacy.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full overflow-hidden">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit overflow-y-auto max-h-full">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-800">
            {isEditing ? <Edit2 size={18} /> : <Plus size={18} />}
            {isEditing ? 'Update Item' : 'Add New Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g., Paracetamol 500mg"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.price || ''}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Stock</label>
                <input 
                  type="number" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.stock || ''}
                  onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                />
              </div>
            </div>

            {/* Threshold Manual Input */}
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <AlertOctagon size={14} className="text-amber-500" /> Low Stock Alert Value
                </label>
                <input 
                  type="number" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Alert me when stock goes below..."
                  value={formData.lowStockThreshold || ''}
                  onChange={e => setFormData({...formData, lowStockThreshold: parseInt(e.target.value)})}
                />
                <p className="text-[10px] text-slate-500 mt-1">Default is 2 if left blank.</p>
              </div>

            {/* Usage / Condition */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Stethoscope size={14} className="text-slate-400" /> Usage / Issue
              </label>
              <input 
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g., Fever, Stomach Pain, Headache"
                value={formData.usage}
                onChange={e => setFormData({...formData, usage: e.target.value})}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" /> Shop Location
              </label>
              <input 
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g., Shelf A, Rack 3, Drawer 5"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button 
                type="submit" 
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-medium shadow-md shadow-emerald-200"
              >
                {isEditing ? 'Save Changes' : 'Add to Inventory'}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List View */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by name, usage, or location..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 text-sm">
                <button 
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-full border transition-colors ${filterType === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                >
                  All Items
                </button>
                <button 
                  onClick={() => setFilterType('zero-stock')}
                  className={`px-3 py-1.5 rounded-full border transition-colors flex items-center gap-2 ${filterType === 'zero-stock' ? 'bg-red-700 text-white border-red-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-red-50'}`}
                >
                  <Filter size={14} /> Out of Stock (0)
                </button>
                <button 
                  onClick={() => setFilterType('low-stock')}
                  className={`px-3 py-1.5 rounded-full border transition-colors flex items-center gap-2 ${filterType === 'low-stock' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-300 hover:bg-amber-50'}`}
                >
                  <Filter size={14} /> Low Stock
                </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-0">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Package size={48} className="mb-2 opacity-50" />
                <p>No items found.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">Item Details</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">Usage & Location</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right bg-slate-50">Price</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right bg-slate-50">Stock</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right bg-slate-50">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(product => {
                    const isZeroStock = product.stock === 0;
                    return (
                      <tr 
                        key={product.id} 
                        className={`transition-colors group ${isZeroStock ? 'bg-red-100/80 hover:bg-red-200' : 'hover:bg-slate-50'}`}
                      >
                        <td className="p-4">
                          <div className={`font-medium ${isZeroStock ? 'text-red-900' : 'text-slate-800'}`}>{product.name}</div>
                          {isZeroStock && <div className="text-[10px] font-bold text-red-700 uppercase mt-1">Out of Stock</div>}
                        </td>
                        <td className="p-4">
                          <div className={`text-sm flex items-center gap-2 ${isZeroStock ? 'text-red-800' : 'text-slate-700'}`}>
                             <Stethoscope size={14} className={isZeroStock ? 'text-red-700' : 'text-blue-400'} />
                             {product.usage || 'N/A'}
                          </div>
                          <div className={`text-xs mt-1 flex items-center gap-2 ${isZeroStock ? 'text-red-800/70' : 'text-slate-500'}`}>
                             <MapPin size={12} className={isZeroStock ? 'text-red-700' : 'text-amber-500'} />
                             {product.location || 'N/A'}
                          </div>
                        </td>
                        <td className={`p-4 text-right font-mono ${isZeroStock ? 'text-red-900' : 'text-slate-600'}`}>₹{product.price.toFixed(2)}</td>
                        <td className={`p-4 text-right font-medium`}>
                          <span className={`${
                            isZeroStock ? 'text-red-900 font-bold' : 
                            product.stock <= product.lowStockThreshold ? 'text-amber-600 font-bold' : 'text-emerald-600'
                          }`}>
                            {product.stock}
                          </span>
                          <div className="text-[10px] text-slate-400">Limit: {product.lowStockThreshold}</div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(product)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => onDelete(product.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};