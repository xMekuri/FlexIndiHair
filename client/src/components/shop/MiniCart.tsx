import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import CartItem from '@/components/shop/CartItem';
import { useCart } from '@/hooks/useCart';

const MiniCart = () => {
  const { items, cartTotal } = useCart();

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg p-4 z-10">
      <h3 className="font-semibold mb-2">Your Cart ({items.length})</h3>
      
      <div className="max-h-64 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">Your cart is empty</p>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              imageUrl={item.imageUrl || item.mainImageUrl}
              quantity={item.quantity}
              mini={true}
            />
          ))
        )}
      </div>
      
      {items.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between font-semibold">
            <span>Subtotal:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="mt-3 flex flex-col space-y-2">
            <Button asChild variant="primary">
              <Link href="/checkout">Checkout</Link>
            </Button>
            <Button asChild variant="primaryOutline">
              <Link href="/cart">View Cart</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniCart;
