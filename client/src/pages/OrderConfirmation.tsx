import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Helmet } from "react-helmet";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderTracking from "@/components/Orders/OrderTracking";

export default function OrderConfirmation() {
  const [location] = useLocation();
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    // Extract the order ID from the URL query parameters
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const id = searchParams.get('id');
    
    if (id && !isNaN(parseInt(id))) {
      setOrderId(parseInt(id));
    }
  }, [location]);

  return (
    <>
      <Helmet>
        <title>Order Confirmation - FlexIndi Hair</title>
        <meta name="description" content="Your order has been confirmed. Track your order status." />
      </Helmet>
      
      {/* Breadcrumb */}
      <div className="bg-accent py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/checkout" className="hover:text-primary transition">Checkout</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-500">Order Confirmation</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-playfair text-3xl font-bold mb-8 text-center">Order Confirmation</h1>
        
        {orderId ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center bg-green-100 rounded-full h-20 w-20 mb-4">
                <svg
                  className="h-10 w-10 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Thank you for your order!</h2>
              <p className="text-gray-600 mb-4">
                Your order #{orderId} has been placed and is being processed.
                Below, you can track the status of your order.
              </p>
            </div>
            
            <OrderTracking orderId={orderId} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">No order information found. Please check your order history.</p>
            <div className="flex justify-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Return to Home</Link>
              </Button>
              <Button asChild>
                <Link href="/account/orders">View Your Orders</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}