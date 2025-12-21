import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-xl font-semibold">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="container mx-auto px-4 py-14">
        <h1 className="text-4xl font-bold mb-10">All Products</h1>

        {products.length === 0 ? (
          <div className="text-center text-gray-500 text-xl">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p: any) => (
              <ProductCard
                key={p._id}
                id={p._id}
                title={p.name}
                price={p.price}
                image={p.image}
                sizes={p.sizes || "One Size"}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Products;
