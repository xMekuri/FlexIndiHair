import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

// Form validation schema
const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  sku: z.string().optional(),
  stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
  imageUrl: z.string().url("Must be a valid URL"),
  categoryId: z.coerce.number().positive("Please select a category"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function EditProduct() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch categories for dropdown
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      // Get admin token from localStorage
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });
  
  // Fetch product data (only if id is provided and we're in edit mode)
  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      // Skip fetching for new products
      if (!id || id === 'new') {
        return null;
      }
      
      // Get admin token from localStorage
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
    enabled: !!id && id !== 'new', // Only run query if id exists and is not 'new'
  });
  
  // Form setup
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      sku: "",
      stockQuantity: 0,
      imageUrl: "",
      categoryId: 0,
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      isNew: false,
      isOnSale: false,
    },
  });
  
  // Update form with product data when loaded
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        sku: product.sku || "",
        stockQuantity: Number(product.stockQuantity) || 0,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        isActive: product.isActive,
        isFeatured: product.isFeatured || false,
        isBestSeller: product.isBestSeller || false,
        isNew: product.isNew || false,
        isOnSale: product.isOnSale || false,
      });
    }
  }, [product, form]);
  
  // Create new product mutation
  const createProduct = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Get admin token from localStorage
      const token = localStorage.getItem('admin_token');
      
      // Convert and format values for the API
      const formattedData = {
        ...data,
        // Convert stockQuantity to stock since server expects "stock"
        stock: data.stockQuantity,
        // Convert boolean values to strings for the API
        isActive: data.isActive ? "true" : "false",
        isFeatured: data.isFeatured ? "true" : "false",
        isBestSeller: data.isBestSeller ? "true" : "false",
        isNew: data.isNew ? "true" : "false",
        isOnSale: data.isOnSale ? "true" : "false",
      };
      
      console.log("Sending product create data:", formattedData);
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Product creation error:', error);
        let errorMessage = 'Failed to create product';
        
        if (error.message) {
          // Simple error message
          errorMessage = error.message;
        } else if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
          // ZodError format
          errorMessage = error.errors.map((err: any) => err.message).join(', ');
        }
        
        throw new Error(errorMessage);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      navigate("/admin/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateProduct = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Get admin token from localStorage
      const token = localStorage.getItem('admin_token');
      
      // Convert and format values for the API
      const formattedData = {
        ...data,
        // Convert stockQuantity to stock since server expects "stock"
        stock: data.stockQuantity,
        // Convert boolean values to strings for the API
        isActive: data.isActive ? "true" : "false",
        isFeatured: data.isFeatured ? "true" : "false",
        isBestSeller: data.isBestSeller ? "true" : "false",
        isNew: data.isNew ? "true" : "false",
        isOnSale: data.isOnSale ? "true" : "false",
      };
      
      console.log("Sending product update data:", formattedData);
      
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Product update error:', error);
        throw new Error(error.message || error.errors?.[0]?.message || 'Failed to update product');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      navigate("/admin/products");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });
  
  // Check if we are in "new product" mode
  const isNewProduct = !id || id === 'new';
  
  // Form submission handler
  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
      if (isNewProduct) {
        await createProduct.mutateAsync(data);
      } else {
        await updateProduct.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Only show loading if we're fetching an existing product or categories
  if ((isProductLoading && !isNewProduct) || isCategoriesLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate("/admin/products")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>{isNewProduct ? "Add New Product" : "Edit Product"}</CardTitle>
          <CardDescription>
            {isNewProduct 
              ? "Create a new product by filling out the form below."
              : "Make changes to the product information here."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Argan Oil Hair Mask" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Slug */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. argan-oil-hair-mask" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL-friendly version of the product name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value === "" ? "0" : e.target.value;
                            field.onChange(parseFloat(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* SKU */}
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. HC-001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Stock Keeping Unit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Stock Quantity */}
                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="1" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value === "" ? "0" : e.target.value;
                            field.onChange(parseInt(value, 10));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Category */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value, 10))}
                        defaultValue={field.value.toString()}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Image URL */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Product description" 
                          className="min-h-32" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4">
                {/* Is Active */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Show in store
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Is Featured */}
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>
                          Featured product
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Is Best Seller */}
                <FormField
                  control={form.control}
                  name="isBestSeller"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Best Seller</FormLabel>
                        <FormDescription>
                          Bestselling product
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Is New */}
                <FormField
                  control={form.control}
                  name="isNew"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>New</FormLabel>
                        <FormDescription>
                          New arrival
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Is On Sale */}
                <FormField
                  control={form.control}
                  name="isOnSale"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>On Sale</FormLabel>
                        <FormDescription>
                          Sale item
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isNewProduct ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isNewProduct ? "Create Product" : "Save Changes"}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}