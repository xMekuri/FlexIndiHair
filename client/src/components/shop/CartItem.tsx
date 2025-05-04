import { MinusCircle, PlusCircle, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  mini?: boolean;
}

const CartItem = ({ id, name, price, imageUrl, quantity, mini = false }: CartItemProps) => {
  const { updateItemQuantity, removeItem } = useCart();

  const handleIncreaseQuantity = () => {
    updateItemQuantity(id, quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      updateItemQuantity(id, quantity - 1);
    } else {
      removeItem(id);
    }
  };

  const handleRemove = () => {
    removeItem(id);
  };

  if (mini) {
    return (
      <div className="flex items-center py-2 border-b">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-12 h-12 object-cover rounded"
        />
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-gray-500">{quantity} x ${price.toFixed(2)}</p>
        </div>
        <button 
          className="text-xs text-gray-400 hover:text-destructive"
          onClick={handleRemove}
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center py-4 border-b">
      <div className="flex items-center flex-1">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-20 h-20 object-cover rounded"
        />
        <div className="ml-4">
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-gray-500 mt-1">${price.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 sm:mt-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleDecreaseQuantity}
            className="text-gray-400 hover:text-primary transition"
          >
            <MinusCircle size={18} />
          </button>
          <span className="w-8 text-center">{quantity}</span>
          <button 
            onClick={handleIncreaseQuantity}
            className="text-gray-400 hover:text-primary transition"
          >
            <PlusCircle size={18} />
          </button>
        </div>
        
        <div className="ml-8 font-semibold w-20 text-right">
          ${(price * quantity).toFixed(2)}
        </div>
        
        <button 
          onClick={handleRemove}
          className="ml-4 text-gray-400 hover:text-destructive transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
