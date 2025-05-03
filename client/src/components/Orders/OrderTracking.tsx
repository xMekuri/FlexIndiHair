import { useState, useEffect } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusTracker } from "./OrderStatusTracker";

type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  totalPrice: number;
  productName?: string;
  productImage?: string;
};

type Order = {
  id: number;
  customerId: number | null;
  status: string;
  createdAt: string;
  expectedDeliveryDate?: string | null;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  orderItems?: OrderItem[];
};

type OrderTrackingProps = {
  orderId: number;
};

export default function OrderTracking({ orderId }: OrderTrackingProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("GET", `/api/orders/${orderId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }
        
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError("Could not load order details. Please try again later.");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return <OrderSkeleton />;
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="mb-4">Order not found</p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format date
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-xl flex justify-between items-center">
            <span>Order #{order.id}</span>
            <span className="text-sm text-gray-500 font-normal">{orderDate}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <OrderStatusTracker 
            status={order.status} 
            expectedDeliveryDate={order.expectedDeliveryDate}
          />
          
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                <div className="text-sm text-gray-600">
                  <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Payment Information</h3>
                <div className="text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Method:</span>{" "}
                    {order.paymentMethod === "credit_card" ? "Credit Card" : "PayPal"}
                  </p>
                </div>
              </div>
            </div>
            
            {order.orderItems && order.orderItems.length > 0 && (
              <div className="mt-8">
                <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.orderItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.productImage && (
                                <div className="flex-shrink-0 h-10 w-10 mr-4">
                                  <img 
                                    className="h-10 w-10 rounded-md object-cover" 
                                    src={item.productImage} 
                                    alt="" 
                                  />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.productName || `Product #${item.productId}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            ${item.totalPrice.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="mt-8 border-t pt-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t">
                <span className="text-lg font-medium">Total</span>
                <span className="text-lg font-bold text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button asChild variant="outline">
          <Link href="/">Continue Shopping</Link>
        </Button>
        <Button asChild>
          <Link href="/account/orders">View All Orders</Link>
        </Button>
      </div>
    </div>
  );
}

function OrderSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="w-full py-8">
          <Skeleton className="h-8 w-full" />
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            
            <div>
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          
          <div className="mt-8">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
          
          <div className="mt-8 border-t pt-6 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}