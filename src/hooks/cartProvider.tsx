import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Cart Item Structure
export interface CartItem {
  id: string;
  title?: string; // some components pass `title`
  name?: string; // some places use `name`
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

// Context Structure
interface CartContextType {
  cart: CartItem[];
  items: CartItem[]; // alias for backward-compat
  addToCart: (item: any) => void;
  removeFromCart: (id: string, size?: string) => void;
  updateQuantity: (id: string, size: string | undefined, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Helper to normalize incoming product objects
  const normalizeProduct = (product: any) => {
    const title = product.title || product.name || product.productName || "Product";
    const size = product.size || "One Size";
    const price = typeof product.price === 'number' ? product.price : Number(product.price || 0);
    const image = product.image || product.img || "";
    return {
      id: String(product.id || product._id),
      title,
      price,
      image,
      size,
    } as CartItem;
  };

  // 1. Load Data on Startup
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("sambhai-cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        } else {
          setCart([]);
        }
      }
    } catch (error) {
      console.error("Cart Load Error", error);
      setCart([]);
    }
  }, []);

  // 2. Save Data on Change
  useEffect(() => {
    localStorage.setItem("sambhai-cart", JSON.stringify(cart));
    // Broadcast to other hook instances in same tab
    try {
      window.dispatchEvent(new CustomEvent('cart_update', { detail: cart }));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  // --- ADD TO CART ---
  const addToCart = (product: any) => {
    const p = normalizeProduct(product);
    setCart((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const existing = safePrev.find((i) => i.id === p.id && (i.size || "One Size") === (p.size || "One Size"));
      if (existing) {
        return safePrev.map((i) =>
          i.id === p.id && (i.size || "One Size") === (p.size || "One Size")
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      }
      return [...safePrev, { ...p, quantity: 1 }];
    });
  };

  // --- REMOVE ---
  const removeFromCart = (id: string, size?: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && (size ? item.size === size : true))));
  };

  // --- UPDATE QUANTITY ---
  const updateQuantity = (id: string, size: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }
    setCart((prev) => prev.map((item) =>
      item.id === id && (size ? item.size === size : true) ? { ...item, quantity } : item
    ));
  };

  // --- CLEAR ---
  const clearCart = () => setCart([]);

  // --- TOTAL ---
  const total = (cart || []).reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ cart, items: cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
