import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatus } from "@/components/Orders/OrderStatus";
import { Skeleton } from "@/components/ui/skeleton";

type Order = {
  id: number;
  status: string;
  createdAt: string;
  total: number;
  items?: { productName: string; quantity: number }[];
};

export default function CustomerOrders() {
  const [, navigate] = useLocation();
  const { isCustomerLoggedIn, customer } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!isCustomerLoggedIn) {
      navigate("/auth");
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest("GET", "/api/customer/orders");
        
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError("Could not load orders. Please try again later.");
        console.error("Error fetching orders:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isCustomerLoggedIn) {
      fetchOrders();
    }
  }, [isCustomerLoggedIn, navigate]);

  return (
    <>
      <Helmet>
        <title>My Orders - FlexIndi Hair</title>
        <meta name="description" content="View and track your FlexIndi Hair orders." />
      </Helmet>
      
      {/* Breadcrumb */}
      <div className="bg-accent py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/account" className="hover:text-primary transition">My Account</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-500">My Orders</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-playfair text-3xl font-bold mb-8">My Orders</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 max-w-lg mx-auto">
            <div className="bg-accent p-8 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet. Explore our products and place
                your first order today!
              </p>
              <Button asChild>
                <Link href="/products">Shop Now</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              // Format date
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-accent/30 pb-3">
                    <CardTitle className="flex justify-between items-center text-base">
                      <span>Order #{order.id}</span>
                      <span className="text-sm font-normal text-gray-500">{orderDate}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-2">
                        <OrderStatus status={order.status} />
                        <p className="text-sm text-gray-600">
                          Total: <span className="font-medium">${order.total.toFixed(2)}</span>
                        </p>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/order-confirmation?id=${order.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}