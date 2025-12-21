import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  sizes: string; // 1. Sizes prop wapas laya
}

const ProductCard = ({ id, title, price, image, sizes }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // States for Quantity & Size
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

  // Cloudinary URL Fix
  const imageUrl = image;

  // 2. Sizes string ko Array me badlo
  const sizeList = sizes ? sizes.split(",").map((s) => s.trim()) : ["One Size"];

  // Default size select karo
  useEffect(() => {
    if (sizeList.length > 0) setSelectedSize(sizeList[0]);
  }, [sizes]);

  // --- COMMON ADD FUNCTION ---
  const handleAddItem = () => {
    addToCart({
      id,
      name: title,
      price,
      image: imageUrl,
      size: selectedSize, // 3. Selected Size bhejo
      quantity: quantity  // 4. Selected Quantity bhejo
    } as any);
  };

  return (
    <Card className="group relative overflow-hidden bg-gray-900 border-gray-800 text-white flex flex-col h-full">
      
      {/* Image Section */}
      <div 
        className="h-48 overflow-hidden relative cursor-pointer z-10"
        onClick={() => navigate(`/product/${id}`)}
      >
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <CardContent className="p-3 flex-1 relative z-10">
        <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
        <p className="text-green-400 font-bold mt-1">₹{price}</p>

        {/* 5. SIZE SELECTOR DROPDOWN (Ye zaroori hai) */}
        <div className="mt-3">
            <label className="text-xs text-gray-400 block mb-1">Size:</label>
            <select 
                className="w-full bg-black border border-gray-700 text-white text-sm rounded p-2 focus:outline-none focus:border-green-500"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
            >
                {sizeList.map((size) => (
                    <option key={size} value={size}>{size}</option>
                ))}
            </select>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 gap-2 relative z-50 bg-gray-900 flex items-center">
        
        {/* QUANTITY INPUT */}
        <Input
          type="number"
          min="1"
          max="10"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-14 text-center bg-gray-800 border-gray-700 text-white h-10 px-1"
        />
        
        {/* ADD TO CART BUTTON */}
        <Button
          variant="outline"
          className="flex-1 text-black bg-white hover:bg-gray-200 font-bold relative z-50 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleAddItem(); 
            toast.success(`Added ${quantity} item(s) to Cart ✅`);
          }}
        >
          Add
        </Button>
        
        {/* BUY NOW BUTTON */}
        <Button 
          className="flex-1 bg-green-600 hover:bg-green-700 font-bold relative z-50 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleAddItem(); 
            toast.success("Redirecting... 🚀");
            setTimeout(() => navigate("/checkout"), 500); 
          }}
        >
          Buy
        </Button>

      </CardFooter>
    </Card>
  );
};

export default ProductCard;