import { useQuery } from "@tanstack/react-query";
import ProductCard from "../Products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface BestsellersProps {
  title?: string;
}

export default function Bestsellers({ title = "Our Bestsellers" }: BestsellersProps) {
  // Fetch featured products
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/products', { featured: true, limit: 4 }],
    queryFn: async () => {
      const response = await fetch('/api/products?featured=true&limit=4&active=true');
      if (!response.ok) throw new Error('Failed to fetch featured products');
      return response.json();
    },
  });

  return (
    <section className="py-16 bg-lightgray">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="font-playfair font-bold text-3xl">{title}</h2>
          <Link href="/products" className="text-primary font-medium hover:underline">
            View All Products
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-md overflow-hidden">
                <Skeleton className="w-full h-64" />
                <div className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-40 mb-1" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : error || !data || !data.products || data.products.length === 0 ? (
          <p className="text-center text-gray-500">
            No featured products available at the moment. Please check back later.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
