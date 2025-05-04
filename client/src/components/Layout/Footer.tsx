import { Link } from 'wouter';
import { Facebook, Instagram, Twitter, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-heading font-bold mb-4">FlexIndiHair</h3>
            <p className="text-gray-400 mb-4">Premium hair care products made with natural ingredients for all hair types.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook size={16} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram size={16} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter size={16} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>
          
          {/* Shop */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-gray-400 hover:text-white transition">All Products</Link></li>
              <li><Link href="/shop?category=shampoo" className="text-gray-400 hover:text-white transition">Shampoo</Link></li>
              <li><Link href="/shop?category=conditioner" className="text-gray-400 hover:text-white transition">Conditioner</Link></li>
              <li><Link href="/shop?category=hair-oils" className="text-gray-400 hover:text-white transition">Hair Oils</Link></li>
              <li><Link href="/shop?category=treatments" className="text-gray-400 hover:text-white transition">Treatments</Link></li>
              <li><Link href="/shop?category=gift-sets" className="text-gray-400 hover:text-white transition">Gift Sets</Link></li>
            </ul>
          </div>
          
          {/* Help */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Help</h4>
            <ul className="space-y-2">
              <li><Link href="/customer-service" className="text-gray-400 hover:text-white transition">Customer Service</Link></li>
              <li><Link href="/account" className="text-gray-400 hover:text-white transition">My Account</Link></li>
              <li><Link href="/order-tracking" className="text-gray-400 hover:text-white transition">Find My Order</Link></li>
              <li><Link href="/shipping-policy" className="text-gray-400 hover:text-white transition">Shipping Policy</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white transition">Returns & Exchanges</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>
          
          {/* About */}
          <div>
            <h4 className="text-lg font-semibold mb-4">About</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition">Our Story</Link></li>
              <li><Link href="/ingredients" className="text-gray-400 hover:text-white transition">Ingredients</Link></li>
              <li><Link href="/sustainability" className="text-gray-400 hover:text-white transition">Sustainability</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
              <li><Link href="/press" className="text-gray-400 hover:text-white transition">Press</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-700 text-sm text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} FlexIndiHair. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
              <Link href="/accessibility" className="hover:text-white transition">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
