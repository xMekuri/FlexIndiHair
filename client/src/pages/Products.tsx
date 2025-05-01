import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";
import ProductGrid from "@/components/Products/ProductGrid";
import ProductFilter from "@/components/Products/ProductFilter";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function Products() {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  
  const [page, setPage] = useState(parseInt(queryParams.get("page") || "1"));
  const [categorySlug, setCategorySlug] = useState<string | null>(queryParams.get("category"));
  const [searchTerm, setSearchTerm] = useState<string | null>(queryParams.get("search"));
  const [sort, setSort] = useState<string>(queryParams.get("sort") || "createdAt_desc");
  
  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (categorySlug) params.set("category", categorySlug);
    if (searchTerm) params.set("search", searchTerm);
    if (sort) params.set("sort", sort);
    
    const newUrl = `/products${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [page, categorySlug, searchTerm, sort]);
  
  // Fetch categories for filter
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Fetch products
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['/api/products', { page, categorySlug, searchTerm, sort }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "12");
      params.set("active", "true");
      if (categorySlug) params.set("categoryId", getCategoryIdFromSlug(categorySlug));
      if (searchTerm) params.set("search", searchTerm);
      if (sort) params.set("sort", sort);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });
  
  // Helper function to get category ID from slug
  const getCategoryIdFromSlug = (slug: string): string => {
    if (!categories) return "";
    const category = categories.find((cat: any) => cat.slug === slug);
    return category ? category.id.toString() : "";
  };
  
  // Handle pagination change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Get the current category name from slug
  const getCurrentCategoryName = (): string => {
    if (!categorySlug || !categories) return "All Products";
    const category = categories.find((cat: any) => cat.slug === categorySlug);
    return category ? category.name : "All Products";
  };
  
  return (
    <>
      <Helmet>
        <title>{getCurrentCategoryName()} - FlexIndi Hair</title>
        <meta 
          name="description" 
          content={`Shop ${getCurrentCategoryName().toLowerCase()} from FlexIndi Hair. Premium quality hair extensions and hair care products.`} 
        />
      </Helmet>
      
      <div className="bg-accent py-12">
        <div className="container mx-auto">
          <h1 className="font-playfair font-bold text-3xl md:text-4xl text-center">
            {searchTerm ? `Search Results for: ${searchTerm}` : getCurrentCategoryName()}
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-1/4">
            <ProductFilter 
              categories={categories || []}
              isLoading={isCategoriesLoading}
              selectedCategory={categorySlug}
              onCategoryChange={setCategorySlug}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortOption={sort}
              onSortChange={setSort}
            />
          </div>
          
          {/* Product Grid */}
          <div className="w-full md:w-3/4">
            {isProductsLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : productsData?.products?.length > 0 ? (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing {productsData.products.length} of {productsData.pagination.total} products
                  </p>
                </div>
                
                <ProductGrid products={productsData.products} />
                
                {/* Pagination */}
                {productsData.pagination.totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(page - 1)}
                          className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: productsData.pagination.totalPages }, (_, i) => i + 1)
                        .filter(pageNum => (
                          pageNum === 1 || 
                          pageNum === productsData.pagination.totalPages || 
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ))
                        .map((pageNum, index, array) => {
                          // Add ellipsis
                          if (index > 0 && pageNum - array[index - 1] > 1) {
                            return (
                              <PaginationItem key={`ellipsis-${pageNum}`}>
                                <span className="px-4 py-2">...</span>
                              </PaginationItem>
                            );
                          }
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <Button
                                variant={pageNum === page ? "default" : "outline"}
                                className={pageNum === page ? "bg-primary hover:bg-primary/90" : ""}
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            </PaginationItem>
                          );
                        })}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(page + 1)}
                          className={page >= productsData.pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter to find what you're looking for.</p>
                <Button onClick={() => { setCategorySlug(null); setSearchTerm(null); setSort("createdAt_desc"); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
