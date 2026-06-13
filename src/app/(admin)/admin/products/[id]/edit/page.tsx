import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

type Props = { params: { id: string } };

export default async function EditProductPage({ params }: Props) {
  const [product, categories] = await Promise.all([
    db.product.findFirst({ where: { id: params.id, deletedAt: null } }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  const defaultValues = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: parseFloat(product.price.toString()),
    stock: product.stock,
    images: JSON.parse(product.images) as string[],
    tags: product.tags ? (JSON.parse(product.tags) as string[]) : [],
    categoryId: product.categoryId,
    isActive: product.isActive,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Edit Product</h1>
      <ProductForm categories={categories} defaultValues={defaultValues} productSlug={product.slug} />
    </div>
  );
}
