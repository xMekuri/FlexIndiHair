import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowUpDown,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Filter
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  subcategories?: Category[];
}

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);

  // Fetch categories
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Organize categories into parent and child relationships
  useEffect(() => {
    if (categoriesData) {
      const allCategories = categoriesData as Category[];
      
      // Find parent categories
      const parents = allCategories.filter(cat => cat.parent_id === null);
      
      // Assign subcategories to parents
      parents.forEach(parent => {
        parent.subcategories = allCategories.filter(cat => cat.parent_id === parent.id);
      });
      
      setParentCategories(parents);
      setCategories(allCategories);
    }
  }, [categoriesData]);

  // Fetch products with pagination and filtering
  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['/api/products', { page: currentPage, search: searchTerm, category: categoryFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      
      if (categoryFilter) {
        params.append("category", categoryFilter);
      }
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value === "all" ? null : value);
    setCurrentPage(1);
    refetch();
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (data && data.pagination && currentPage < data.pagination.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Product Management</CardTitle>
          <CardDescription>
            Manage your products, edit details, or remove products from your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Accordion type="single" collapsible defaultValue="filters">
              <AccordionItem value="filters">
                <AccordionTrigger className="py-2">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Filters & Search</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <form onSubmit={handleSearch} className="flex space-x-2">
                        <Input
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full"
                        />
                        <Button type="submit">
                          <Search className="h-4 w-4 mr-2" /> Search
                        </Button>
                      </form>
                    </div>
                    <div>
                      <Select 
                        value={categoryFilter || "all"} 
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          
                          {!isCategoriesLoading && parentCategories.map(parent => (
                            <SelectGroup key={parent.id}>
                              <SelectLabel>{parent.name}</SelectLabel>
                              {parent.subcategories?.map(sub => (
                                <SelectItem key={sub.id} value={sub.slug}>
                                  {sub.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !data || !data.products || data.products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No products found.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-1">
                          <span>Name</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.products.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="w-10 h-10 relative overflow-hidden rounded">
                            <div 
                              className="absolute inset-0 bg-cover bg-center"
                              style={{ backgroundImage: `url(${product.mainImageUrl})` }}
                            ></div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate" title={product.name}>
                          {product.name}
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>
                          ${typeof product.price === 'number' 
                            ? product.price.toFixed(2) 
                            : Number(product.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span className={product.stock <= 5 ? "text-red-500 font-medium" : ""}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          {product.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data.pagination && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div>
                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, data.pagination.total)}
                    </span>{" "}
                    of <span className="font-medium">{data.pagination.total}</span> products
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviousPage}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNextPage}
                      disabled={currentPage >= data.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}