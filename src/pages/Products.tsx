import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import productsData from "@/data/products.json";

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState(productsData);
  const [category, setCategory] = useState(searchParams.get("category") || "all");

  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    setCategory(cat);
    
    if (cat === "all") {
      setProducts(productsData);
    } else {
      setProducts(productsData.filter((p) => p.category === cat));
    }
  }, [searchParams]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    if (newCategory === "all") {
      setProducts(productsData);
    } else {
      setProducts(productsData.filter((p) => p.category === newCategory));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">
          {category === "all" ? "All Products" : `${category.charAt(0).toUpperCase() + category.slice(1)}'s Collection`}
        </h1>

        {/* Category Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Button
            variant={category === "all" ? "default" : "outline"}
            onClick={() => handleCategoryChange("all")}
          >
            All
          </Button>
          <Button
            variant={category === "men" ? "default" : "outline"}
            onClick={() => handleCategoryChange("men")}
          >
            Men
          </Button>
          <Button
            variant={category === "women" ? "default" : "outline"}
            onClick={() => handleCategoryChange("women")}
          >
            Women
          </Button>
          <Button
            variant={category === "kids" ? "default" : "outline"}
            onClick={() => handleCategoryChange("kids")}
          >
            Kids
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              image={product.image}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No products found in this category.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;
