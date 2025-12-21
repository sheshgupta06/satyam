import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { QrCode, Loader2 } from "lucide-react";

// Razorpay Script Load
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Address Form Data
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", apartment: "", area: "", village: "", landmark: "", city: "", pincode: "",
  });

  useEffect(() => {
    if (cart.length === 0) navigate("/shop");
  }, [cart, navigate]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // --- HANDLE RAZORPAY PAYMENT ---
  const handlePayment = async () => {
    // Ensure terms accepted
    if (!acceptTerms) {
      toast.error("कृपया शर्तें स्वीकार करें: एक बार खरीदा गया सामान वापस नहीं होगा।");
      return;
    }
    // 1. Validate Address
    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      toast.error("❌ Please fill full address details");
      return;
    }

    // 2. Check Login
    const user = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
    if (!user._id) {
        toast.error("Please Login first");
        navigate("/user-login");
        return;
    }

    setLoading(true);

    try {
        // 3. Create Order on Backend
        const res = await loadRazorpayScript();
        if (!res) { toast.error("Razorpay SDK failed"); return; }

        const orderData = await fetch("http://localhost:5000/api/payment/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: total }),
        });
        const order = await orderData.json();

        // 4. Open Razorpay Modal
        const options = {
            key: "rzp_test_RmPRD1kkOtZ8RO", // <--- YAHAN APNI KEY ID DAALO
            amount: order.amount,
            currency: "INR",
            name: "Skluxewear",
            description: "Scan QR to Pay",
            order_id: order.id,
            
            // 5. ON SUCCESS
            handler: async function (response: any) {
                toast.success("✅ Payment Successful!");
                
                // Save Order to Database
                await fetch("http://localhost:5000/api/orders/place", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user._id,
                        customerName: formData.name,
                        email: formData.email || user.email,
                        customerPhone: formData.phone,
                        customerAddress: [
                          formData.address,
                          formData.apartment ? `Apt: ${formData.apartment}` : null,
                          formData.area ? `Area: ${formData.area}` : null,
                          formData.village ? `Village: ${formData.village}` : null,
                          formData.landmark ? `Landmark: ${formData.landmark}` : null,
                          formData.city,
                          formData.pincode
                        ].filter(Boolean).join(', '),
                        items: cart,
                        amount: total,
                        paymentMethod: "UPI (Razorpay)",
                        paymentId: response.razorpay_payment_id,
                        status: "Paid & Processing" // Auto Verified!
                    }),
                });

                clearCart();
                navigate("/profile");
            },
            prefill: {
                name: formData.name,
                email: formData.email || user.email,
                contact: formData.phone,
            },
            theme: { color: "#22c55e" },
            // Sirf UPI/QR dikhane ki koshish (Note: Razorpay hamesha saare option dikhata hai, par hum user ko bolenge QR use kare)
            method: {
                netbanking: false,
                card: false,
                wallet: false,
                upi: true, 
            }
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.open();
        
    } catch (error) {
        console.error(error);
        toast.error("Payment Failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-green-500">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Address Form */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Shipping Details</h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-gray-400">Full Name *</Label><Input id="name" value={formData.name} onChange={handleChange} className="bg-black border-gray-700 text-white" required /></div>
                    <div><Label className="text-gray-400">Phone Number *</Label><Input id="phone" type="tel" value={formData.phone} onChange={handleChange} className="bg-black border-gray-700 text-white" required /></div>
                  </div>
                  <div><Label className="text-gray-400">Email</Label><Input id="email" type="email" value={formData.email} onChange={handleChange} className="bg-black border-gray-700 text-white" /></div>
                    <div><Label className="text-gray-400">Address *</Label><Input id="address" value={formData.address} onChange={handleChange} className="bg-black border-gray-700 text-white" required /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label className="text-gray-400">Apartment / House No.</Label><Input id="apartment" value={formData.apartment} onChange={handleChange} className="bg-black border-gray-700 text-white" /></div>
                      <div><Label className="text-gray-400">Area / Locality</Label><Input id="area" value={formData.area} onChange={handleChange} className="bg-black border-gray-700 text-white" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div><Label className="text-gray-400">Village / Colony</Label><Input id="village" value={formData.village} onChange={handleChange} className="bg-black border-gray-700 text-white" /></div>
                      <div><Label className="text-gray-400">Landmark</Label><Input id="landmark" value={formData.landmark} onChange={handleChange} className="bg-black border-gray-700 text-white" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div><Label className="text-gray-400">City</Label><Input id="city" value={formData.city} onChange={handleChange} className="bg-black border-gray-700 text-white" /></div>
                      <div><Label className="text-gray-400">Pincode *</Label><Input id="pincode" type="number" value={formData.pincode} onChange={handleChange} className="bg-black border-gray-700 text-white" required /></div>
                    </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="bg-gray-900 border-gray-800 sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-white">Order Summary</h2>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm text-gray-300">
                      <span>{item.name} ({item.size}) x{item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4 mb-6 flex justify-between text-lg font-bold text-green-400">
                    <span>Total Pay</span><span>₹{total}</span>
                </div>

                {/* ONE-LINE TERMS + CHECKBOX */}
                <div className="flex items-start mb-4">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 mr-2 h-4 w-4"
                  />
                  <label htmlFor="acceptTerms" className="text-xs text-gray-400">
                    एक बार खरीदा गया सामान वापस नहीं होगा।
                  </label>
                </div>

                {/* ONLY RAZORPAY BUTTON */}
                <Button 
                    onClick={handlePayment} 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
                    disabled={loading || !acceptTerms}
                >
                    {loading ? <Loader2 className="animate-spin mr-2"/> : <QrCode className="mr-2 h-6 w-6" />} 
                    Pay via QR / UPI
                </Button>

                <p className="text-xs text-center text-gray-500 mt-3">Secured by Razorpay</p>

              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;