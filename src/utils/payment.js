export const UPI_ID = "paytm.s1h6t6g@pty";

export const generateUpiLinks = (amount) => {
  const note = "Ticket Payment";
  const tr = "TXN" + Math.floor(Math.random() * 1000000000);
  
  // Base Standard Link
  const baseUpi = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(note)}&am=${amount}&cu=INR&tr=${tr}&mode=02&orgid=159002`;

  // PhonePe Base64 Payload
  const ppPayload = btoa(JSON.stringify({
    contact: { vpa: UPI_ID },
    p2pPaymentCheckoutParams: {
      note: note,
      initialAmount: amount * 100, // In Paise
      currency: "INR"
    }
  }));

  return {
    qr: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(baseUpi)}`,
    universal: baseUpi,
    phonepe: `intent://pay?${baseUpi.split('?')[1]}#Intent;scheme=upi;package=com.phonepe.app;end`,
    paytm: `intent://pay?${baseUpi.split('?')[1]}#Intent;scheme=upi;package=net.one97.paytm;end`,
    gpay: `intent://pay?${baseUpi.split('?')[1]}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`,
  };
};
