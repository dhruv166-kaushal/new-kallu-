import { Product, Transaction } from '../types';
import { supabase } from './supabaseClient';

export const dataService = {
  // --- Vendor Management ---
  
  // Register a new vendor ID with a password
  registerVendor: async (vendorId: string, password: string): Promise<{ success: boolean; errorType?: 'EXISTS' | 'DB_ERROR' | null; errorMessage?: string }> => {
    try {
      // Check if exists first
      const { data: existing, error: fetchError } = await supabase
        .from('vendors')
        .select('id')
        .eq('id', vendorId)
        .maybeSingle();

      if (fetchError) {
         console.error("Supabase Check Error:", JSON.stringify(fetchError, null, 2));
         return { success: false, errorType: 'DB_ERROR', errorMessage: fetchError.message };
      }

      if (existing) {
        return { success: false, errorType: 'EXISTS' };
      }

      const { error } = await supabase
        .from('vendors')
        .insert([{ id: vendorId, password: password }]);
      
      if (error) {
        console.error("Supabase Registration Error Details:", JSON.stringify(error, null, 2));
        return { 
          success: false, 
          errorType: 'DB_ERROR', 
          errorMessage: error.message || "Unknown Supabase Error" 
        };
      }
      
      return { success: true };
    } catch (e: any) {
      console.error("Unexpected Error:", e);
      return { success: false, errorType: 'DB_ERROR', errorMessage: e.message || String(e) };
    }
  },

  // Login with password check
  loginVendor: async (vendorId: string, passwordInput: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase
      .from('vendors')
      .select('id, password')
      .eq('id', vendorId)
      .maybeSingle();
    
    if (error) {
        console.error("Login Check Error:", JSON.stringify(error, null, 2));
        return { success: false, error: 'Database Connection Error' };
    }

    if (!data) {
        return { success: false, error: 'Store Name not found. Please Register.' };
    }

    // Password Check
    // If database has no password column yet (old schema), data.password might be undefined.
    // We treat strict equality.
    if (data.password && data.password !== passwordInput) {
        return { success: false, error: 'Incorrect Password' };
    }

    // Fallback: If user created account before passwords were added, let them in (or force reset in future)
    if (!data.password && passwordInput.length > 0) {
        // Optional: Auto-update password for legacy users on first login? 
        // For now, we just allow access to not lock them out.
    }
    
    return { success: true };
  },

  // --- Products ---

  getProducts: async (vendorId: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error fetching products:', JSON.stringify(error, null, 2));
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      stock: item.stock,
      category: item.category || 'General',
      location: item.location || '',
      usage: item.usage || '',
      lowStockThreshold: item.low_stock_threshold || 2
    }));
  },

  saveProduct: async (vendorId: string, product: Product): Promise<Product[]> => {
    const dbProduct = {
      vendor_id: vendorId,
      name: product.name,
      price: product.price,
      stock: product.stock,
      location: product.location,
      usage: product.usage,
      low_stock_threshold: product.lowStockThreshold,
      category: product.category
    };

    const payload: any = { ...dbProduct };
    if (product.id && product.id.length > 20) { 
       payload.id = product.id; 
    }

    const { error } = await supabase.from('products').upsert(payload);

    if (error) console.error('Error saving product:', JSON.stringify(error, null, 2));
    
    return dataService.getProducts(vendorId);
  },

  bulkUpsertProducts: async (vendorId: string, newItems: Partial<Product>[]): Promise<Product[]> => {
    const currentProducts = await dataService.getProducts(vendorId);
    const updates: any[] = [];
    const inserts: any[] = [];

    newItems.forEach(newItem => {
      if (!newItem.name) return;
      const existing = currentProducts.find(p => p.name.toLowerCase() === newItem.name!.toLowerCase());

      if (existing) {
        updates.push({
          id: existing.id,
          vendor_id: vendorId,
          stock: existing.stock + (newItem.stock || 0),
          price: newItem.price || existing.price,
        });
      } else {
        inserts.push({
          vendor_id: vendorId,
          name: newItem.name,
          price: newItem.price || 0,
          stock: newItem.stock || 0,
          location: newItem.location || 'Unsorted',
          usage: newItem.usage || 'General',
          low_stock_threshold: newItem.lowStockThreshold || 2,
          category: 'General'
        });
      }
    });

    if (updates.length > 0) {
      const { error } = await supabase.from('products').upsert(updates);
      if (error) console.error("Bulk Update Error:", JSON.stringify(error, null, 2));
    }
    if (inserts.length > 0) {
      const { error } = await supabase.from('products').insert(inserts);
      if (error) console.error("Bulk Insert Error:", JSON.stringify(error, null, 2));
    }

    return dataService.getProducts(vendorId);
  },

  deleteProduct: async (vendorId: string, id: string): Promise<Product[]> => {
    const { error } = await supabase.from('products').delete().eq('id', id).eq('vendor_id', vendorId);
    if (error) console.error("Delete Error:", JSON.stringify(error, null, 2));
    return dataService.getProducts(vendorId);
  },

  updateStock: async (vendorId: string, items: { id: string; quantity: number }[]): Promise<Product[]> => {
    const products = await dataService.getProducts(vendorId);
    
    for (const item of items) {
      const product = products.find(p => p.id === item.id);
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.id);
      }
    }
    return dataService.getProducts(vendorId);
  },

  // --- Transactions ---

  getTransactions: async (vendorId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('timestamp', { ascending: false });

    if (error) {
        console.error("Get Transactions Error:", JSON.stringify(error, null, 2));
        return [];
    }

    return data.map((t: any) => ({
      id: t.id,
      timestamp: Number(t.timestamp),
      items: t.items,
      subtotal: t.subtotal,
      discount: t.discount,
      total: t.total,
      paymentMethod: t.payment_method,
      remark: t.remark
    }));
  },

  saveTransaction: async (vendorId: string, transaction: Transaction): Promise<Transaction[]> => {
    const dbTx = {
      vendor_id: vendorId,
      timestamp: transaction.timestamp,
      items: transaction.items,
      subtotal: transaction.subtotal,
      discount: transaction.discount,
      total: transaction.total,
      payment_method: transaction.paymentMethod,
      remark: transaction.remark
    };

    const { error } = await supabase.from('transactions').insert(dbTx);
    if (error) console.error("Save Transaction Error:", JSON.stringify(error, null, 2));

    return dataService.getTransactions(vendorId);
  },

  resetTransactions: async (vendorId: string): Promise<{success: boolean, transactions: Transaction[], error?: string}> => {
    const { error } = await supabase.from('transactions').delete().eq('vendor_id', vendorId);
    
    if (error) {
        console.error("Reset Transactions Error:", JSON.stringify(error, null, 2));
        const current = await dataService.getTransactions(vendorId);
        return { success: false, transactions: current, error: error.message };
    }
    
    return { success: true, transactions: [] };
  }
};