import { useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { Eye, ShoppingBag, Star } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: string | number;
    compareAtPrice?: string | number;
    mainImageUrl: string;
    slug: string;
    isNew?: boolean;
    isOnSale?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  
  // Convert price to number if it's a string
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const compareAtPrice = product.compareAtPrice ? 
    (typeof product.compareAtPrice === 'string' ? parseFloat(product.compareAtPrice) : product.compareAtPrice) 
    : null;
  
  // Handle add to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price,
      quantity: 1,
      mainImageUrl: product.mainImageUrl,
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  return (
    <div 
      className="bg-white rounded-md overflow-hidden group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative">
          <div 
            className="w-full h-64 bg-cover bg-center transition duration-300"
            style={{ backgroundImage: `url(${product.mainImageUrl})` }}
          ></div>
          
          {product.isNew && (
            <div className="absolute top-0 right-0 bg-primary text-white text-sm font-medium px-3 py-1">
              NEW
            </div>
          )}
          
          {product.isOnSale && compareAtPrice && (
            <div className="absolute top-0 right-0 bg-red-500 text-white text-sm font-medium px-3 py-1">
              SALE
            </div>
          )}
          
          <div 
            className={`absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/product/${product.slug}`;
                }}
                className="bg-white text-darkgray hover:bg-primary hover:text-white p-3 rounded-full transition"
                aria-label={`View ${product.name}`}
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={handleAddToCart}
                className="bg-white text-darkgray hover:bg-primary hover:text-white p-3 rounded-full transition"
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex text-yellow-400 mb-2">
          <Star className="w-4 h-4 fill-current" />
          <Star className="w-4 h-4 fill-current" />
          <Star className="w-4 h-4 fill-current" />
          <Star className="w-4 h-4 fill-current" />
          <div className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
            </div>
          </div>
        </div>
        
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-medium text-lg mb-1 hover:text-primary transition">
            {product.name}
          </h3>
        </Link>
        
        {compareAtPrice ? (
          <p className="font-semibold">
            <span className="text-primary">${price.toFixed(2)}</span> 
            <span className="text-gray-400 line-through ml-2">${compareAtPrice.toFixed(2)}</span>
          </p>
        ) : (
          <p className="text-primary font-semibold">${price.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}
