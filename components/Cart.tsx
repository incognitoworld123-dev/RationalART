import React from 'react';
import { CartItem } from '../types';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemove, onCheckout }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-stone-950 border-l border-stone-800 h-full flex flex-col shadow-2xl shadow-amber-900/20 animate-slide-in">
        <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <h2 className="text-2xl serif text-amber-500 flex items-center gap-2">
            <ShoppingBag /> Requisition
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center text-stone-500 mt-10">
              <p className="mb-4 text-lg">Your inventory is empty.</p>
              <p className="text-sm italic">"To say 'I love you' one must first know how to say the 'I'."</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex gap-4 bg-stone-900/50 p-4 border border-stone-800">
                <img src={item.imageUrl} alt={item.title} className="w-20 h-24 object-cover border border-stone-700" />
                <div className="flex-1">
                  <h3 className="font-serif text-stone-200">{item.title}</h3>
                  <p className="text-amber-600 text-sm font-semibold">₹{item.price}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 border border-stone-700 bg-stone-950">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-stone-800 text-stone-400"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm w-4 text-center text-white">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-stone-800 text-stone-400"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-stone-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-stone-800 bg-stone-900">
            <div className="flex justify-between mb-4 text-lg font-serif">
              <span className="text-stone-400">Total Value</span>
              <span className="text-amber-500 font-bold">₹{total}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full py-4 bg-amber-600 text-black font-bold uppercase tracking-wider hover:bg-amber-500 transition-colors"
            >
              Proceed to Exchange
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
