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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSubmenus, setMobileSubmenus] = useState<Record<string, boolean>>({});
  
  try {
    const { itemCount } = useCart();
  } catch (error) {
    console.error('Cart context error:', error);
  }
  const { isCustomerLoggedIn, isAdminLoggedIn, customer, logout } = useAuth();

  // Fetch categories for mega menu
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    enabled: true,
  });

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
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
            <li className="relative group">
              <Link href="/products" className="font-medium hover:text-primary transition py-2 flex items-center">
                Shop <ChevronDown className="ml-1 w-4 h-4" />
              </Link>
              <div className="absolute left-0 top-full bg-white shadow-lg z-50 hidden group-hover:block w-80">
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Wigs</h3>
                  <ul className="space-y-2">
                    <li><Link href="/products?category=full-lace-wig" className="block hover:text-primary transition">Full Lace Wig</Link></li>
                    <li><Link href="/products?category=front-lace-wig" className="block hover:text-primary transition">Front Lace Wig</Link></li>
                    <li><Link href="/products?category=360-lace-wig" className="block hover:text-primary transition">360 Lace Wig</Link></li>
                    <li><Link href="/products?category=u-part-wig" className="block hover:text-primary transition">U-Part Wig</Link></li>
                    <li><Link href="/products?category=v-part-wig" className="block hover:text-primary transition">V-Part Wig</Link></li>
                    <li><Link href="/products?category=chemo-patient-wig" className="block hover:text-primary transition">Chemo Patient Wig</Link></li>
                    <li><Link href="/products?category=black-cap-wig" className="block hover:text-primary transition">Black Cap Wig</Link></li>
                  </ul>

                  <h3 className="font-semibold mt-4 mb-2">Hair Toppers</h3>
                  <ul className="space-y-2">
                    <li><Link href="/products?category=silk-base-hair-topper" className="block hover:text-primary transition">Silk Base Hair Topper</Link></li>
                    <li><Link href="/products?category=mono-base-hair-topper" className="block hover:text-primary transition">Mono Base Hair Topper</Link></li>
                  </ul>

                  <h3 className="font-semibold mt-4 mb-2">Hair Extensions</h3>
                  <ul className="space-y-2">
                    <li><Link href="/products?category=weft-hair-bundles" className="block hover:text-primary transition">Weft Hair Bundles</Link></li>
                    <li><Link href="/products?category=clip-on-extensions" className="block hover:text-primary transition">Clip-on Hair Extensions</Link></li>
                    <li><Link href="/products?category=ponytail-extensions" className="block hover:text-primary transition">Ponytail Hair Extensions</Link></li>
                    <li><Link href="/products?category=halo-extensions" className="block hover:text-primary transition">Halo Hair Extensions</Link></li>
                    <li><Link href="/products?category=tape-in-extensions" className="block hover:text-primary transition">Tape-in Hair Extensions</Link></li>
                    <li><Link href="/products?category=keratin-tip-extensions" className="block hover:text-primary transition">Keratin/I-Tip/U-Tip Extensions</Link></li>
                  </ul>

                  <h3 className="font-semibold mt-4 mb-2">Bangs & Fringes</h3>
                  <ul className="space-y-2">
                    <li><Link href="/products?category=clip-based-bangs" className="block hover:text-primary transition">Clip-based Bangs/Fringes</Link></li>
                  </ul>

                  <div className="pt-3 mt-4 border-t">
                    <Link href="/products" className="block py-2 text-center bg-primary text-white rounded-md hover:bg-opacity-90 transition">
                      View All Products
                    </Link>
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
          <div className="relative">
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="hover:text-primary transition cursor-pointer"
              aria-label="Toggle user menu"
            >
              <User className="w-5 h-5" />
            </button>
            <div className={`${userMenuOpen ? 'block' : 'hidden'} absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-40 p-4`}>
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
                <li className="font-medium mt-2">Wigs</li>
                <li><Link href="/products?category=full-lace-wig" className="block py-1">Full Lace Wig</Link></li>
                <li><Link href="/products?category=front-lace-wig" className="block py-1">Front Lace Wig</Link></li>
                <li><Link href="/products?category=360-lace-wig" className="block py-1">360 Lace Wig</Link></li>
                <li><Link href="/products?category=u-part-wig" className="block py-1">U-Part Wig</Link></li>
                <li><Link href="/products?category=v-part-wig" className="block py-1">V-Part Wig</Link></li>

                <li className="font-medium mt-2">Hair Toppers</li>
                <li><Link href="/products?category=silk-base-hair-topper" className="block py-1">Silk Base Hair Topper</Link></li>
                <li><Link href="/products?category=mono-base-hair-topper" className="block py-1">Mono Base Hair Topper</Link></li>

                <li className="font-medium mt-2">Hair Extensions</li>
                <li><Link href="/products?category=weft-hair-bundles" className="block py-1">Weft Hair Bundles</Link></li>
                <li><Link href="/products?category=clip-on-extensions" className="block py-1">Clip-on Hair Extensions</Link></li>
                <li><Link href="/products?category=ponytail-extensions" className="block py-1">Ponytail Hair Extensions</Link></li>

                <li className="font-medium mt-2">Bangs & Fringes</li>
                <li><Link href="/products?category=clip-based-bangs" className="block py-1">Clip-based Bangs/Fringes</Link></li>
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
