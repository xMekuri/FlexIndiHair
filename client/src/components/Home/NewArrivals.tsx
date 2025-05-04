import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/shop/ProductCard';

const NewArrivals = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products/new-arrivals'],
  });

  // Fallback to hardcoded products if API data is not available
  const displayProducts = products || [
    {
      id: 5,
      name: "Curl Defining Cream",
      category: "Styling",
      price: 21.99,
      originalPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1626015435409-b1ffe9648386?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      rating: 5,
      reviewCount: 12,
      badges: ["NEW"],
      hairType: ['curly-hair']
    },
    {
      id: 6,
      name: "Heat Protection Spray",
      category: "Protection",
      price: 16.99,
      originalPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1567888035048-31650a991818?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      rating: 4,
      reviewCount: 8,
      badges: ["NEW"],
      hairType: ['all']
    },
    {
      id: 7,
      name: "Scalp Treatment Serum",
      category: "Treatment",
      price: 25.99,
      originalPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1595352174519-7ece6fd128c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      rating: 4.5,
      reviewCount: 15,
      badges: ["NEW"],
      hairType: ['dry-hair', 'oily-hair']
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-heading font-bold">New Arrivals</h2>
          <Link href="/shop/new">
            <a className="text-primary hover:underline">
              View All <i className="fas fa-arrow-right ml-1"></i>
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-80 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
