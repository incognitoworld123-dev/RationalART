import React from 'react';
import { Product } from '../types';
import { ShoppingCart, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative bg-stone-900 border border-stone-800 hover:border-amber-600 transition-colors duration-300 overflow-hidden flex flex-col h-full">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-red-500 font-bold border border-red-500 px-4 py-1 tracking-widest uppercase">Sold Out</span>
          </div>
        )}
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-amber-500 serif mb-1">{product.title}</h3>
        <p className="text-xs text-stone-500 uppercase tracking-widest mb-4">Collection: Objectivism</p>
        
        <div className="mb-6 flex-1">
          <p className="text-stone-300 italic font-serif mb-2">"{product.quote}"</p>
          <p className="text-sm text-stone-500 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-800">
          <span className="text-lg font-semibold text-white">₹{product.price}</span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              isOutOfStock 
                ? 'cursor-not-allowed text-stone-600 bg-stone-800' 
                : 'bg-amber-600 text-black hover:bg-amber-500 active:bg-amber-400'
            }`}
          >
            {isOutOfStock ? (
              <>
                <AlertCircle size={16} /> Unavailable
              </>
            ) : (
              <>
                <ShoppingCart size={16} /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};