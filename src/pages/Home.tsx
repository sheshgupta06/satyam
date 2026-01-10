import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("https://satyam-production-066b.up.railway.app/api/products");
        const data = await res.json();

        // Trending: latest 4
        setTrendingProducts(data.slice(0, 4));
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[400px] bg-secondary flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop"
          alt="Fashion store interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
            Welcome to Skluxewear.in
          </h1>
          <p className="text-xl text-foreground/80 mb-8">
            Discover the latest trends in fashion
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Trending Products */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-foreground">Trending Products</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trendingProducts.map((product) => (
            <ProductCard
              key={product._id}
              id={product._id}
              title={product.name}
              price={product.price}
              image={product.image}
              sizes={product.sizes}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/products">
            <Button variant="outline">View All Products</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
