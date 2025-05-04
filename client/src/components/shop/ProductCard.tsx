import { useState } from 'react';
import { Link } from 'wouter';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/icons/StarRating';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number | string;
  originalPrice: number | string | null;
  imageUrl: string;
  rating: number | string;
  reviewCount: number;
  badges: string[];
  hairType?: string[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Added to wishlist",
      description: `${product.name} has been added to your wishlist.`,
    });
  };

  const getBadgeVariant = (badgeText: string) => {
    if (badgeText === 'BEST SELLER') return 'bestseller';
    if (badgeText === 'NEW') return 'new';
    if (badgeText === 'SALE') return 'sale';
    return 'default';
  };

  return (
    <div 
      className="product-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative rounded-lg overflow-hidden mb-4">
        {product.badges && product.badges.length > 0 && (
          <span className="absolute top-2 left-2 z-10">
            <Badge variant={getBadgeVariant(product.badges[0])}>
              {product.badges[0]}
            </Badge>
          </span>
        )}
        
        <Link href={`/product/${product.id}`}>
          <a>
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-64 object-cover hover:scale-105 transition duration-300"
            />
            <div className="quick-view absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 transition duration-300">
              <button className="bg-white text-primary hover:bg-primary hover:text-white transition duration-300 rounded-full p-3">
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </a>
        </Link>
        
        <button 
          className="absolute top-2 right-2 bg-white rounded-full p-2 text-gray-600 hover:text-primary transition z-10"
          onClick={handleAddToWishlist}
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>
      
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-1">{product.category}</div>
        <h3 className="font-medium mb-1">
          <Link href={`/product/${product.id}`}>
            <a className="hover:text-primary transition">{product.name}</a>
          </Link>
        </h3>
        
        <div className="flex items-center justify-center mb-2">
          <StarRating rating={product.rating} />
          <span className="ml-1 text-xs text-gray-500">({product.reviewCount})</span>
        </div>
        
        <div className="font-semibold">
          {product.originalPrice ? (
            <>
              <span className="text-destructive">
                ${typeof product.price === 'number' 
                   ? product.price.toFixed(2) 
                   : parseFloat(product.price as string).toFixed(2)}
              </span>
              <span className="text-gray-400 line-through text-sm ml-1">
                ${typeof product.originalPrice === 'number' 
                   ? product.originalPrice.toFixed(2) 
                   : parseFloat(product.originalPrice as string).toFixed(2)}
              </span>
            </>
          ) : (
            <span>
              ${typeof product.price === 'number' 
                 ? product.price.toFixed(2) 
                 : parseFloat(product.price as string).toFixed(2)}
            </span>
          )}
        </div>
        
        <Button 
          variant="primary" 
          className="mt-2 w-full"
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
