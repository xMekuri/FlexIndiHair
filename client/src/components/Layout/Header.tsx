import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useMobile } from "@/hooks/use-mobile";
import { 
  Phone, 
  Mail, 
  Search, 
  User, 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronDown,
  ChevronUp, 
  Facebook, 
  Instagram
} from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenus, setMobileSubmenus] = useState<Record<string, boolean>>({});
  const { itemCount } = useCart();
  const { isCustomerLoggedIn, isAdminLoggedIn, customer, logout } = useAuth();

  // Fetch categories for mega menu
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    enabled: true,
  });

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleMobileSubmenu = (menuId: string) => {
    setMobileSubmenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  return (
    <header className="bg-white relative">
      {/* Top Bar */}
      <div className="bg-secondary text-white text-xs py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <a href="tel:+1234567890" className="mr-6 hover:text-primary transition flex items-center">
              <Phone className="w-3 h-3 mr-2" />
              Call Us: +1 (234) 567-890
            </a>
            <a href="mailto:info@flexindihair.com" className="hover:text-primary transition flex items-center">
              <Mail className="w-3 h-3 mr-2" />
              info@flexindihair.com
            </a>
          </div>
          <div className="hidden md:flex items-center">
            <a href="#" className="mr-4 hover:text-primary transition">Free Shipping Over $150</a>
            <div className="flex items-center">
              <a href="#" className="mr-3 hover:text-primary transition"><Facebook className="w-3 h-3" /></a>
              <a href="#" className="mr-3 hover:text-primary transition"><Instagram className="w-3 h-3" /></a>
              <a href="#" className="hover:text-primary transition"><FaTiktok className="w-3 h-3" /></a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="lg:hidden">
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="focus:outline-none"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 lg:flex-none text-center lg:text-left">
          <Link href="/" className="inline-block">
            <h1 className="font-playfair font-bold text-3xl text-primary">FlexIndi Hair</h1>
          </Link>
        </div>
        
        <nav className="hidden lg:flex items-center justify-center flex-1">
          <ul className="flex space-x-8">
            <li className="nav-item relative group">
              <Link href="/" className="font-medium hover:text-primary transition py-2">Home</Link>
            </li>
            <li className="nav-item relative group">
              <Link href="/products" className="font-medium hover:text-primary transition py-2 flex items-center">
                Shop <ChevronDown className="ml-1 w-4 h-4" />
              </Link>
              <div className="mega-menu">
                <div className="py-6">
                  <div className="container mx-auto px-4">
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <h3 className="font-playfair font-semibold text-lg mb-4">Hair Extensions</h3>
                        <ul className="space-y-2">
                          <li><Link href="/products?category=clip-in-extensions" className="hover:text-primary transition">Clip-In Extensions</Link></li>
                          <li><Link href="/products?category=tape-in-extensions" className="hover:text-primary transition">Tape-In Extensions</Link></li>
                          <li><Link href="/products?category=halo-extensions" className="hover:text-primary transition">Halo Extensions</Link></li>
                          <li><Link href="/products?category=nano-ring-extensions" className="hover:text-primary transition">Nano Ring Extensions</Link></li>
                          <li><Link href="/products?category=weft-extensions" className="hover:text-primary transition">Weft Extensions</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-playfair font-semibold text-lg mb-4">By Hair Type</h3>
                        <ul className="space-y-2">
                          <li><Link href="/products?type=straight" className="hover:text-primary transition">Straight Hair</Link></li>
                          <li><Link href="/products?type=wavy" className="hover:text-primary transition">Wavy Hair</Link></li>
                          <li><Link href="/products?type=curly" className="hover:text-primary transition">Curly Hair</Link></li>
                          <li><Link href="/products?type=colored" className="hover:text-primary transition">Colored Hair</Link></li>
                          <li><Link href="/products?type=ombre" className="hover:text-primary transition">Ombre Hair</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-playfair font-semibold text-lg mb-4">Hair Care</h3>
                        <ul className="space-y-2">
                          <li><Link href="/products?category=shampoo-conditioner" className="hover:text-primary transition">Shampoo & Conditioner</Link></li>
                          <li><Link href="/products?category=hair-masks" className="hover:text-primary transition">Hair Masks</Link></li>
                          <li><Link href="/products?category=hair-brushes" className="hover:text-primary transition">Hair Brushes</Link></li>
                          <li><Link href="/products?category=styling-products" className="hover:text-primary transition">Styling Products</Link></li>
                          <li><Link href="/products?category=hair-treatments" className="hover:text-primary transition">Hair Treatments</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-playfair font-semibold text-lg mb-4">Featured Product</h3>
                        <Link href="/product/tape-in-gold-series">
                          <div className="rounded-md w-full h-40 bg-[url('https://images.unsplash.com/photo-1590329946928-f9b7593d8a76?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhhaXIlMjBleHRlbnNpb25zfGVufDB8fDB8fHww')] bg-cover bg-center rounded-md"></div>
                          <p className="mt-2 font-medium">Premium Russian Tape-Ins</p>
                          <p className="text-primary font-semibold">$199.99</p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li className="nav-item relative group">
              <Link href="/about" className="font-medium hover:text-primary transition py-2">About Us</Link>
            </li>
            <li className="nav-item relative group">
              <Link href="/contact" className="font-medium hover:text-primary transition py-2">Contact</Link>
            </li>
          </ul>
        </nav>
        
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-primary transition">
            <Search className="w-5 h-5" />
          </a>
          <div className="relative group">
            <div className="hover:text-primary transition cursor-pointer">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-40 p-4">
              {isCustomerLoggedIn ? (
                <>
                  <p className="text-sm font-medium mb-3">Hi, {customer?.firstName}!</p>
                  <ul className="space-y-2">
                    <li><Link href="/account" className="text-sm hover:text-primary">My Account</Link></li>
                    <li><Link href="/account/orders" className="text-sm hover:text-primary">My Orders</Link></li>
                    <li><button onClick={logout} className="text-sm hover:text-primary">Logout</button></li>
                  </ul>
                </>
              ) : (
                <>
                  <Link href="/login" className="block w-full text-center bg-primary text-white py-2 rounded-md hover:bg-opacity-90 transition">
                    Login
                  </Link>
                  <p className="text-xs text-center mt-2">
                    Don't have an account? <Link href="/register" className="text-primary hover:underline">Register</Link>
                  </p>
                </>
              )}
              
              <div className="mt-3 pt-3 border-t">
                <Link href="/admin/login" className="block w-full text-center bg-secondary text-white py-2 rounded-md hover:bg-opacity-90 transition">
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
          <Link href="/cart" className="hover:text-primary transition relative">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`fixed top-0 left-0 w-4/5 h-full bg-white z-50 shadow-xl transform ${
          mobileMenuOpen ? 'translate-x-0 slide-in' : '-translate-x-full'
        } transition-transform duration-300 overflow-y-auto`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-playfair font-bold text-2xl text-primary">FlexIndi Hair</h1>
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="focus:outline-none"
              aria-label="Close mobile menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <ul className="space-y-4">
            <li><Link href="/" className="block py-2 font-medium">Home</Link></li>
            <li>
              <div className="flex justify-between items-center py-2">
                <Link href="/products" className="font-medium">Shop</Link>
                <button 
                  onClick={() => toggleMobileSubmenu('shop')}
                  className="focus:outline-none"
                  aria-label={mobileSubmenus.shop ? 'Collapse shop menu' : 'Expand shop menu'}
                >
                  {mobileSubmenus.shop ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              <ul className={`pl-4 mt-2 space-y-2 ${mobileSubmenus.shop ? 'block' : 'hidden'}`}>
                <li><Link href="/products?category=hair-extensions" className="block py-1">Hair Extensions</Link></li>
                <li><Link href="/products?category=hair-type" className="block py-1">By Hair Type</Link></li>
                <li><Link href="/products?category=hair-care" className="block py-1">Hair Care</Link></li>
              </ul>
            </li>
            <li><Link href="/about" className="block py-2 font-medium">About Us</Link></li>
            <li><Link href="/contact" className="block py-2 font-medium">Contact</Link></li>
          </ul>
          
          <div className="mt-8 pt-6 border-t">
            {isCustomerLoggedIn ? (
              <>
                <p className="font-medium">Hi, {customer?.firstName}!</p>
                <Link href="/account" className="block py-2 font-medium">
                  <User className="w-4 h-4 inline-block mr-2" /> My Account
                </Link>
                <button onClick={logout} className="block py-2 font-medium w-full text-left">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="block py-2 font-medium">
                <User className="w-4 h-4 inline-block mr-2" /> Login / Register
              </Link>
            )}
            
            <Link href="/cart" className="block py-2 font-medium">
              <ShoppingBag className="w-4 h-4 inline-block mr-2" /> My Cart ({itemCount})
            </Link>
            
            <Link href="/admin/login" className="block py-2 font-medium text-secondary">
              Admin Login
            </Link>
          </div>
          
          {isAdminLoggedIn && (
            <div className="mt-4 pt-4 border-t">
              <Link href="/admin" className="block py-2 font-medium text-primary">
                Admin Panel
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
