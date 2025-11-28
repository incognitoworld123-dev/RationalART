import React, { useState, useEffect } from 'react';
import { Product, CartItem, PaymentMode, UserRequest, UserProfile } from './types';
import { getProducts, saveProduct, saveOrder, getRequests, saveRequest, STORAGE_KEYS } from './services/storageService';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { AdminPanel } from './components/AdminPanel';
import { Checkout } from './components/Checkout';
import { RequestModal } from './components/RequestModal';
import { AuthModal } from './components/AuthModal';
import { ShoppingCart, Settings, DollarSign, PenTool, User, LogOut } from 'lucide-react';

function App() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{isOpen: boolean, view: 'USER' | 'ADMIN'}>({ isOpen: false, view: 'USER' });
  
  // Load initial data
  useEffect(() => {
    setProducts(getProducts());
    setRequests(getRequests());
    
    // Restore User Session
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Auth Handlers
  const handleUserLogin = (userProfile: UserProfile) => {
    setUser(userProfile);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile));
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setIsAdminOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setIsAdminAuthenticated(false);
  };

  const openAdminPanel = () => {
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setAuthModal({ isOpen: true, view: 'ADMIN' });
    }
  };

  // Cart Actions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    // Check stock limit
    const product = products.find(p => p.id === id);
    if (product && qty > product.stock) {
      alert("Cannot exceed available stock.");
      return;
    }

    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Admin Actions
  const handleAddProduct = (product: Product) => {
    saveProduct(product);
    setProducts(getProducts());
  };

  const handleUpdateStock = (id: string, stock: number) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const updated = { ...product, stock };
      saveProduct(updated);
      setProducts(getProducts());
    }
  };

  // Order Actions
  const handleCompleteOrder = (details: { name: string; address: string; mode: PaymentMode }) => {
    const order = {
      id: Date.now().toString(),
      items: cart,
      totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      paymentMode: details.mode,
      date: new Date().toISOString(),
      status: 'PENDING' as const,
      customerName: details.name,
      customerAddress: details.address
    };
    
    saveOrder(order);
    setProducts(getProducts()); // Update stock in UI
    setCart([]); // Clear cart
  };

  // Request Actions
  const handleSaveRequest = (data: Omit<UserRequest, 'id' | 'date'>) => {
    const newRequest: UserRequest = {
      ...data,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    saveRequest(newRequest);
    setRequests(getRequests()); // Refresh list
    alert("Your request has been submitted to the architects.");
  };

  const scrollToShop = () => {
    const element = document.getElementById('shop');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-200">
      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-stone-950/90 backdrop-blur border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 flex items-center justify-center text-black font-bold rounded-sm">
                <DollarSign size={24} strokeWidth={3} />
              </div>
              <span className="text-2xl font-serif font-bold tracking-tight text-white hidden sm:block">
                the<span className="text-amber-500 font-extrabold italic mx-0.5">I</span>shop
              </span>
            </div>

            <div className="flex items-center gap-6">
              {/* User Profile / Login */}
              {user ? (
                <div className="flex items-center gap-3 bg-stone-900 border border-stone-800 rounded-full pl-1 pr-3 py-1">
                  <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                  <span className="text-xs text-stone-300 font-medium hidden md:block">{user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="ml-2 text-stone-500 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setAuthModal({ isOpen: true, view: 'USER' })}
                  className="text-stone-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <User size={18} />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              <button 
                onClick={() => setIsRequestOpen(true)}
                className="text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-2 text-sm font-medium border border-amber-900/50 px-3 py-1 rounded bg-amber-950/20"
              >
                <PenTool size={16} />
                <span className="hidden sm:inline">Request Design</span>
              </button>

              <button 
                onClick={openAdminPanel}
                className="text-stone-400 hover:text-amber-500 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Settings size={18} />
                <span className="hidden sm:inline">Admin</span>
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="text-stone-200 hover:text-amber-500 transition-colors relative p-2"
                >
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-amber-600 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-stone-900 border-b border-stone-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
            Wear Your <span className="text-amber-500">Mind</span>.
          </h1>
          <p className="max-w-2xl text-lg text-stone-400 mb-8 font-light">
            "I swear by my life and my love of it that I will never live for the sake of another man, nor ask another man to live for mine."
          </p>
          <div className="flex gap-4">
            <button onClick={scrollToShop} className="border border-amber-500 text-amber-500 px-8 py-3 uppercase tracking-widest text-sm font-bold hover:bg-amber-500 hover:text-black transition-all">
              Enter the Market
            </button>
            <button onClick={() => setIsRequestOpen(true)} className="text-stone-300 px-8 py-3 uppercase tracking-widest text-sm font-bold hover:text-white transition-all underline decoration-stone-600 hover:decoration-white">
              Commission
            </button>
          </div>
        </div>
      </div>

      {/* Main Shop */}
      <main id="shop" className="flex-grow max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-10 border-b border-stone-800 pb-4">
          <h2 className="text-3xl font-serif text-white">The Collection</h2>
          <span className="text-stone-500 text-sm font-mono">{products.length} ASSETS AVAILABLE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={addToCart} 
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-950 border-t border-stone-900 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-amber-800 mb-4">
            <DollarSign className="mx-auto" size={32} />
          </div>
          <p className="text-stone-600 text-sm mb-2">© {new Date().getFullYear()} theIshop.</p>
          <p className="text-stone-700 text-xs">"A is A."</p>
        </div>
      </footer>

      {/* Overlays */}
      <AuthModal 
        isOpen={authModal.isOpen}
        initialView={authModal.view}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        onUserLogin={handleUserLogin}
        onAdminLogin={handleAdminLogin}
      />

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cart} 
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {isAdminOpen && (
        <AdminPanel 
          products={products}
          requests={requests}
          onAddProduct={handleAddProduct}
          onUpdateStock={handleUpdateStock}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      <RequestModal 
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        onSubmit={handleSaveRequest}
        initialName={user?.name}
      />

      <Checkout 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        totalAmount={cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
        onCompleteOrder={handleCompleteOrder}
        initialName={user?.name}
      />
    </div>
  );
}

export default App;