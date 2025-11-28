import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { ADMIN_PASSKEY, GOOGLE_CLIENT_ID } from '../constants';
import { X, Lock, Mail, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialView: 'USER' | 'ADMIN';
  onClose: () => void;
  onUserLogin: (user: UserProfile) => void;
  onAdminLogin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialView, onClose, onUserLogin, onAdminLogin }) => {
  const [view, setView] = useState<'USER' | 'ADMIN'>(initialView);
  const [email, setEmail] = useState('');
  const [passkey, setPasskey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Initialize Google Sign-In
  useEffect(() => {
    if (view === 'USER' && window.google && GOOGLE_CLIENT_ID) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse
        });
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          { theme: "outline", size: "large", width: "100%", text: "continue_with" }
        );
      } catch (err) {
        console.error("Google Auth Error:", err);
      }
    }
  }, [view, isOpen]);

  const handleGoogleResponse = (response: any) => {
    try {
      const userObject = decodeJwt(response.credential);
      if (userObject) {
        onUserLogin({
          name: userObject.name,
          email: userObject.email,
          avatar: userObject.picture
        });
        onClose();
      }
    } catch (e) {
      setError("Failed to process Google Sign-In.");
    }
  };

  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setIsLoading(true);

    // Simulate Login Delay
    setTimeout(() => {
      const name = email.split('@')[0];
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      
      onUserLogin({
        name: formattedName,
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${name}&background=d97706&color=fff`
      });
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey === ADMIN_PASSKEY) {
      setIsLoading(true);
      setTimeout(() => {
        onAdminLogin();
        setIsLoading(false);
        onClose();
      }, 800);
    } else {
      setError("Access Denied. Incorrect Passkey.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-stone-900 border border-amber-600/30 shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-white">
          <X size={20} />
        </button>

        <div className="flex gap-4 mb-8 border-b border-stone-800">
          <button 
            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-colors ${view === 'USER' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
            onClick={() => { setView('USER'); setError(null); }}
          >
            User Access
          </button>
          <button 
            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-colors ${view === 'ADMIN' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
            onClick={() => { setView('ADMIN'); setError(null); }}
          >
            Admin Control
          </button>
        </div>

        {view === 'USER' ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-serif text-white mb-2">Identify Yourself</h3>
            <p className="text-stone-400 text-sm mb-6">"Man's mind is his basic tool of survival." Log in to trade.</p>
            
            {/* Real Google OAuth Button */}
            {GOOGLE_CLIENT_ID ? (
              <div className="mb-6">
                <div ref={googleButtonRef} className="w-full flex justify-center mb-2"></div>
              </div>
            ) : (
               <div className="mb-4 p-3 bg-stone-950 border border-stone-800 rounded flex items-start gap-2 text-stone-500 text-xs">
                 <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                 <span>Real OAuth requires a Client ID in constants.ts. Using Guest Login for now.</span>
               </div>
            )}

            {/* Separator */}
            <div className="relative flex items-center justify-center mb-6">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-800"></div></div>
               <span className="relative bg-stone-900 px-2 text-xs text-stone-500 uppercase">Or Guest Access</span>
            </div>
            
            {/* Manual Login Form */}
            <form onSubmit={handleManualLogin}>
              <div className="mb-6">
                <label className="block text-xs text-stone-500 uppercase mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-stone-500" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 text-white pl-10 p-3 focus:border-amber-500 outline-none placeholder:text-stone-700"
                    placeholder="john.galt@gmail.com"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-amber-950/50 text-amber-500 border border-amber-900 font-bold py-3 flex items-center justify-center gap-3 hover:bg-amber-900/50 transition-colors uppercase text-sm tracking-widest"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Continue as Guest"}
              </button>
            </form>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <h3 className="text-2xl font-serif text-white mb-2">Restricted Area</h3>
            <p className="text-stone-400 text-sm mb-6">Enter the passkey to access industrial controls.</p>

            <form onSubmit={handleAdminLogin}>
              <div className="mb-6">
                <label className="block text-xs text-stone-500 uppercase mb-2">Passkey</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-stone-500" size={18} />
                  <input 
                    type="password" 
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 text-white pl-10 p-3 focus:border-amber-500 outline-none placeholder:text-stone-700"
                    placeholder="••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800 p-2 mb-4 flex items-center gap-2">
                  <ShieldCheck className="text-red-500" size={16} />
                  <p className="text-red-500 text-xs">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-amber-600 text-black font-bold py-3 uppercase hover:bg-amber-500 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Access Control"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};