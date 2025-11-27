import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const OrderSuccess = () => {
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("lastOrderId") || "N/A";
    setOrderId(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4 text-foreground">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mb-2">Thank you for shopping with Skluxewear.in</p>
          <p className="text-sm text-muted-foreground mb-8">
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>
          <div className="space-y-3">
            <Link to="/products" className="block">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
            <Link to="/" className="block">
              <Button variant="outline" className="w-full">Go to Home</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
