import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, LogOut, ShoppingBag, MapPin, CreditCard, Banknote, Phone, ExternalLink, Truck, CheckCircle, Clock, X } from "lucide-react";
import { toast } from "sonner";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("userInfo");
    if (!storedUser) {
      navigate("/user-login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchOrders(parsedUser._id);
    }
  }, [navigate]);

  const fetchOrders = async (userId: string) => {
    setLoadingOrders(true);
    try {
        const res = await fetch("https://satyam-production-066b.up.railway.app/api/orders");
        const data = await res.json();
        // Filter by User ID
        const userOrders = data.filter((order: any) => order.userId === userId);
        // Sort by latest (Newest first)
        setMyOrders(userOrders.reverse());
    } catch (error) { console.error("Error fetching orders"); }
    setLoadingOrders(false);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("Logged out successfully");
    navigate("/user-login");
  };

  const handleCancelOrder = async (orderId: string, order: any) => {
    // Check if order is already shipped - prevent cancellation
    if (order.status === "Shipped") {
      toast.error("Cannot cancel shipped orders. Please contact customer support.");
      return;
    }

    const confirmMsg = `Are you sure you want to cancel this order?\n\n💰 Refund of ₹${order.amount} will be processed.`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`https://satyam-production-066b.up.railway.app/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "Cancelled by User",
          refundAmount: order.amount,
          paymentMethod: order.paymentMethod
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Order cancelled! Refund of ₹${order.amount} will be credited within 3-5 business days.`);
        fetchOrders(user._id);
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Error cancelling order");
    }
  };

  // --- STATUS ICON HELPER ---
  const getStatusInfo = (status: string) => {
    if (status === 'Delivered') return { color: 'text-green-400 border-green-800 bg-green-900/30', icon: <CheckCircle className="w-3 h-3 mr-1"/> };
    if (status === 'Shipped') return { color: 'text-blue-400 border-blue-800 bg-blue-900/30', icon: <Truck className="w-3 h-3 mr-1"/> };
    if (status === 'Cancelled by User') return { color: 'text-red-400 border-red-800 bg-red-900/30', icon: <X className="w-3 h-3 mr-1"/> };
    return { color: 'text-yellow-400 border-yellow-800 bg-yellow-900/30', icon: <Clock className="w-3 h-3 mr-1"/> };
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {user && (
            <>
            {/* --- PROFILE HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-sm mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-800 p-4 rounded-full border border-gray-700">
                        <User className="w-10 h-10 text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Hello, {user.name}! 👋</h1>
                        <p className="text-gray-400">{user.mobile}</p>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                </div>
                
                <Button variant="destructive" onClick={handleLogout} className="w-full md:w-auto">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
            </div>

            {/* --- ORDERS SECTION --- */}
            <h2 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-2">
                <ShoppingBag /> My Orders
            </h2>

            {loadingOrders ? (
                <p className="text-center text-gray-500 animate-pulse">Loading your orders...</p>
            ) : myOrders.length === 0 ? (
                <div className="text-center py-16 bg-gray-900 rounded border border-gray-800">
                    <p className="text-gray-400 mb-4 text-lg">You haven't placed any orders yet.</p>
                    <Button variant="outline" className="text-green-400 border-green-900 hover:bg-green-900/20" onClick={() => navigate("/shop")}>
                        Start Shopping
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {myOrders.map((order: any) => {
                        const statusInfo = getStatusInfo(order.status);
                        return (
                            <Card key={order._id} className="bg-gray-900 border border-gray-800 text-white overflow-hidden hover:border-green-500/30 transition-colors">
                                
                                {/* 1. Order Header */}
                                <CardHeader className="bg-gray-800/50 border-b border-gray-800 pb-3">
                                    <div className="flex justify-between items-center flex-wrap gap-2">
                                        <div>
                                            <CardTitle className="text-lg text-white">Order #{order._id.slice(-6)}</CardTitle>
                                            <p className="text-xs text-gray-400">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        
                                        {/* Status Badge with Icon */}
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center ${statusInfo.color}`}>
                                            {statusInfo.icon}
                                            {order.status}
                                        </span>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="pt-4">
                                    
                                    {/* 2. ✅ CLICKABLE ITEMS LIST */}
                                    <div className="space-y-3 mb-6">
                                        {order.items && order.items.length > 0 ? (
                                            order.items.map((item: any, index: number) => (
                                                <Link 
                                                    key={index}
                                                    // Link Logic: Product ID dhoondo (Backend se jo bhi ID aayi ho)
                                                    to={item.id ? `/product/${item.id}` : item.productId ? `/product/${item.productId}` : "#"} 
                                                    target="_blank" // New Tab
                                                    className="flex items-center gap-4 bg-black/40 p-3 rounded border border-gray-800 hover:bg-gray-800 hover:border-green-500 transition-all group"
                                                >
                                                    {/* Image with Fallback */}
                                                    <img 
                                                        src={item.image || "https://placehold.co/100?text=No+Img"} 
                                                        onError={(e) => e.currentTarget.src = "https://placehold.co/100?text=Error"}
                                                        className="h-16 w-16 object-cover rounded border border-gray-700" 
                                                        alt={item.name} 
                                                    />
                                                    
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-sm text-white group-hover:text-green-400 transition-colors">
                                                                {item.title || item.name}
                                                            </p>
                                                            <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-green-400" />
                                                        </div>
                                                        
                                                        <div className="flex gap-3 text-xs text-gray-400 mt-1">
                                                            <span>Size: <b className="text-white">{item.size || "N/A"}</b></span>
                                                            <span>Qty: <b className="text-white">{item.quantity || 1}</b></span>
                                                        </div>
                                                    </div>
                                                    <p className="font-bold text-green-400">₹{item.price}</p>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">Item details unavailable.</p>
                                        )}
                                    </div>

                                    {/* 3. Footer Info */}
                                    <div className="grid md:grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">Shipping To:</h4>
                                            <p className="text-sm text-gray-300 flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0"/> 
                                                {order.customerAddress ? `${order.customerAddress}, ${order.city} - ${order.pincode}` : "Address not saved"}
                                            </p>
                                            {order.customerPhone && (
                                                <p className="text-sm text-gray-300 flex items-center gap-2 mt-1">
                                                    <Phone className="w-4 h-4 text-gray-500"/> {order.customerPhone}
                                                </p>
                                            )}
                                        </div>

                                        <div className="md:text-right">
                                            <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">Payment Info:</h4>
                                            <div className="flex items-center md:justify-end gap-2 mb-1">
                                                <span className={`flex items-center gap-1 text-sm font-bold ${order.paymentMethod?.includes('UPI') ? 'text-purple-400' : 'text-gray-400'}`}>
                                                    {order.paymentMethod?.includes('UPI') ? <CreditCard className="w-4 h-4"/> : <Banknote className="w-4 h-4"/>}
                                                    {order.paymentMethod?.includes('UPI') ? "Paid Online" : "Cash on Delivery"}
                                                </span>
                                            </div>
                                            <p className="text-xl font-bold text-green-500">Total: ₹{order.amount}</p>
                                            {order.status !== 'Delivered' && order.status !== 'Cancelled by User' && order.status !== 'Shipped' && (
                                              <Button size="sm" variant="destructive" onClick={() => handleCancelOrder(order._id, order)} className="mt-3 w-full md:w-auto">
                                                <X className="w-4 h-4 mr-2" /> Cancel Order
                                              </Button>
                                            )}
                                            {order.status === 'Shipped' && (
                                              <p className="text-xs text-gray-400 mt-2">⚠️ Cannot cancel shipped orders</p>
                                            )}
                                        </div>
                                    </div>

                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
            </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;