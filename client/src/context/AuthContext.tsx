import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Admin {
  id: number;
  email: string;
  name: string;
}

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  admin: Admin | null;
  customer: Customer | null;
  isAdminLoggedIn: boolean;
  isCustomerLoggedIn: boolean;
  isAuthenticating: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  loginCustomer: (email: string, password: string) => Promise<void>;
  registerCustomer: (customerData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check for stored auth tokens on component mount
    const adminToken = localStorage.getItem('admin_token');
    const customerToken = localStorage.getItem('customer_token');
    
    if (adminToken) {
      try {
        const adminData = JSON.parse(localStorage.getItem('admin_data') || 'null');
        if (adminData) {
          setAdmin(adminData);
        }
      } catch (e) {
        console.error('Failed to parse admin data from localStorage:', e);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
      }
    }
    
    if (customerToken) {
      try {
        const customerData = JSON.parse(localStorage.getItem('customer_data') || 'null');
        if (customerData) {
          setCustomer(customerData);
        }
      } catch (e) {
        console.error('Failed to parse customer data from localStorage:', e);
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_data');
      }
    }
    
    setIsAuthenticating(false);
  }, []);
  
  const loginAdmin = async (email: string, password: string) => {
    try {
      setIsAuthenticating(true);
      const response = await apiRequest('POST', '/api/admin/login', { email, password });
      const data = await response.json();
      
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_data', JSON.stringify(data.admin));
      setAdmin(data.admin);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.admin.name}!`,
      });
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const loginCustomer = async (email: string, password: string) => {
    try {
      setIsAuthenticating(true);
      const response = await apiRequest('POST', '/api/customer/login', { email, password });
      const data = await response.json();
      
      localStorage.setItem('customer_token', data.token);
      localStorage.setItem('customer_data', JSON.stringify(data.customer));
      setCustomer(data.customer);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.customer.firstName}!`,
      });
    } catch (error) {
      console.error('Customer login error:', error);
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const registerCustomer = async (customerData: any) => {
    try {
      setIsAuthenticating(true);
      const response = await apiRequest('POST', '/api/customer/register', customerData);
      const data = await response.json();
      
      localStorage.setItem('customer_token', data.token);
      localStorage.setItem('customer_data', JSON.stringify(data.customer));
      setCustomer(data.customer);
      
      toast({
        title: "Registration successful",
        description: `Welcome to FlexIndi Hair, ${data.customer.firstName}!`,
      });
    } catch (error) {
      console.error('Customer registration error:', error);
      toast({
        title: "Registration failed",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const logout = () => {
    // Clear admin auth
    if (admin) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_data');
      setAdmin(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out of the admin panel.",
      });
    }
    
    // Clear customer auth
    if (customer) {
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_data');
      setCustomer(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out of your account.",
      });
    }
  };
  
  return (
    <AuthContext.Provider value={{
      admin,
      customer,
      isAdminLoggedIn: !!admin,
      isCustomerLoggedIn: !!customer,
      isAuthenticating,
      loginAdmin,
      loginCustomer,
      registerCustomer,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
