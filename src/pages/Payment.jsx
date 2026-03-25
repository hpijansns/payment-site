import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ArrowLeft, QrCode, ChevronDown, CheckCircle2, 
  PlusCircle, Loader2, XCircle, Info, Lock, Copy 
} from 'lucide-react';
import { UPI_ID, generateUpiLinks } from '../utils/payment';

const Payment = () => {
  const [totalAmount, setTotalAmount] = useState(1000);
  const [timeLeft, setTimeLeft] = useState(900);
  const [activeTab, setActiveTab] = useState('upi');
  const [payments, setPayments] = useState([]);
  const [utrInput, setUtrInput] = useState('');
  const [amtInput, setAmtInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selectedTotalPrice");
    if (saved) setTotalAmount(Number(saved));
    const timer = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalAmount - totalPaid;
  const progress = (totalPaid / totalAmount) * 100;
  const links = generateUpiLinks(remaining);

  const addPayment = () => {
    if (utrInput.length !== 12) return alert("Enter 12-digit UTR");
    if (!amtInput || amtInput <= 0) return alert("Enter valid amount");
    if (totalPaid + Number(amtInput) > totalAmount) return alert("Exceeds total amount");
    setPayments([...payments, { utr: utrInput, amount: Number(amtInput) }]);
    setUtrInput(''); setAmtInput('');
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
          <img src="https://getlogo.net/wp-content/uploads/2020/04/bookmyshow-logo-vector-xs.png" className="h-6" alt="BMS" />
        </div>
        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1.5 font-bold text-[10px]">
          <ShieldCheck className="w-4 h-4" /> SECURE CHECKOUT
        </div>
      </header>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full animate-slide-up">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Payment Methods */}
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-slate-50/50">
                <h2 className="text-xl font-extrabold text-gray-800">Choose Payment Method</h2>
                <p className="text-xs text-gray-400 font-medium">Safe & Encrypted Transactions</p>
              </div>

              {/* UPI Tab */}
              <div className="border-b border-gray-100">
                <button 
                  onClick={() => setActiveTab(activeTab === 'upi' ? '' : 'upi')} 
                  className="w-full p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-green-100 text-green-600 rounded-2xl"><QrCode size={24}/></div>
                    <span className="font-bold text-gray-700">UPI / QR (Instant)</span>
                  </div>
                  <ChevronDown className={`transition-transform duration-300 ${activeTab === 'upi' ? 'rotate-180' : ''}`} />
                </button>

                <div className={`accordion-content ${activeTab === 'upi' ? 'open' : ''}`}>
                  <div className="p-6 bg-slate-50/50 space-y-6 text-center">
                    <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">
                      Expires in: {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                    </div>
                    
                    <div className="inline-block p-4 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 shadow-inner">
                      <img src={links.qr} className="w-48 h-48" alt="QR Code" />
                    </div>
                    
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Scan using any UPI App</p>

                    <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                      <a href={links.phonepe} className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
                        <img src="https://cdn.razorpay.com/app/phonepe.svg" className="w-12 h-12" />
                        <span className="text-[10px] font-bold text-gray-500">PhonePe</span>
                      </a>
                      <a href={links.paytm} className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
                        <img src="https://cdn.razorpay.com/app/paytm.svg" className="w-12 h-12" />
                        <span className="text-[10px] font-bold text-gray-500">Paytm</span>
                      </a>
                      <a href={links.gpay} className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
                        <img src="https://cdn.razorpay.com/app/google_pay.svg" className="w-12 h-12" />
                        <span className="text-[10px] font-bold text-gray-500">GPay</span>
                      </a>
                    </div>

                    {/* UTR Tracker Section */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-200 text-left space-y-5">
                      <div className="flex items-start gap-3 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-indigo-800 font-medium">
                          Note: You can pay in parts. Add each transaction UTR below to confirm.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                          <span className="text-green-600">Paid: ₹{totalPaid}</span>
                          <span className="text-red-500">Left: ₹{remaining}</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-700" 
                            style={{width: `${progress}%`}}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                        <input 
                          type="text" 
                          maxLength={12} 
                          value={utrInput} 
                          onChange={e=>setUtrInput(e.target.value)} 
                          placeholder="12-digit UTR No" 
                          className="p-3.5 border-2 rounded-2xl text-sm outline-none focus:border-indigo-500 bg-slate-50/50" 
                        />
                        <input 
                          type="number" 
                          value={amtInput} 
                          onChange={e=>setAmtInput(e.target.value)} 
                          placeholder="Enter Amount" 
                          className="p-3.5 border-2 rounded-2xl text-sm outline-none focus:border-indigo-500 bg-slate-50/50" 
                        />
                        <button 
                          onClick={addPayment} 
                          className="sm:col-span-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                        >
                          <PlusCircle size={18}/> ADD PAYMENT ENTRY
                        </button>
                      </div>

                      {payments.length > 0 && (
                        <div className="space-y-2 pt-4 border-t border-gray-50">
                          {payments.map((p,i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                              <span className="text-[11px] font-bold text-gray-500">UTR: {p.utr}</span>
                              <div className="flex items-center gap-4">
                                <span className="font-black text-gray-900">₹{p.amount}</span>
                                <button onClick={()=>setPayments(payments.filter((_,idx)=>idx!==i))} className="text-red-400"><XCircle size={18}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Disabled Tabs */}
              <div className="p-6 flex items-center justify-between opacity-30 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 text-slate-400 rounded-2xl"><Lock size={24}/></div>
                  <span className="font-bold text-gray-400 uppercase tracking-tighter">Debit / Credit Card</span>
                </div>
                <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-1 rounded">MAINTENANCE</span>
              </div>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="w-full md:w-80">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 sticky top-24 space-y-8">
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Payable</p>
                <h3 className="text-5xl font-black text-gray-900 tracking-tighter">₹{totalAmount.toLocaleString()}</h3>
              </div>
              
              <button 
                disabled={totalPaid < totalAmount}
                onClick={() => setIsProcessing(true)}
                className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  totalPaid >= totalAmount 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 active:scale-95' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed uppercase'
                }`}
              >
                <CheckCircle2 size={20}/> VERIFY PAYMENT
              </button>

              <div className="pt-6 border-t flex flex-col items-center gap-4 opacity-40 grayscale">
                <img src="https://d6xcmfyh68wv8.cloudfront.net/assets/razorpay-logo.svg" className="h-5" alt="Razorpay" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Secured by industry-standard encryption</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Processing Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[2.5rem] p-10 flex flex-col items-center text-center animate-slide-up">
            <div className="flex items-center gap-2 mb-8 text-indigo-600 font-black text-xs uppercase tracking-widest">
              <Loader2 className="animate-spin" size={20}/> Checking UTR Ledger
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Processing Payment</h2>
            <p className="text-xs text-gray-500 mb-10 leading-relaxed font-medium uppercase tracking-tight opacity-70 italic">
              Verification takes 30-60 seconds. <br/> Please stay on this screen.
            </p>
            <img src="https://checkout-static-next.razorpay.com/build/assets/images/coin.6caba344.png" className="w-28 h-28 mb-10 coin-flip" alt="Coin" />
            
            <div className="bg-amber-50 border border-amber-100 p-5 rounded-[2rem] mb-10 shadow-inner">
                <p className="text-[10px] text-amber-800 font-bold leading-relaxed uppercase tracking-tighter">
                  If amount is deducted but verification fails, our team will manually confirm your tickets within 24 hours.
                </p>
            </div>
            
            <button 
              onClick={()=>setIsProcessing(false)} 
              className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest"
            >
              CLOSE WINDOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
