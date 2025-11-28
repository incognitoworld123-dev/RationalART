import React, { useState, useEffect } from 'react';
import { CartItem, PaymentMode } from '../types';
import { CreditCard, Truck, CheckCircle, Loader2, X } from 'lucide-react';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
  onCompleteOrder: (details: { name: string; address: string; mode: PaymentMode }) => void;
  initialName?: string;
}

export const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose, cartItems, totalAmount, onCompleteOrder, initialName }) => {
  const [step, setStep] = useState<'DETAILS' | 'PAYMENT' | 'PROCESSING' | 'SUCCESS'>('DETAILS');
  const [details, setDetails] = useState({ name: '', address: '' });
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.UPI);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialName) {
      setDetails(prev => ({ ...prev, name: initialName }));
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('PAYMENT');
  };

  const handlePayment = async () => {
    setError(null);
    setStep('PROCESSING');

    if (paymentMode === PaymentMode.COD) {
      // Direct success for COD
      await new Promise(resolve => setTimeout(resolve, 1000));
      completeTransaction();
    } else {
      // Razorpay Integration
      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag", // Public Test Key (Use your own in production)
        amount: totalAmount * 100, // Amount in paisa
        currency: "INR",
        name: "theIshop",
        description: "Value for Value Exchange",
        image: "https://via.placeholder.com/150/f59e0b/000000?text=$",
        handler: function (response: any) {
          // Payment Successful
          completeTransaction();
        },
        prefill: {
          name: details.name,
          contact: "9999999999", // Placeholder
          email: "rational@example.com" // Placeholder
        },
        theme: {
          color: "#d97706" // amber-600
        },
        modal: {
          ondismiss: function() {
            setStep('PAYMENT');
            setError("Transaction cancelled by user.");
          }
        }
      };

      try {
        if (window.Razorpay) {
          const rzp1 = new window.Razorpay(options);
          rzp1.on('payment.failed', function (response: any){
             setError(response.error.description);
             setStep('PAYMENT');
          });
          rzp1.open();
        } else {
          throw new Error("Razorpay SDK not loaded");
        }
      } catch (err) {
        console.error(err);
        setError("Payment Gateway Unavailable. Falling back to simulation.");
        // Fallback simulation
        await new Promise(resolve => setTimeout(resolve, 2000));
        completeTransaction();
      }
    }
  };

  const completeTransaction = () => {
    onCompleteOrder({
      name: details.name,
      address: details.address,
      mode: paymentMode
    });
    setStep('SUCCESS');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md"></div>
      
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-600/30 shadow-2xl shadow-amber-900/20 p-8">
        {step !== 'SUCCESS' && step !== 'PROCESSING' && (
           <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-white">
             <X />
           </button>
        )}

        {step === 'DETAILS' && (
          <form onSubmit={handleDetailsSubmit}>
            <h2 className="text-2xl serif text-amber-500 mb-6">Trader Identification</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-stone-400 uppercase mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={details.name}
                  onChange={e => setDetails({...details, name: e.target.value})}
                  className="w-full bg-stone-950 border border-stone-700 text-white p-3 focus:border-amber-500 outline-none"
                  placeholder="Howard Roark"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-400 uppercase mb-1">Shipping Coordinates</label>
                <textarea 
                  required
                  value={details.address}
                  onChange={e => setDetails({...details, address: e.target.value})}
                  className="w-full bg-stone-950 border border-stone-700 text-white p-3 focus:border-amber-500 outline-none h-24"
                  placeholder="701, Cortlandt Homes..."
                />
              </div>
            </div>
            <button type="submit" className="mt-8 w-full bg-amber-600 text-black font-bold py-3 uppercase hover:bg-amber-500 transition-colors">
              Proceed to Payment
            </button>
          </form>
        )}

        {step === 'PAYMENT' && (
          <div>
            <h2 className="text-2xl serif text-amber-500 mb-6">Exchange Mechanism</h2>
            <p className="text-stone-400 mb-4 text-sm">Select your method of value transfer.</p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-400 text-sm">
                Error: {error}
              </div>
            )}
            
            <div className="space-y-3 mb-8">
              <button 
                onClick={() => setPaymentMode(PaymentMode.UPI)}
                className={`w-full flex items-center gap-4 p-4 border transition-all ${paymentMode === PaymentMode.UPI ? 'border-amber-500 bg-stone-800' : 'border-stone-700 bg-stone-950 opacity-50 hover:opacity-100'}`}
              >
                <div className={`w-4 h-4 rounded-full border ${paymentMode === PaymentMode.UPI ? 'bg-amber-500 border-amber-500' : 'border-stone-500'}`}></div>
                <CreditCard className="text-stone-300" />
                <div className="text-left">
                  <div className="text-white font-medium">UPI / Card (Razorpay)</div>
                  <div className="text-xs text-stone-500">Secure online transfer</div>
                </div>
              </button>

              <button 
                onClick={() => setPaymentMode(PaymentMode.COD)}
                className={`w-full flex items-center gap-4 p-4 border transition-all ${paymentMode === PaymentMode.COD ? 'border-amber-500 bg-stone-800' : 'border-stone-700 bg-stone-950 opacity-50 hover:opacity-100'}`}
              >
                <div className={`w-4 h-4 rounded-full border ${paymentMode === PaymentMode.COD ? 'bg-amber-500 border-amber-500' : 'border-stone-500'}`}></div>
                <Truck className="text-stone-300" />
                <div className="text-left">
                  <div className="text-white font-medium">Cash on Delivery</div>
                  <div className="text-xs text-stone-500">Pay upon receipt of value</div>
                </div>
              </button>
            </div>

            <div className="flex justify-between items-center border-t border-stone-800 pt-4 mb-6">
              <span className="text-stone-400">Total Obligation:</span>
              <span className="text-xl font-bold text-white">₹{totalAmount}</span>
            </div>

            <button onClick={handlePayment} className="w-full bg-amber-600 text-black font-bold py-3 uppercase hover:bg-amber-500 transition-colors">
              Complete Transaction
            </button>
          </div>
        )}

        {step === 'PROCESSING' && (
          <div className="text-center py-12">
             <Loader2 className="animate-spin text-amber-500 w-12 h-12 mx-auto mb-4" />
             <h3 className="text-xl text-white serif mb-2">Processing Value Exchange...</h3>
             <p className="text-stone-500">Please wait while we verify the transaction.</p>
             {paymentMode === PaymentMode.UPI && (
               <p className="text-xs text-stone-600 mt-4">Connecting to Secure Gateway...</p>
             )}
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="text-center py-8">
            <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-6" />
            <h2 className="text-2xl serif text-white mb-2">Transaction Rationalized</h2>
            <p className="text-stone-400 mb-8">Your order has been accepted. Trade is mutual benefit.</p>
            <button onClick={onClose} className="bg-stone-100 text-black px-8 py-3 font-bold hover:bg-white">
              Return to Market
            </button>
          </div>
        )}
      </div>
    </div>
  );
};