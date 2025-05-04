import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Trash2, Plus, Minus, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import BestSellers from "@/components/Home/BestSellers";

export default function Cart() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();
  
  // Calculate shipping and total
  const shippingFee = subtotal > 150 ? 0 : 15;
  const taxRate = 0.07; // 7% tax rate
  const tax = subtotal * taxRate;
  const total = subtotal + shippingFee + tax;
  
  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add products to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }
    
    navigate('/checkout');
  };
  
  return (
    <>
      <Helmet>
        <title>Shopping Cart - FlexIndi Hair</title>
        <meta name="description" content="Review your FlexIndi Hair shopping cart and proceed to checkout." />
      </Helmet>
      
      {/* Breadcrumb */}
      <div className="bg-accent py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-500">Shopping Cart</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-playfair text-3xl font-bold mb-8">Shopping Cart</h1>
        
        {items.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>
                
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-col">
                      {/* Product */}
                      <div className="md:col-span-6 flex items-center mb-4 md:mb-0">
                        <div className="relative w-20 h-20 mr-4 flex-shrink-0">
                          <img 
                            src={item.mainImageUrl || item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div>
                          <Link 
                            href={`/product/${item.id}`} 
                            className="font-medium hover:text-primary transition"
                          >
                            {item.name}
                          </Link>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="md:col-span-2 md:text-center flex justify-between md:block mb-4 md:mb-0">
                        <span className="md:hidden font-medium">Price:</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                      
                      {/* Quantity */}
                      <div className="md:col-span-2 md:text-center flex justify-between md:block mb-4 md:mb-0">
                        <span className="md:hidden font-medium">Quantity:</span>
                        <div className="flex items-center justify-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-gray-600 hover:text-primary"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 py-1 border-x border-gray-300 min-w-[30px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:text-primary"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Subtotal */}
                      <div className="md:col-span-2 md:text-right flex justify-between md:block items-center">
                        <span className="md:hidden font-medium">Subtotal:</span>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">${(item.price * item.quantity).toFixed(2)}</span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-4">
                <Link href="/products" className="flex items-center text-sm font-medium text-primary hover:underline">
                  <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
                  Continue Shopping
                </Link>
                <button 
                  onClick={clearCart}
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear Cart
                </button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-playfair text-xl font-bold mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        <span>${shippingFee.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (7%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-4 font-bold flex justify-between">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {subtotal < 150 && (
                    <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
                      <AlertDescription>
                        Add ${(150 - subtotal).toFixed(2)} more to qualify for free shipping!
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    onClick={handleProceedToCheckout}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <div className="mt-6 text-xs text-center text-gray-500">
                    <p>We accept credit cards, PayPal, and more.</p>
                    <div className="flex justify-center mt-2 space-x-2">
                      <span className="inline-block w-8 h-5 bg-gray-200 rounded"></span>
                      <span className="inline-block w-8 h-5 bg-gray-200 rounded"></span>
                      <span className="inline-block w-8 h-5 bg-gray-200 rounded"></span>
                      <span className="inline-block w-8 h-5 bg-gray-200 rounded"></span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
            <Button 
              onClick={() => navigate('/products')}
              className="bg-primary hover:bg-primary/90"
            >
              Start Shopping
            </Button>
            
            <div className="mt-16">
              <BestSellers title="You might like these" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
