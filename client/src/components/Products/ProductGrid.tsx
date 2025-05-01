import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Array<{
    id: number;
    name: string;
    price: string | number;
    compareAtPrice?: string | number;
    mainImageUrl: string;
    slug: string;
    isNew?: boolean;
    isOnSale?: boolean;
  }>;
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
