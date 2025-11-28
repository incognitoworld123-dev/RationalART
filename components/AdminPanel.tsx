import React, { useState } from 'react';
import { Product, UserRequest } from '../types';
import { generateShirtConcept } from '../services/geminiService';
import { Sparkles, Plus, Loader2, Package, Upload, Users, MessageSquare, ImageIcon, Palette, Type } from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  requests: UserRequest[];
  onAddProduct: (product: Product) => void;
  onUpdateStock: (id: string, stock: number) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ products, requests, onAddProduct, onUpdateStock, onClose }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests'>('inventory');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    title: '',
    quote: '',
    description: '',
    price: 0,
    stock: 50,
    imageUrl: 'https://picsum.photos/seed/new/400/500'
  });

  const handleGenerate = async () => {
    // Attempt to enable Paid Key for better images
    if (window.aistudio) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      } catch (e) {
        console.error("API Key check failed", e);
      }
    }

    setIsGenerating(true);
    try {
      const generated = await generateShirtConcept();
      setNewProduct(prev => ({ ...prev, ...generated }));
    } catch (e) {
      alert("AI Generation Failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.title && newProduct.price) {
      onAddProduct({
        ...newProduct,
        id: Date.now().toString(),
      } as Product);
      setNewProduct({
        title: '', quote: '', description: '', price: 0, stock: 50, imageUrl: 'https://picsum.photos/seed/next/400/500'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-stone-950/95 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-stone-800 pb-4">
          <h2 className="text-3xl serif text-amber-500">Industrial Management</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-white underline">Exit Control</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Add New Product - Takes 2 cols */}
          <div className="lg:col-span-2 bg-stone-900 p-6 border border-stone-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl text-white font-serif">Fabricate New Asset</h3>
              <button 
                type="button" 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 text-xs bg-purple-900 text-purple-200 px-3 py-1 rounded border border-purple-700 hover:bg-purple-800 transition-colors"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                AI Concept
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-stone-500 uppercase mb-1">Product Title</label>
                <input 
                  type="text" 
                  value={newProduct.title}
                  onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                  className="w-full bg-stone-950 border border-stone-700 text-white p-2 focus:border-amber-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 uppercase mb-1">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-stone-800 border border-stone-700 flex-shrink-0 overflow-hidden">
                    {newProduct.imageUrl && <img src={newProduct.imageUrl} className="w-full h-full object-cover" alt="Preview" />}
                  </div>
                  <label className="flex-1 cursor-pointer bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 py-2 px-4 flex items-center justify-center gap-2 text-sm transition-colors">
                    <Upload size={16} /> Upload Custom Image
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs text-stone-500 uppercase mb-1">Philosophical Quote</label>
                <textarea 
                  value={newProduct.quote}
                  onChange={e => setNewProduct({...newProduct, quote: e.target.value})}
                  className="w-full bg-stone-950 border border-stone-700 text-white p-2 focus:border-amber-500 outline-none h-20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 uppercase mb-1">Description</label>
                <textarea 
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full bg-stone-950 border border-stone-700 text-white p-2 focus:border-amber-500 outline-none h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-stone-500 uppercase mb-1">Price (INR)</label>
                  <input 
                    type="number" 
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    className="w-full bg-stone-950 border border-stone-700 text-white p-2 focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 uppercase mb-1">Initial Stock</label>
                  <input 
                    type="number" 
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                    className="w-full bg-stone-950 border border-stone-700 text-white p-2 focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-stone-100 text-black font-bold py-3 hover:bg-white flex justify-center gap-2 items-center"
              >
                <Plus size={18} /> Produce
              </button>
            </form>
          </div>

          {/* Right Panel - Tabbed - Takes 3 cols */}
          <div className="lg:col-span-3 bg-stone-900 border border-stone-800 flex flex-col max-h-[800px]">
             <div className="flex border-b border-stone-800">
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className={`flex-1 py-4 font-serif text-lg flex items-center justify-center gap-2 transition-colors ${activeTab === 'inventory' ? 'bg-stone-800 text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
                >
                  <Package size={20} /> Inventory
                </button>
                <button 
                  onClick={() => setActiveTab('requests')}
                  className={`flex-1 py-4 font-serif text-lg flex items-center justify-center gap-2 transition-colors ${activeTab === 'requests' ? 'bg-stone-800 text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
                >
                  <Users size={20} /> Market Demand
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6">
               {activeTab === 'inventory' ? (
                 <div className="space-y-3">
                   {products.map(p => (
                     <div key={p.id} className="flex items-center justify-between bg-stone-950 p-3 border border-stone-800">
                       <div className="flex items-center gap-3">
                         <img src={p.imageUrl} className="w-10 h-10 object-cover border border-stone-700" alt="" />
                         <div>
                           <div className="text-stone-200 font-medium">{p.title}</div>
                           <div className="text-xs text-stone-500">ID: {p.id}</div>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <label className="text-xs text-stone-600 uppercase">Qty:</label>
                         <input 
                           type="number" 
                           value={p.stock}
                           onChange={(e) => onUpdateStock(p.id, parseInt(e.target.value) || 0)}
                           className="w-16 bg-stone-900 border border-stone-700 text-white text-center p-1 focus:border-amber-500 outline-none"
                         />
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="space-y-4">
                    {requests.length === 0 ? (
                      <div className="text-center text-stone-500 py-10">No market requests yet.</div>
                    ) : (
                      requests.map(req => (
                        <div key={req.id} className="bg-stone-950 p-4 border border-stone-800 flex gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-serif text-amber-500 text-lg">{req.customerName}</h4>
                              <span className="text-xs text-stone-600">{new Date(req.date).toLocaleDateString()}</span>
                            </div>
                            
                            {/* Request Details Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div>
                                    <div className="text-xs text-stone-500 uppercase">Style</div>
                                    <div className="text-stone-300 text-sm">{req.stylePreference}</div>
                                </div>
                                {(req.shirtColor || req.fontStyle) && (
                                    <div className="flex gap-4">
                                        {req.shirtColor && (
                                            <div>
                                                <div className="text-xs text-stone-500 uppercase flex items-center gap-1"><Palette size={10} /> Color</div>
                                                <div className="text-stone-300 text-sm capitalize">{req.shirtColor}</div>
                                            </div>
                                        )}
                                        {req.fontStyle && (
                                            <div>
                                                <div className="text-xs text-stone-500 uppercase flex items-center gap-1"><Type size={10} /> Font</div>
                                                <div className="text-stone-300 text-sm">{req.fontStyle}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-stone-900 p-3 border-l-2 border-amber-600">
                               <MessageSquare size={14} className="inline mr-2 text-stone-500"/>
                               <span className="italic text-stone-400">"{req.quote}"</span>
                            </div>
                          </div>
                          {req.generatedImageUrl && (
                            <div className="w-24 flex-shrink-0">
                               <div className="text-xs text-stone-500 uppercase mb-1">Concept</div>
                               <img src={req.generatedImageUrl} alt="Concept" className="w-full h-32 object-cover border border-stone-700" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};