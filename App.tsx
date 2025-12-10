import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { InventoryManager } from './components/InventoryManager';
import { PointOfSale } from './components/PointOfSale';
import { SalesSummary } from './components/SalesSummary';
import { AiInsights } from './components/AiInsights';
import { Auth } from './components/Auth';
import { AiAssistant } from './components/AiAssistant';
import { SupabaseGuide } from './components/SupabaseGuide';
import { dataService } from './services/dataService';
import { Product, Transaction, ViewState } from './types';

function App() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reload data whenever vendorId changes
  useEffect(() => {
    if (vendorId) {
      refreshData();
    }
  }, [vendorId]);

  const refreshData = async () => {
    if (vendorId) {
      setIsLoading(true);
      try {
        const [fetchedProducts, fetchedTransactions] = await Promise.all([
          dataService.getProducts(vendorId),
          dataService.getTransactions(vendorId)
        ]);
        setProducts(fetchedProducts);
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLogin = (id: string) => {
    setVendorId(id);
    setCurrentView('inventory'); // Reset view on login
  };

  const handleLogout = () => {
    setVendorId(null);
    setProducts([]);
    setTransactions([]);
  };

  const handleSaveProduct = async (product: Product) => {
    if (!vendorId) return;
    setIsLoading(true);
    const updated = await dataService.saveProduct(vendorId, product);
    setProducts(updated);
    setIsLoading(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!vendorId) return;
    setIsLoading(true);
    const updated = await dataService.deleteProduct(vendorId, id);
    setProducts(updated);
    setIsLoading(false);
  };

  const handleCheckout = async (transaction: Transaction) => {
    if (!vendorId) return;
    setIsLoading(true);
    // Save transaction
    const updatedTransactions = await dataService.saveTransaction(vendorId, transaction);
    setTransactions(updatedTransactions);

    // Update stock
    const itemsToUpdate = transaction.items.map(item => ({ id: item.id, quantity: item.quantity }));
    const updatedProducts = await dataService.updateStock(vendorId, itemsToUpdate);
    setProducts(updatedProducts);
    setIsLoading(false);
  };

  const handleResetHistory = async () => {
    if (!vendorId) return;
    setIsLoading(true);
    
    const result = await dataService.resetTransactions(vendorId);
    
    if (result.success) {
        setTransactions([]);
        alert("Sales history has been successfully reset.");
    } else {
        setTransactions(result.transactions); // Revert to previous state
        alert(`Failed to reset history: ${result.error}. \n\nPlease run the SQL script in the 'Help' section to fix permissions.`);
    }
    
    setIsLoading(false);
  };

  // Auth Screen
  if (!vendorId) {
    return <Auth onLogin={handleLogin} />;
  }

  // Main App
  const renderView = () => {
    if (isLoading && products.length === 0 && transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p>Syncing with Database...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'inventory':
        return (
          <InventoryManager 
            products={products} 
            onSave={handleSaveProduct} 
            onDelete={handleDeleteProduct} 
          />
        );
      case 'pos':
        return (
          <PointOfSale 
            products={products} 
            onCheckout={handleCheckout} 
          />
        );
      case 'sales':
        return (
          <SalesSummary 
            transactions={transactions} 
            products={products}
            onResetHistory={handleResetHistory}
          />
        );
      case 'ai-insights':
        return (
          <AiInsights 
            products={products} 
            transactions={transactions} 
          />
        );
      case 'help':
        return <SupabaseGuide />;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView} 
      onLogout={handleLogout}
      vendorId={vendorId}
    >
      {renderView()}
      <AiAssistant vendorId={vendorId} onDataUpdate={refreshData} />
    </Layout>
  );
}

export default App;