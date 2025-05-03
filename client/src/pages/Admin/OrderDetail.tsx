import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { ChevronLeft, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { OrderStatusLabel } from "@/components/Orders/OrderStatusTracker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { z } from "zod";

// Status update form schema
const statusUpdateSchema = z.object({
  status: z.string(),
  expectedDeliveryDate: z.string().optional(),
});

type StatusUpdateFormData = z.infer<typeof statusUpdateSchema>;

export default function AdminOrderDetail() {
  const { id } = useParams();
  const orderId = parseInt(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // Fetch order details
  const { data: order, isLoading, refetch } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch order details');
      return response.json();
    },
    enabled: !isNaN(orderId)
  });

  // Form for updating status
  const form = useForm<StatusUpdateFormData>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: '',
      expectedDeliveryDate: ''
    },
  });

  // Update form values when order data is loaded
  useEffect(() => {
    if (order) {
      form.reset({
        status: order.status,
        expectedDeliveryDate: order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toISOString().split('T')[0] : ''
      });
    }
  }, [order, form]);

  // Get the current date in YYYY-MM-DD format for date input min value
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Handle status update submission
  const onUpdateStatus = async (data: StatusUpdateFormData) => {
    if (!order) return;
    
    try {
      setIsUpdating(true);
      
      const response = await apiRequest(
        "PUT", 
        `/api/orders/${orderId}/status`, 
        {
          status: data.status,
          expectedDeliveryDate: data.expectedDeliveryDate || null
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      await refetch();
      
      toast({
        title: "Status Updated",
        description: `Order #${orderId} status has been updated to ${data.status}.`,
      });
      
      setShowStatusDialog(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Unable to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Format currency values
  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `$${numValue.toFixed(2)}`;
  };

  // Format date strings
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500 mb-4">Order not found</p>
        <Button asChild>
          <Link href="/admin/orders">Return to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" asChild className="mr-2">
            <Link href="/admin/orders">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        </div>
        
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogTrigger asChild>
            <Button>Update Status</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Change the status of this order and set an expected delivery date if applicable.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onUpdateStatus)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expectedDeliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Delivery Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={getCurrentDate()}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowStatusDialog(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Status"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>
              Order placed on {formatDate(order.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    <OrderStatusLabel status={order.status} />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Expected Delivery</p>
                  <p className="font-medium">{formatDate(order.expectedDeliveryDate)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <div className="border rounded-lg overflow-hidden">
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
                      {order.orderItems?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.product?.mainImageUrl && (
                                <div className="flex-shrink-0 h-10 w-10 mr-4">
                                  <img 
                                    className="h-10 w-10 rounded-md object-cover" 
                                    src={item.product.mainImageUrl} 
                                    alt={item.name} 
                                  />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                                {item.product && (
                                  <div className="text-xs text-blue-600">
                                    <Link href={`/admin/products/${item.product.id}`}>
                                      View Product
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {formatCurrency(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>{formatCurrency(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Customer and Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Customer</h3>
              {order.customer ? (
                <div>
                  <p className="font-medium">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{order.customer.email}</p>
                  <Link 
                    href={`/admin/customers/${order.customer.id}`} 
                    className="text-sm text-blue-600 hover:underline inline-block mt-1"
                  >
                    View Customer Profile
                  </Link>
                </div>
              ) : (
                <p className="text-gray-600">Guest Checkout</p>
              )}
            </div>
            
            {/* Shipping Address */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h3>
              <div className="text-sm">
                <p className="font-medium">
                  {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                </p>
                <p>{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>
            
            {/* Payment Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h3>
              <div className="text-sm">
                <p>
                  <span className="font-medium">Method:</span>{" "}
                  {order.paymentMethod === "credit_card" ? "Credit Card" : order.paymentMethod}
                </p>
                <p>
                  <span className="font-medium">Payment Status:</span>{" "}
                  <Badge className={
                    order.paymentStatus === "paid" 
                      ? "bg-green-100 text-green-800"
                      : order.paymentStatus === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </p>
              </div>
            </div>
            
            {/* Order Notes */}
            {order.orderNotes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Notes</h3>
                <p className="text-sm bg-gray-50 p-3 rounded border">{order.orderNotes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => window.print()}>
              Print Order Details
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}