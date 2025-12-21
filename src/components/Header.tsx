import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useEffect, useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    setIsAdmin(!!sessionStorage.getItem("sambhai-admin"));
    setIsUser(!!sessionStorage.getItem("userInfo"));
  }, [location]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black text-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/samlogo-photoaidcom-cropped.jpg" alt="Skluxewear.in" className="h-10 w-auto rounded" />
          <span className="text-lg font-bold text-green-500">Skluxewear.in</span>
        </Link>
        
        {/* Navigation */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
          <Link to="/" className="hover:text-green-400 transition-colors">Home</Link>
          <Link to="/shop/Men" className="hover:text-green-400 transition-colors">Men</Link>
          <Link to="/shop/Women" className="hover:text-green-400 transition-colors">Women</Link>
          <Link to="/shop/Kids" className="hover:text-green-400 transition-colors">Kids</Link>
        </nav>
        <div className="flex items-center gap-4">
          {isAdmin ? (
            <>
              <Link to="/admin"><Button variant="ghost" className="text-green-400"><LayoutDashboard className="mr-2 h-5 w-5"/>Panel</Button></Link>
              <Button onClick={()=>{sessionStorage.clear(); navigate("/user-login")}} variant="destructive" size="sm">Logout</Button>
            </>
          ) : isUser ? (
            <>
              <Link to="/cart"><Button variant="ghost" size="icon"><ShoppingCart className="h-5 w-5 text-gray-300" /></Button></Link>
              <Link to="/profile"><Button variant="ghost"><User className="mr-2 h-5 w-5 text-gray-300"/>Profile</Button></Link>
              <Button onClick={()=>{sessionStorage.clear(); navigate("/user-login")}} variant="ghost" size="icon" className="text-red-500"><LogOut className="h-5 w-5"/></Button>
            </>
          ) : (
            <>
              <Link to="/cart"><Button variant="ghost" size="icon"><ShoppingCart className="h-5 w-5 text-gray-300" /></Button></Link>
              <Link to="/user-login"><Button className="bg-green-600 hover:bg-green-700 text-white">Login</Button></Link>
            </>
          )}
          <Sheet>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /></Button></SheetTrigger>
            <SheetContent side="right" className="bg-gray-900 text-white">
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/" className="hover:text-green-400 transition-colors font-medium">Home</Link>
                <Link to="/shop/Men" className="hover:text-green-400 transition-colors font-medium">Men</Link>
                <Link to="/shop/Women" className="hover:text-green-400 transition-colors font-medium">Women</Link>
                <Link to="/shop/Kids" className="hover:text-green-400 transition-colors font-medium">Kids</Link>
                <Link to="/contact" className="hover:text-green-400 transition-colors font-medium">Contact</Link>
                <Link to="/terms" className="hover:text-green-400 transition-colors font-medium">Terms</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
export default Header;