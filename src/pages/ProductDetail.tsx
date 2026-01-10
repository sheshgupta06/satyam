import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Get cart from context, with fallback
  let addToCart: any = null;
  try {
    const cart = useCart();
    addToCart = cart?.addToCart;
  } catch (e) {
    console.warn("Cart context not available, using fallback");
  }

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`https://satyam-production-066b.up.railway.app/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!product) return <div className="p-10 text-center">Product not found.</div>;

  return (
    <>
      <Header />

      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[450px] object-cover rounded-xl shadow"
          />

          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            <p className="text-xl text-primary font-semibold mb-4">
              ₹{product.price}
            </p>

            <p className="text-gray-500 mb-6">{product.description}</p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Select Size:</label>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.split(",").map((size: string) => (
                    <button
                      key={size.trim()}
                      onClick={() => setSelectedSize(size.trim())}
                      className={`px-4 py-2 border rounded transition ${
                        selectedSize === size.trim()
                          ? "bg-primary text-white border-primary"
                          : "border-gray-300 hover:border-primary"
                      }`}
                    >
                      {size.trim()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY SELECTOR */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity:</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (!addToCart) {
                    // Fallback
                    const currentCart = JSON.parse(localStorage.getItem("sambhai-cart") || "[]");
                    const newItem = { id: product._id, title: product.name, price: product.price, image: product.image, size: selectedSize || "One Size", quantity };
                    const existing = currentCart.find((i: any) => i.id === product._id && i.size === (selectedSize || "One Size"));
                    if (existing) existing.quantity += quantity;
                    else currentCart.push(newItem);
                    localStorage.setItem("sambhai-cart", JSON.stringify(currentCart));
                    window.dispatchEvent(new CustomEvent('cart_update', { detail: currentCart }));
                  } else {
                    addToCart({
                      id: product._id,
                      title: product.name,
                      price: product.price,
                      image: product.image,
                      size: selectedSize || "",
                      quantity
                    });
                  }
                  toast.success("✅ Added to cart");
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700"
              >
                Add to Cart
              </Button>

              <Button
                onClick={() => {
                  if (!addToCart) {
                    const currentCart = JSON.parse(localStorage.getItem("sambhai-cart") || "[]");
                    const newItem = { id: product._id, title: product.name, price: product.price, image: product.image, size: selectedSize || "One Size", quantity };
                    const existing = currentCart.find((i: any) => i.id === product._id && i.size === (selectedSize || "One Size"));
                    if (existing) existing.quantity += quantity;
                    else currentCart.push(newItem);
                    localStorage.setItem("sambhai-cart", JSON.stringify(currentCart));
                    window.dispatchEvent(new CustomEvent('cart_update', { detail: currentCart }));
                  } else {
                    addToCart({
                      id: product._id,
                      title: product.name,
                      price: product.price,
                      image: product.image,
                      size: selectedSize || "",
                      quantity
                    });
                  }
                  toast.success("✅ Processing your order...");
                  setTimeout(() => navigate("/checkout"), 500);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductDetail;
