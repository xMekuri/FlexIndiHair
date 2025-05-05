import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingBag, User, Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MiniCart from '@/components/shop/MiniCart';
import { useCart } from '@/context/CartContext';

const Header = () => {
  const [location] = useLocation();
  const { items } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMiniCart, setShowMiniCart] = useState(false);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <li>
      <Link href={href}>
        <a className={`nav-link block py-3 px-2 text-sm font-medium hover:text-primary transition ${location === href ? 'text-primary' : ''}`}>
          {children}
        </a>
      </Link>
    </li>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Announcement Bar */}
      <div className="bg-primary text-white py-2 text-center text-sm">
        <p>Free shipping on orders over $75! Use code: FREESHIP</p>
      </div>
      
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        {/* Logo */}
        <div className="flex items-center mb-4 md:mb-0">
          <Link href="/">
            <a className="text-3xl font-bold font-heading text-primary">
              FlexIndiHair
            </a>
          </Link>
        </div>
        
        {/* Search Bar */}
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search for products..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>
        
        {/* Navigation Icons */}
        <div className="flex items-center space-x-6">
          <Link href="/account">
            <a className="text-gray-600 hover:text-primary transition flex items-center">
              <User className="w-5 h-5" />
              <span className="hidden md:inline ml-1 text-sm">Account</span>
            </a>
          </Link>
          <Link href="/wishlist">
            <a className="text-gray-600 hover:text-primary transition flex items-center">
              <Heart className="w-5 h-5" />
              <span className="hidden md:inline ml-1 text-sm">Wishlist</span>
            </a>
          </Link>
          <div className="relative group" onMouseEnter={() => setShowMiniCart(true)} onMouseLeave={() => setShowMiniCart(false)}>
            <Link href="/cart">
              <a className="text-gray-600 hover:text-primary transition flex items-center">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline ml-1 text-sm">Cart</span>
              </a>
            </Link>
            
            {/* Mini Cart Dropdown */}
            {showMiniCart && <MiniCart />}
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="border-t border-b border-gray-200">
        <div className="container mx-auto px-4">
          <ul className="flex flex-wrap justify-center md:justify-start space-x-1 md:space-x-8">
            <NavLink href="/">Home</NavLink>
            <li className="group relative">
              <Link href="/shop">
                <a className={`nav-link block py-3 px-2 text-sm font-medium hover:text-primary transition ${location === '/shop' ? 'text-primary' : ''}`}>
                  Shop <i className="fas fa-chevron-down ml-1 text-xs"></i>
                </a>
              </Link>
              <div className="absolute left-0 mt-0 w-48 bg-white shadow-lg z-10 hidden group-hover:block">
                <Link href="/shop?category=shampoo">
                  <a className="block px-4 py-2 text-sm hover:bg-gray-100">Shampoo</a>
                </Link>
                <Link href="/shop?category=conditioner">
                  <a className="block px-4 py-2 text-sm hover:bg-gray-100">Conditioner</a>
                </Link>
                <Link href="/shop?category=hair-oils">
                  <a className="block px-4 py-2 text-sm hover:bg-gray-100">Hair Oils</a>
                </Link>
                <Link href="/shop?category=treatments">
                  <a className="block px-4 py-2 text-sm hover:bg-gray-100">Treatments</a>
                </Link>
                <Link href="/shop?category=styling">
                  <a className="block px-4 py-2 text-sm hover:bg-gray-100">Styling Products</a>
                </Link>
              </div>
            </li>
            <NavLink href="/collections">Collections</NavLink>
            <NavLink href="/hair-quiz">Hair Quiz</NavLink>
            <NavLink href="/about">About Us</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
