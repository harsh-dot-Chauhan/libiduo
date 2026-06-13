import Image from "next/image";
import Link from "next/link";

type Props = {
  id: string;
  name: string;
  slug: string;
  price: string | number;
  images: string;
  category: { name: string; slug: string };
  stock: number;
};

export default function ProductCard({ name, slug, price, images, category, stock }: Props) {
  const imageList: string[] = JSON.parse(images);
  const firstImage = imageList[0] ?? "";
  const priceNum = typeof price === "string" ? parseFloat(price) : price;

  return (
    <Link href={`/products/${slug}`} className="group flex flex-col" style={{ textDecoration: "none" }}>
      <div style={{ position: "relative", aspectRatio: "1", overflow: "hidden", borderRadius: 12, background: "linear-gradient(135deg, #6B1A2A 0%, #1A0C10 100%)" }}>
        {firstImage && (
          <Image
            src={firstImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ opacity: 0.9 }}
          />
        )}
        {stock === 0 && (
          <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(13,6,8,0.85)", color: "#B8A99A", fontSize: 10, padding: "3px 10px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase" }}>
            Sold Out
          </span>
        )}
      </div>

      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={{ fontSize: 10, color: "#C9973A", letterSpacing: 2, textTransform: "uppercase" }}>{category.name}</p>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: "#F0E6D3", lineHeight: 1.4 }} className="line-clamp-2 group-hover:text-[#C9973A] transition-colors">
          {name}
        </h3>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#C9973A", marginTop: 2 }}>
          ₹{priceNum.toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );
}
