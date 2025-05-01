import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryHighlights() {
  // Fetch categories
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-playfair font-bold text-3xl md:text-4xl text-center mb-12">Shop By Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full h-80 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !categories || categories.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-playfair font-bold text-3xl md:text-4xl text-center mb-12">Shop By Category</h2>
          <p className="text-center text-gray-500">Categories are currently unavailable. Please check back later.</p>
        </div>
      </section>
    );
  }

  // Take the first 3 categories
  const displayCategories = categories.slice(0, 3);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-playfair font-bold text-3xl md:text-4xl text-center mb-12">Shop By Category</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayCategories.map((category) => (
            <div key={category.id} className="relative rounded-lg overflow-hidden group">
              <div 
                className="w-full h-80 bg-cover bg-center transition duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${category.imageUrl})` }}
              ></div>
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="font-playfair font-bold text-2xl mb-2">{category.name}</h3>
                  <Link 
                    href={`/products?category=${category.slug}`}
                    className="inline-block border border-white hover:bg-white hover:text-darkgray py-2 px-6 transition"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
