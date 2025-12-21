import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

const Shop = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (category) {
          const filtered = data.filter((p: any) => p.category && p.category.toLowerCase() === category.toLowerCase());
          setProducts(filtered);
        } else {
          setProducts(data);
        }
      });
  }, [category]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-green-500 capitalize">{category ? `${category} Collection` : "All Products"}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product: any) => (
              <ProductCard key={product._id} id={product._id} title={product.name} price={product.price} image={product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`} sizes={product.sizes}/>
            ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default Shop;