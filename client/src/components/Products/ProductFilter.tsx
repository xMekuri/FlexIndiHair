import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useMobile } from "@/hooks/use-mobile";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductFilterProps {
  categories: Category[];
  isLoading: boolean;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  searchTerm: string | null;
  onSearchChange: (search: string | null) => void;
  sortOption: string;
  onSortChange: (sort: string) => void;
}

export default function ProductFilter({
  categories,
  isLoading,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  sortOption,
  onSortChange,
}: ProductFilterProps) {
  const isMobile = useMobile();
  const [isFiltersVisible, setIsFiltersVisible] = useState(!isMobile);
  const [searchInput, setSearchInput] = useState(searchTerm || "");
  
  // Handle mobile filter visibility
  useEffect(() => {
    setIsFiltersVisible(!isMobile);
  }, [isMobile]);
  
  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput.trim() || null);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    onSearchChange(null);
  };
  
  // Sort options
  const sortOptions = [
    { value: "createdAt_desc", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
    { value: "name_desc", label: "Name: Z to A" },
  ];
  
  // Toggle filters on mobile
  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };
  
  return (
    <div className="space-y-6">
      {isMobile && (
        <Button 
          onClick={toggleFilters} 
          variant="outline" 
          className="w-full flex items-center justify-between mb-4"
        >
          <span>Filters</span>
          {isFiltersVisible ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        </Button>
      )}
      
      {isFiltersVisible && (
        <>
          {/* Search */}
          <div className="space-y-2">
            <h3 className="font-medium">Search</h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pr-8"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
          
          {/* Sort By */}
          <div className="space-y-2">
            <h3 className="font-medium">Sort By</h3>
            <RadioGroup value={sortOption} onValueChange={onSortChange}>
              {sortOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`sort-${option.value}`} />
                  <Label htmlFor={`sort-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {/* Categories */}
          <Accordion type="single" collapsible defaultValue="categories">
            <AccordionItem value="categories" className="border-none">
              <AccordionTrigger className="py-2 px-0 font-medium">Categories</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="category-all"
                      checked={selectedCategory === null}
                      onChange={() => onCategoryChange(null)}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="category-all">All Categories</Label>
                  </div>
                  
                  {isLoading ? (
                    <div className="animate-pulse space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-5 bg-gray-200 rounded w-3/4"></div>
                      ))}
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`category-${category.slug}`}
                          checked={selectedCategory === category.slug}
                          onChange={() => onCategoryChange(category.slug)}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <Label htmlFor={`category-${category.slug}`}>{category.name}</Label>
                      </div>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Reset Filters */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onCategoryChange(null);
              setSearchInput("");
              onSearchChange(null);
              onSortChange("createdAt_desc");
            }}
          >
            Reset Filters
          </Button>
        </>
      )}
    </div>
  );
}
