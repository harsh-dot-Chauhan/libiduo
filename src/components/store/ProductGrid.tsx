import ProductCard from "./ProductCard";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  images: string;
  stock: number;
  category: { id: string; name: string; slug: string };
};

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", textAlign: "center", border: "0.5px dashed rgba(201,151,58,0.25)", borderRadius: 16 }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: "#B8A99A" }}>No products found</p>
        <p style={{ fontSize: 13, color: "#6B5A50", marginTop: 4 }}>Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
