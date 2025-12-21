import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Cart = () => {
  const navigate = useNavigate();
  
  // Get cart from context, with fallback
  let cartData: any = { items: [], total: 0, updateQuantity: null, removeFromCart: null, clearCart: null };
  try {
    const cart = useCart();
    cartData = { 
      items: cart?.items || [],
      total: cart?.total || 0,
      updateQuantity: cart?.updateQuantity,
      removeFromCart: cart?.removeFromCart,
      clearCart: cart?.clearCart
    };
  } catch (e) {
    console.warn("Cart context not available, using fallback");
    const saved = JSON.parse(localStorage.getItem("sambhai-cart") || "[]");
    cartData = {
      items: saved,
      total: saved.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
      updateQuantity: (id: string, size: string, qty: number) => {
        if (qty <= 0) {
          const updated = saved.filter((i: any) => !(i.id === id && i.size === size));
          localStorage.setItem("sambhai-cart", JSON.stringify(updated));
        } else {
          const idx = saved.findIndex((i: any) => i.id === id && i.size === size);
          if (idx >= 0) saved[idx].quantity = qty;
          localStorage.setItem("sambhai-cart", JSON.stringify(saved));
        }
        window.location.reload();
      },
      removeFromCart: (id: string, size: string) => {
        const updated = saved.filter((i: any) => !(i.id === id && i.size === size));
        localStorage.setItem("sambhai-cart", JSON.stringify(updated));
        window.location.reload();
      },
      clearCart: () => {
        localStorage.setItem("sambhai-cart", "[]");
        window.location.reload();
      }
    };
  }

  const { items, updateQuantity, removeFromCart, total, clearCart } = cartData;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">Add some products to get started!</p>
            <Link to="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.id}-${item.size}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-24 h-32 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">Size: {item.size}</p>
                      <p className="text-lg font-semibold text-price">₹{item.price}</p>
                      
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-100/20"
                          onClick={() => {
                            removeFromCart(item.id, item.size);
                            toast.success(`❌ Removed "${item.title}" from cart`);
                          }}
                          title="Remove from cart"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 text-foreground">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-foreground">
                    <span>Subtotal</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>

                <Button
                  className="w-full mt-3"
                  variant="destructive"
                  size="lg"
                  onClick={() => {
                    clearCart();
                    toast.success("🗑️ Cart cleared");
                  }}
                >
                  Clear Cart
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
