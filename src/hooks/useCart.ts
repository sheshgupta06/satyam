import { useState, useEffect } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("sambhai-cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (cartItems: CartItem[]) => {
    localStorage.setItem("sambhai-cart", JSON.stringify(cartItems));
    setItems(cartItems);
  };

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    const existingItem = items.find(
      (i) => i.id === item.id && i.size === item.size
    );

    if (existingItem) {
      const updatedItems = items.map((i) =>
        i.id === item.id && i.size === item.size
          ? { ...i, quantity: i.quantity + 1 }
          : i
      );
      saveCart(updatedItems);
    } else {
      saveCart([...items, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string, size: string) => {
    saveCart(items.filter((item) => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(id, size);
    } else {
      const updatedItems = items.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      );
      saveCart(updatedItems);
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
  };
};
