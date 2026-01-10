import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Footer = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(!!sessionStorage.getItem("sambhai-admin"));
  }, [location]);

  return (
    <footer className="bg-secondary mt-16 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/samlogo-photoaidcom-cropped.jpg" alt="Skluxewear.in logo" className="h-10 w-auto rounded" />
              <h3 className="font-bold text-xl">Skluxewear.in</h3>
            </div>
            <p className="text-muted-foreground">Your trusted fashion destination for Men, Women, and kids.</p>
            <p className="text-muted-foreground mt-3 text-sm">
              Owner: Satyam Verma<br />
              Phone: 8922001933<br />
              Email: <a href="mailto:Satyamverma1933@gmail.com" className="text-primary">satyamverma1933@gmail.com</a><br />
              Address: Anand Nagar Maharajganj, Phrenda, 273155
            </p>
          </div>
          

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="hover:text-green-400 transition-colors">
                 All Products
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Admin</h3>
            <ul className="space-y-2">
              {isAdmin ? (
                <li>
                  <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                    Admin Panel
                  </Link>
                </li>
              ) : (
                <li>
                  <Link to="/admin-login" className="text-muted-foreground hover:text-primary transition-colors">
                    Admin Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center">
          <p className="text-muted-foreground">© Skluxewear.in 2025. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
