import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/shop/ProductCard';

const BestSellers = () => {
  const [filter, setFilter] = useState('all');

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products/bestsellers'],
  });

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'dry-hair', label: 'Dry Hair' },
    { id: 'oily-hair', label: 'Oily Hair' },
    { id: 'curly-hair', label: 'Curly Hair' },
    { id: 'color-treated', label: 'Color-Treated' },
  ];

  // Fallback to hardcoded products if API data is not available
  const displayProducts = products || [
    {
      id: 1,
      name: "Hydrating Shampoo",
      category: "Shampoo",
      price: 18.99,
      originalPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      rating: 4.5,
      reviewCount: 42,
      badges: ["BEST SELLER"],
      hairType: ['all', 'dry-hair']
    },
    {
      id: 2,
      name: "Repair Conditioner",
      category: "Conditioner",
      price: 19.99,
      originalPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1575330933337-f8307c2dc3b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      rating: 5,
      reviewCount: 38,
      badges: [],
      hairType: ['all', 'dry-hair', 'color-treated']
    },
    {
      id: 3,
      name: "Nourishing Hair Oil",
      category: "Hair Oil",
      price: 24.99,
      originalPrice: 29.99,
      imageUrl: "https://images.unsplash.com/photo-1615351897587-97f8e6bc9688?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      rating: 4.5,
      reviewCount: 56,
      badges: ["SALE"],
      hairType: ['all', 'dry-hair', 'curly-hair']
    },
    {
      id: 4,
      name: "Hair Mask Treatment",
      category: "Treatment",
      price: 22.99,
      originalPrice: null,
      imageUrl: "https://images.unsplash.com/photo-1584856041512-ce471c1a4eb6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
      rating: 4,
      reviewCount: 29,
      badges: [],
      hairType: ['all', 'dry-hair', 'color-treated']
    }
  ];

  const filteredProducts = displayProducts.filter(product => 
    filter === 'all' || product.hairType.includes(filter)
  );

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-heading font-bold">Best Sellers</h2>
          <Link href="/shop">
            <a className="text-primary hover:underline">
              View All <i className="fas fa-arrow-right ml-1"></i>
            </a>
          </Link>
        </div>
        
        {/* Filters */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              className={`px-4 py-2 text-sm rounded-full ${
                filter === option.id 
                  ? 'bg-primary text-white' 
                  : 'border border-gray-300 hover:border-primary hover:text-primary transition'
              }`}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
