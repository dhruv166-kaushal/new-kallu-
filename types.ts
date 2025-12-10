export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  // Category is optional now as we removed the input, keeping for backward compatibility
  category?: string;
  location: string;
  usage: string;
  lowStockThreshold: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  timestamp: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  remark: string;
}

export interface SalesReport {
  totalRevenue: number;
  totalItemsSold: number;
  popularItems: { name: string; count: number }[];
  lowStockAlerts: Product[];
}

export type ViewState = 'pos' | 'inventory' | 'sales' | 'ai-insights' | 'help';