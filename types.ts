export interface Product {
  id: string;
  title: string;
  quote: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string; // Placeholder URL or Base64
}

export interface CartItem extends Product {
  quantity: number;
}

export enum PaymentMode {
  COD = 'COD',
  UPI = 'UPI',
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  paymentMode: PaymentMode;
  date: string;
  status: 'PENDING' | 'COMPLETED';
  customerName: string;
  customerAddress: string;
}

export interface UserRequest {
  id: string;
  customerName: string;
  quote: string;
  stylePreference: string;
  shirtColor?: string;
  fontStyle?: string;
  date: string;
  generatedImageUrl?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

export interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  addProductToCart: (product: Product) => void;
  removeProductFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isAdmin: boolean;
  toggleAdmin: () => void;
  refreshProducts: () => void;
  addProduct: (product: Product) => void;
  updateStock: (productId: string, newStock: number) => void;
}

// Global Interfaces
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    Razorpay: any;
    google?: any;
    aistudio?: AIStudio;
  }
}