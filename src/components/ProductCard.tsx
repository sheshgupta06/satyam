import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
}

const ProductCard = ({ id, title, price, image }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, title, price, image, size: "" });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, title, price, image, size: "" });
    navigate("/checkout");
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/product/${id}`} className="block">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-foreground mb-2 line-clamp-1">{title}</h3>
          <p className="text-lg font-semibold text-price">₹{price}</p>
        </CardContent>
      </Link>

      <div className="p-4 pt-0 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleAdd} className="flex-1">
          Add to Cart
        </Button>
        <Button size="sm" onClick={handleBuyNow} className="flex-1">
          Buy
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
