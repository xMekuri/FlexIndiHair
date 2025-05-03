import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import { Helmet } from "react-helmet";
import { 
  Loader2, 
  Star, 
  StarHalf, 
  ChevronRight, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Heart, 
  Share, 
  Truck, 
  Award, 
  ArrowLeftRight, 
  Headset 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/context/CartContext";
import Bestsellers from "@/components/Home/Bestsellers";

export default function ProductDetail() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  
  // Fetch product details
  const { data: product, isLoading, isError } = useQuery({
    queryKey: [`/api/products/slug/${slug}`],
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-20 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isError || !product) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6">Sorry, the product you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
      </div>
    );
  }
  
  // Calculate average rating
  const averageRating = product.productReviews?.length 
    ? product.productReviews.reduce((acc: number, review: any) => acc + review.rating, 0) / product.productReviews.length 
    : 0;
  
  // Handle quantity change
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleIncreaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      toast({
        title: "Maximum quantity reached",
        description: `Sorry, only ${product.stock} items are available.`,
      });
    }
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity,
      mainImageUrl: product.mainImageUrl,
    });
    
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} has been added to your cart.`,
    });
  };
  
  // Product images including main image and additional images
  const mainImage = product.mainImageUrl || product.imageUrl;
  const allImages = [
    mainImage,
    ...(product.productImages?.map((img: any) => img.imageUrl) || [])
  ];
  
  return (
    <>
      <Helmet>
        <title>{product.name} - FlexIndi Hair</title>
        <meta name="description" content={product.description.substring(0, 160)} />
      </Helmet>
      
      {/* Breadcrumb */}
      <div className="bg-accent py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/products" className="hover:text-primary transition">Products</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href={`/products?category=${product.category?.slug}`} className="hover:text-primary transition">
              {product.category?.name}
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-500">{product.name}</span>
          </div>
        </div>
      </div>
      
      {/* Product Details */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
              <img 
                src={allImages[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
              {product.isNew && (
                <div className="absolute top-4 right-4 bg-primary text-white text-sm font-medium px-3 py-1">
                  NEW
                </div>
              )}
              {product.isOnSale && product.compareAtPrice && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-medium px-3 py-1">
                  SALE
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, index) => (
                  <div 
                    key={index}
                    className={`cursor-pointer aspect-square overflow-hidden rounded-md border-2 ${
                      activeImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} - view ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="font-playfair font-bold text-3xl mb-2">{product.name}</h1>
            
            {/* Ratings */}
            {product.productReviews?.length > 0 && (
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 mr-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    if (star <= Math.floor(averageRating)) {
                      return <Star key={star} className="w-4 h-4 fill-current" />;
                    } else if (star === Math.ceil(averageRating) && !Number.isInteger(averageRating)) {
                      return <StarHalf key={star} className="w-4 h-4 fill-current" />;
                    } else {
                      return <Star key={star} className="w-4 h-4 text-gray-300" />;
                    }
                  })}
                </div>
                <span className="text-sm text-gray-600">
                  {product.productReviews.length} {product.productReviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}
            
            {/* Price */}
            <div className="mb-6">
              {product.compareAtPrice ? (
                <div className="flex items-center">
                  <span className="text-2xl font-semibold text-primary">${parseFloat(product.price).toFixed(2)}</span>
                  <span className="ml-2 text-gray-400 line-through text-lg">
                    ${parseFloat(product.compareAtPrice).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-semibold text-primary">${parseFloat(product.price).toFixed(2)}</span>
              )}
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <p className="text-gray-700">{product.description}</p>
            </div>
            
            {/* Stock Status */}
            <div className="mb-6">
              <p className="text-sm">
                <span className="font-medium">Availability:</span>{' '}
                {product.stock > 0 ? (
                  <span className="text-green-600">In Stock ({product.stock} available)</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">SKU:</span> {product.sku}
              </p>
            </div>
            
            {/* Add to Cart */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex items-center border border-gray-300 rounded-md mr-4">
                  <button
                    onClick={handleDecreaseQuantity}
                    className="px-3 py-2 text-gray-600 hover:text-primary disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncreaseQuantity}
                    className="px-3 py-2 text-gray-600 hover:text-primary disabled:opacity-50"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <Button 
                  onClick={handleAddToCart}
                  className="flex items-center bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md"
                  disabled={product.stock <= 0}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
              
              <div className="flex space-x-4">
                <button className="flex items-center text-gray-600 hover:text-primary">
                  <Heart className="w-5 h-5 mr-1" />
                  <span className="text-sm">Add to Wishlist</span>
                </button>
                <button className="flex items-center text-gray-600 hover:text-primary">
                  <Share className="w-5 h-5 mr-1" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Truck className="w-5 h-5 text-primary mr-2" />
                <span className="text-sm">Free shipping over $150</span>
              </div>
              <div className="flex items-center">
                <Award className="w-5 h-5 text-primary mr-2" />
                <span className="text-sm">Premium quality</span>
              </div>
              <div className="flex items-center">
                <ArrowLeftRight className="w-5 h-5 text-primary mr-2" />
                <span className="text-sm">30-day returns</span>
              </div>
              <div className="flex items-center">
                <Headset className="w-5 h-5 text-primary mr-2" />
                <span className="text-sm">24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList className="w-full border-b justify-start">
              <TabsTrigger value="description" className="font-medium">Description</TabsTrigger>
              <TabsTrigger value="reviews" className="font-medium">Reviews ({product.productReviews?.length || 0})</TabsTrigger>
              <TabsTrigger value="shipping" className="font-medium">Shipping & Returns</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="py-6">
              <div className="prose max-w-none">
                <p>{product.description}</p>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="py-6">
              {product.productReviews?.length > 0 ? (
                <div className="space-y-6">
                  {product.productReviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-6">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <div className="font-medium mr-2">
                            {review.customer.firstName} {review.customer.lastName}
                          </div>
                          <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-4 h-4 ${
                                  star <= review.rating ? 'fill-current' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">This product has no reviews yet. Be the first to leave a review!</p>
                  <Button onClick={() => navigate('/login')}>
                    Leave a Review
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="shipping" className="py-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-medium mb-4">Shipping</h3>
                <p>We offer free shipping on all orders over $150. Standard shipping typically takes 3-5 business days, while expedited shipping takes 1-2 business days.</p>
                
                <h3 className="text-xl font-medium mt-6 mb-4">Returns</h3>
                <p>We accept returns within 30 days of delivery. Items must be unused, unworn, and in the original packaging. To initiate a return, please contact our customer service team.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Related Products */}
        <div className="mt-16">
          <Bestsellers title="You May Also Like" />
        </div>
      </div>
    </>
  );
}
