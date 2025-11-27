import { Link } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";

const Header = () => {
  const { items } = useCart();
  // Show the number of distinct items in cart (count of entries)
  const cartCount = items.length;

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/samlogo-photoaidcom-cropped.jpg" alt="Skluxewear.in logo" className="h-10 w-auto rounded" />
            <span className="text-xl font-bold text-primary hidden sm:inline">Skluxewear.in</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/products?category=men" className="text-foreground hover:text-primary transition-colors">
              Men
            </Link>
            <Link to="/products?category=women" className="text-foreground hover:text-primary transition-colors">
              Women
            </Link>
            <Link to="/products?category=kids" className="text-foreground hover:text-primary transition-colors">
              Kids
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <User size={20} />
              <span className="hidden sm:inline">Login</span>
            </Link>
            <Link to="/cart" className="relative flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
