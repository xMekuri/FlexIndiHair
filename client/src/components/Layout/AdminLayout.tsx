import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Tags, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { admin, logout } = useAuth();
  const isMobile = useMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
  // Close sidebar on mobile when location changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);
  
  // Handle sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Navigation items
  const navItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Products", path: "/admin/products", icon: <Package className="w-5 h-5" /> },
    { name: "Orders", path: "/admin/orders", icon: <ShoppingBag className="w-5 h-5" /> },
    { name: "Categories", path: "/admin/categories", icon: <Tags className="w-5 h-5" /> },
    { name: "Customers", path: "/admin/customers", icon: <Users className="w-5 h-5" /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ];
  
  // Check if user is authenticated
  useEffect(() => {
    if (!admin) {
      window.location.href = "/admin/login";
    }
  }, [admin]);
  
  if (!admin) {
    return null; // Don't render anything while checking authentication
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-sidebar-border">
            <h2 className="font-playfair font-bold text-2xl text-sidebar-primary">Admin Panel</h2>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <a
                      className={`flex items-center py-2 px-4 rounded-md transition-colors ${
                        location === item.path
                          ? "bg-sidebar-primary bg-opacity-20 text-sidebar-primary-foreground"
                          : "hover:bg-sidebar-accent hover:bg-opacity-20"
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                      {location === item.path ? (
                        <ChevronDown className="ml-auto w-4 h-4" />
                      ) : (
                        <ChevronRight className="ml-auto w-4 h-4" />
                      )}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <button
              onClick={logout}
              className="flex items-center py-2 px-4 w-full text-left rounded-md hover:bg-sidebar-accent hover:bg-opacity-20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="bg-white shadow-md hover:bg-gray-100"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Main Content */}
      <div className={`md:ml-64 transition-all duration-300 min-h-screen ${
        isMobile && isSidebarOpen ? "ml-64" : "ml-0"
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-medium text-gray-900">
                {navItems.find(item => item.path === location)?.name || "Admin"}
              </h1>
              <div className="flex items-center">
                <span className="mr-4 text-sm font-medium text-gray-700">
                  Welcome, {admin.name}
                </span>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="hidden md:inline-flex"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}
