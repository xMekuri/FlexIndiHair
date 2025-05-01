import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ShoppingBag,
  DollarSign,
  Users,
  Package,
  Eye,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
  });

  // Refresh data on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Helper function to format currency
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
        <p>Error loading dashboard data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <ShoppingBag className="text-blue-500 h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-semibold">{stats.orderCount.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <DollarSign className="text-green-500 h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-semibold">{formatCurrency(stats.revenue)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <Users className="text-purple-500 h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <h3 className="text-2xl font-semibold">{stats.customerCount.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-orange-100 p-3 mr-4">
                <Package className="text-orange-500 h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Products</p>
                <h3 className="text-2xl font-semibold">{stats.productCount.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Recent Orders</h3>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders">View All</Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id.toString().padStart(5, '0')}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.customerId ? (
                          <Link href={`/admin/customers/${order.customerId}`} className="hover:underline text-blue-600">
                            {order.customerId ? 'Customer #' + order.customerId : 'Guest'}
                          </Link>
                        ) : (
                          'Guest'
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No recent orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Low Stock Products</h3>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/products">View All</Link>
              </Button>
            </div>
            <ul className="divide-y">
              {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                stats.lowStockProducts.map((product: any) => (
                  <li key={product.id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-12 h-12 relative overflow-hidden rounded mr-3 flex-shrink-0">
                        <div 
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${product.mainImageUrl})` }}
                        ></div>
                      </div>
                      <span className="truncate max-w-[200px]" title={product.name}>
                        {product.name}
                      </span>
                    </div>
                    <div>
                      <Badge className={product.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                        {product.stock} left
                      </Badge>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-4 text-center text-gray-500">
                  All products are well stocked
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Recent Customers</h3>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/customers">View All</Link>
              </Button>
            </div>
            <ul className="divide-y">
              {stats.recentCustomers && stats.recentCustomers.length > 0 ? (
                stats.recentCustomers.map((customer: any) => (
                  <li key={customer.id} className="py-3 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mr-3 flex-shrink-0">
                      {customer.firstName ? customer.firstName.charAt(0) : ''}
                      {customer.lastName ? customer.lastName.charAt(0) : ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/admin/customers/${customer.id}`} className="hover:underline text-blue-600">
                        <h4 className="font-medium truncate">
                          {customer.firstName} {customer.lastName}
                        </h4>
                      </Link>
                      <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-4 text-center text-gray-500">
                  No recent customers found
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
