import React, { useState, useEffect } from 'react';
import { X, Send, PenTool, Sparkles, Image as ImageIcon, Loader2, KeyRound, AlertTriangle, Check } from 'lucide-react';
import { UserRequest } from '../types';
import { refineDesignPrompt, generateMerchImage } from '../services/geminiService';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<UserRequest, 'id' | 'date'>) => void;
  initialName?: string;
}

const SHIRT_COLORS = [
  { id: 'black', label: 'Black', class: 'bg-black border-stone-700' },
  { id: 'white', label: 'White', class: 'bg-white border-stone-300' },
  { id: 'charcoal', label: 'Charcoal', class: 'bg-stone-800 border-stone-600' },
  { id: 'navy', label: 'Navy', class: 'bg-blue-950 border-blue-800' },
  { id: 'red', label: 'Red', class: 'bg-red-900 border-red-800' },
];

const FONT_STYLES = [
  'Art Deco',
  'Minimalist Sans',
  'Classic Serif',
  'Bold Industrial',
  'Handwritten',
  'Gothic',
  'Typewriter'
];

export const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, onSubmit, initialName }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    quote: '', // This field holds the text/concept
    stylePreference: '',
    shirtColor: 'black',
    fontStyle: 'Art Deco'
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFallbackImage, setIsFallbackImage] = useState(false);

  useEffect(() => {
    if (isOpen && initialName) {
      setFormData(prev => ({ ...prev, customerName: initialName }));
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      generatedImageUrl: generatedImage || undefined
    });
    setFormData({ customerName: initialName || '', quote: '', stylePreference: '', shirtColor: 'black', fontStyle: 'Art Deco' });
    setGeneratedImage(null);
    setErrorMessage(null);
    setIsFallbackImage(false);
    onClose();
  };

  const constructFullConcept = () => {
    let details = `T-Shirt Color: ${formData.shirtColor}. Font Style: ${formData.fontStyle}.`;
    return `${formData.quote}. ${details}`;
  };

  const handleRefine = async () => {
    if (!formData.quote) return;
    setIsRefining(true);
    setErrorMessage(null);
    try {
      const fullConcept = constructFullConcept();
      // Refines the concept into a visual design prompt
      const refined = await refineDesignPrompt(fullConcept, formData.stylePreference || "Objectivist Aesthetic");
      // We update the quote field with the refined prompt so the user can see it
      setFormData(prev => ({ ...prev, quote: refined }));
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to refine text. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleVisualize = async () => {
    if (!formData.quote) return;
    setErrorMessage(null);
    setIsFallbackImage(false);

    // Check for API Key access for High Quality models
    if (window.aistudio) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
        }
      } catch (e) {
        console.error("API Key selection failed", e);
      }
    }

    setIsGeneratingImg(true);
    try {
      // Capture the original text and style before processing
      const originalQuote = formData.quote;
      const selectedFont = formData.fontStyle;

      // 1. Refine the prompt first to ensure high quality visual directions
      const fullConcept = constructFullConcept();
      const refinedPrompt = await refineDesignPrompt(fullConcept, formData.stylePreference || "Objectivist Aesthetic");
      
      // Update UI to show the user what is being generated
      setFormData(prev => ({ ...prev, quote: refinedPrompt })); 

      // 2. Generate Image using the refined prompt AND explicitly passing the quote and font
      // This ensures the model receives a strict instruction to include the text.
      const imgData = await generateMerchImage(refinedPrompt, originalQuote, selectedFont);
      setGeneratedImage(imgData);

      // Check if it's a picsum URL (fallback)
      if (imgData.includes('picsum.photos')) {
        setIsFallbackImage(true);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage("Visualization failed completely. Please try again later.");
    } finally {
      setIsGeneratingImg(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-stone-900 border border-amber-600/30 shadow-2xl p-8 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-white">
          <X />
        </button>
        
        <h2 className="text-2xl serif text-amber-500 mb-2 flex items-center gap-2">
          <PenTool size={24} />
          Commission a Design
        </h2>
        <p className="text-stone-400 text-sm mb-6">"The question isn't who is going to let me; it's who is going to stop me." - Tell us what you want.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-stone-400 uppercase mb-1">Your Name</label>
              <input 
                required
                type="text" 
                value={formData.customerName}
                onChange={e => setFormData({...formData, customerName: e.target.value})}
                className="w-full bg-stone-950 border border-stone-700 text-white p-3 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-stone-400 uppercase mb-2">T-Shirt Color</label>
                <div className="flex flex-wrap gap-2">
                  {SHIRT_COLORS.map(color => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setFormData({...formData, shirtColor: color.id})}
                      title={color.label}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${color.class} ${formData.shirtColor === color.id ? 'ring-2 ring-amber-500 scale-110' : 'opacity-70 hover:opacity-100'}`}
                    >
                      {formData.shirtColor === color.id && (
                        <Check size={14} className={`mx-auto ${color.id === 'white' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-stone-400 uppercase mb-2">Typography</label>
                <select 
                  value={formData.fontStyle}
                  onChange={e => setFormData({...formData, fontStyle: e.target.value})}
                  className="w-full bg-stone-950 border border-stone-700 text-white p-2 text-sm focus:border-amber-500 outline-none"
                >
                  {FONT_STYLES.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs text-stone-400 uppercase">Concept / Visual Description</label>
                <button 
                  type="button" 
                  onClick={handleRefine}
                  disabled={isRefining || !formData.quote}
                  className="text-xs text-amber-500 flex items-center gap-1 hover:text-amber-400 disabled:opacity-50"
                >
                  {isRefining ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Refine Design Prompt
                </button>
              </div>
              <textarea 
                required
                value={formData.quote}
                onChange={e => setFormData({...formData, quote: e.target.value})}
                className="w-full bg-stone-950 border border-stone-700 text-white p-3 focus:border-amber-500 outline-none h-32 text-sm"
                placeholder="Describe the shirt... e.g. 'Love is a selfish emotion' in gold lettering"
              />
            </div>
            
            <div>
              <label className="block text-xs text-stone-400 uppercase mb-1">Style Preference</label>
              <input 
                type="text" 
                value={formData.stylePreference}
                onChange={e => setFormData({...formData, stylePreference: e.target.value})}
                className="w-full bg-stone-950 border border-stone-700 text-white p-3 focus:border-amber-500 outline-none"
                placeholder="Minimalist, Art Deco, Industrial..."
              />
            </div>
            
            <div className="pt-2 flex gap-3">
              <button 
                type="button"
                onClick={handleVisualize}
                disabled={isGeneratingImg || !formData.quote}
                className="flex-1 border border-stone-600 text-stone-300 font-bold py-3 uppercase hover:border-amber-500 hover:text-amber-500 transition-colors flex items-center justify-center gap-2"
              >
                {isGeneratingImg ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                Visualize
              </button>
              <button type="submit" className="flex-1 bg-amber-600 text-black font-bold py-3 uppercase hover:bg-amber-500 transition-colors flex items-center justify-center gap-2">
                <Send size={18} /> Submit
              </button>
            </div>
          </form>

          {/* Preview Section */}
          <div className="bg-stone-950 border border-stone-800 flex items-center justify-center relative aspect-[4/5] overflow-hidden flex-col h-full min-h-[400px]">
            {generatedImage ? (
              <>
                <img src={generatedImage} alt="Generated Design" className={`w-full h-full object-cover animate-in fade-in ${isFallbackImage ? 'grayscale sepia-[.3]' : ''}`} />
                {isFallbackImage && (
                  <div className="absolute bottom-0 left-0 right-0 bg-amber-900/90 text-amber-100 p-2 text-xs text-center">
                    AI Quota Exceeded. Showing conceptual placeholder.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-6 flex flex-col items-center w-full">
                <div className="w-16 h-16 border-2 border-stone-800 rounded-full flex items-center justify-center mb-4 text-stone-600">
                  <ImageIcon size={32} />
                </div>
                <p className="text-stone-500 text-sm mb-4">Visualize your concept with Nano Banana.</p>
                {window.aistudio && (
                   <div className="text-xs text-stone-600 flex items-center gap-1">
                      <KeyRound size={10} /> Paid API Key recommended for Pro results
                   </div>
                )}
              </div>
            )}
            
            {/* Loading Overlay */}
            {isGeneratingImg && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                 <div className="text-center">
                    <Loader2 size={32} className="text-amber-500 animate-spin mx-auto mb-2" />
                    <p className="text-amber-500 text-xs tracking-widest uppercase">Fabricating Prototype...</p>
                 </div>
              </div>
            )}

            {/* Error Overlay */}
            {errorMessage && !isGeneratingImg && (
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20 p-6 text-center">
                <div>
                   <AlertTriangle className="text-red-500 w-10 h-10 mx-auto mb-3" />
                   <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
                   <button 
                     onClick={() => setErrorMessage(null)}
                     className="px-4 py-2 bg-stone-800 text-stone-300 text-xs uppercase font-bold hover:bg-stone-700"
                   >
                     Dismiss
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};