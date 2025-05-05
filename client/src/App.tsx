import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Layouts
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import AdminLayout from "@/components/Layout/AdminLayout";

// Pages
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import CustomerOrders from "@/pages/Account/Orders";

// Admin Pages
import AdminLogin from "@/pages/Admin/Login";
import AdminDashboard from "@/pages/Admin/Dashboard";
import AdminProducts from "@/pages/Admin/Products";
import EditProduct from "@/pages/Admin/EditProduct";
import AdminOrders from "@/pages/Admin/Orders";
import AdminOrderDetail from "@/pages/Admin/OrderDetail";
import AdminCategories from "@/pages/Admin/Categories";
import AdminCustomers from "@/pages/Admin/Customers";

// Context
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

// Simple protected routes
const ProtectedAdminRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Check if admin token exists
    const token = localStorage.getItem("admin_token");
    
    if (!token) {
      setIsAuthenticated(false);
      setLocation("/admin/login");
    } else {
      // Ideally, you would validate the token on the server 
      // For simplicity, we'll just check if it exists
      setIsAuthenticated(true);
    }
  }, [setLocation]);
  
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isAuthenticated === false) {
    return null; // Redirect is handled in useEffect
  }
  
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
};

const ProtectedCustomerRoute = ({ component: Component }: { component: React.ComponentType }) => {
  const { isCustomerLoggedIn, isAuthenticating } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isAuthenticating && !isCustomerLoggedIn) {
      setLocation("/auth");
    }
  }, [isCustomerLoggedIn, isAuthenticating, setLocation]);
  
  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isCustomerLoggedIn) {
    return null; // Redirect is handled in useEffect
  }
  
  return <Component />;
};

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/product/:slug" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      
      {/* Auth Routes */}
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      <Route path="/account" component={AuthPage} />
      <Route path="/account/orders">
        {() => <ProtectedCustomerRoute component={CustomerOrders} />}
      </Route>
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      
      <Route path="/admin">
        {() => <ProtectedAdminRoute component={AdminDashboard} />}
      </Route>
      <Route path="/admin/products">
        {() => <ProtectedAdminRoute component={AdminProducts} />}
      </Route>
      <Route path="/admin/products/new">
        {() => <ProtectedAdminRoute component={EditProduct} />}
      </Route>
      <Route path="/admin/products/:id/edit">
        {() => <ProtectedAdminRoute component={EditProduct} />}
      </Route>
      <Route path="/admin/orders">
        {() => <ProtectedAdminRoute component={AdminOrders} />}
      </Route>
      <Route path="/admin/orders/:id">
        {() => <ProtectedAdminRoute component={AdminOrderDetail} />}
      </Route>
      <Route path="/admin/categories">
        {() => <ProtectedAdminRoute component={AdminCategories} />}
      </Route>
      <Route path="/admin/customers">
        {() => <ProtectedAdminRoute component={AdminCustomers} />}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <CartProvider>
              <Router />
              </CartProvider>
            </main>
            <Footer />
          </div>
          <Toaster />
        
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
