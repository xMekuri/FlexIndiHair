import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import ProductCard from '@/components/shop/ProductCard';
import ProductFilter from '@/components/shop/ProductFilter';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Shop = () => {
  const [location] = useLocation();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  
  const categoryParam = searchParams.get('category');
  
  const [filters, setFilters] = useState({
    categories: categoryParam ? [categoryParam] : [],
    hairTypes: [],
    concerns: [],
    priceRange: [0, 100] as [number, number]
  });
  
  const [sortBy, setSortBy] = useState('featured');
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products', filters, sortBy],
  });
  
  // Apply filters to the fetched products
  const applyFilters = (newFilters: {
    categories: string[];
    hairTypes: string[];
    concerns: string[];
    priceRange: [number, number];
  }) => {
    setFilters(newFilters);
  };

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'best-selling', label: 'Best Selling' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold mb-2">All Products</h1>
      
      <div className="flex flex-col md:flex-row mt-6 gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-1/4">
          <ProductFilter onFilter={applyFilters} />
        </div>
        
        {/* Product Grid */}
        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-500">
              {isLoading ? (
                'Loading products...'
              ) : (
                `Showing ${products?.length || 0} products`
              )}
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(9).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
