import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us - FlexIndi Hair</title>
        <meta 
          name="description" 
          content="Learn about FlexIndi Hair, our story, mission, and commitment to providing premium quality hair extensions and hair care products." 
        />
      </Helmet>
      
      {/* Breadcrumb */}
      <div className="bg-accent py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-500">About Us</span>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="relative bg-[url('https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aGFpciUyMHNhbG9ufGVufDB8fDB8fHww')] bg-cover bg-center py-24 md:py-32">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-playfair font-bold text-4xl md:text-5xl text-white mb-4">About FlexIndi Hair</h1>
          <p className="text-white text-lg max-w-2xl mx-auto">
            Premium quality hair extensions and hair care products for the modern woman.
          </p>
        </div>
      </div>
      
      {/* Our Story */}
      <div className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1599687266725-0d4d52716b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGhhaXIlMjBzYWxvbiUyMG93bmVyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60" 
                alt="FlexIndi Hair founder" 
                className="rounded-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h6 className="text-primary font-medium mb-2">Our Story</h6>
              <h2 className="font-playfair font-bold text-3xl md:text-4xl mb-6">From Passion to Premium Products</h2>
              <p className="text-gray-700 mb-6">
                FlexIndi Hair was founded in 2015 by hair stylist and beauty enthusiast Sarah Johnson, who was frustrated by the lack of high-quality, ethically sourced hair extensions available on the market. After years of working in top salons and experiencing firsthand the transformative power of premium hair extensions, Sarah set out to create a brand that delivered exceptional quality without compromise.
              </p>
              <p className="text-gray-700 mb-6">
                What began as a small, home-based business has grown into a trusted name in the hair extension industry, known for our commitment to quality, ethical sourcing, and customer satisfaction. Today, FlexIndi Hair serves thousands of customers worldwide, helping women feel confident and beautiful with our premium hair extensions and hair care products.
              </p>
              <Button asChild>
                <Link href="/products">Shop Our Collection</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Our Mission */}
      <div className="bg-accent py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h6 className="text-primary font-medium mb-2">Our Mission</h6>
          <h2 className="font-playfair font-bold text-3xl md:text-4xl mb-6">Empowering Beauty Through Quality</h2>
          <p className="text-gray-700 max-w-3xl mx-auto mb-12">
            At FlexIndi Hair, our mission is to empower women to express their unique beauty through high-quality hair extensions and hair care products. We believe that everyone deserves to feel confident and beautiful, and we're committed to providing products that help our customers achieve their desired look.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <h3 className="font-playfair font-bold text-xl mb-3">Premium Quality</h3>
              <p className="text-gray-700">
                We source only the finest 100% human hair for our extensions, ensuring a natural look and feel that blends seamlessly with your own hair.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="font-playfair font-bold text-xl mb-3">Ethical Sourcing</h3>
              <p className="text-gray-700">
                We are committed to ethical sourcing practices, ensuring that all hair is obtained through fair trade and with full consent of donors.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                </svg>
              </div>
              <h3 className="font-playfair font-bold text-xl mb-3">Customer Satisfaction</h3>
              <p className="text-gray-700">
                We're dedicated to providing exceptional customer service and support, helping you find the perfect hair extensions for your unique needs.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Our Team */}
      <div className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h6 className="text-primary font-medium mb-2">Our Team</h6>
          <h2 className="font-playfair font-bold text-3xl md:text-4xl mb-12">Meet the Experts Behind FlexIndi Hair</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img 
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fHBlb3BsZSUyMGhlYWRzaG90fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60" 
                  alt="Sarah Johnson - Founder & CEO" 
                  className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <h3 className="font-playfair font-bold text-xl mb-1">Sarah Johnson</h3>
              <p className="text-primary mb-3">Founder & CEO</p>
              <p className="text-gray-700 text-sm">
                With over 15 years of experience as a professional hair stylist, Sarah brings her passion and expertise to FlexIndi Hair.
              </p>
            </div>
            
            <div>
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img 
                  src="https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fHBlb3BsZSUyMGhlYWRzaG90fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60" 
                  alt="Michael Chen - Product Development" 
                  className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <h3 className="font-playfair font-bold text-xl mb-1">Michael Chen</h3>
              <p className="text-primary mb-3">Product Development</p>
              <p className="text-gray-700 text-sm">
                Michael leads our product development team, ensuring that all FlexIndi Hair products meet our high standards of quality.
              </p>
            </div>
            
            <div>
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img 
                  src="https://images.unsplash.com/photo-1598641795816-a84ac9eac40c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDF8fHBlb3BsZSUyMGhlYWRzaG90fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60" 
                  alt="Sophia Martinez - Lead Stylist" 
                  className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <h3 className="font-playfair font-bold text-xl mb-1">Sophia Martinez</h3>
              <p className="text-primary mb-3">Lead Stylist</p>
              <p className="text-gray-700 text-sm">
                As our lead stylist, Sophia creates stunning looks with our hair extensions and shares her expertise through tutorials and guides.
              </p>
            </div>
            
            <div>
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHBlb3BsZSUyMGhlYWRzaG90fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60" 
                  alt="Emily Johnson - Customer Experience" 
                  className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <h3 className="font-playfair font-bold text-xl mb-1">Emily Johnson</h3>
              <p className="text-primary mb-3">Customer Experience</p>
              <p className="text-gray-700 text-sm">
                Emily leads our customer experience team, ensuring that every interaction with FlexIndi Hair exceeds expectations.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-primary bg-opacity-10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair font-bold text-3xl md:text-4xl mb-6">Ready to Transform Your Look?</h2>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            Browse our collection of premium hair extensions and hair care products, and discover the FlexIndi Hair difference for yourself.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
