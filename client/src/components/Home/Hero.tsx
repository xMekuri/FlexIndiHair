import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "Transform Your Hair With Natural Ingredients",
      description: "Discover our premium collection of natural hair care products designed for all hair types.",
      image: "https://images.unsplash.com/photo-1519735777090-ec97162dc266?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Unlock Your Hair's Natural Beauty",
      description: "Our gentle formula nourishes and strengthens hair from root to tip.",
      image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Premium Hair Care for Indian Hair",
      description: "Specially formulated for the unique needs of Indian hair types.",
      image: "https://images.unsplash.com/photo-1522337094846-8a2d95f02867?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section className="relative bg-neutral-light">
      <div className="relative overflow-hidden" style={{ height: "500px" }}>
        {/* Current Slide */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between">
            <div className="w-full md:w-1/2 text-center md:text-left z-10">
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">
                {slides[activeSlide].title}
              </h1>
              <p className="text-lg mb-6 text-gray-700">
                {slides[activeSlide].description}
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                <Button asChild variant="primary" size="xl">
                  <Link href="/shop">Shop Now</Link>
                </Button>
                <Button asChild variant="primaryOutline" size="xl">
                  <Link href="/hair-quiz">Take Hair Quiz</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block w-1/2">
              <img 
                src={slides[activeSlide].image}
                alt="Natural Hair Care" 
                className="rounded-lg shadow-lg ml-auto object-cover" 
                style={{ maxHeight: "400px" }} 
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Carousel Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button 
            key={index} 
            className={`w-2 h-2 rounded-full ${index === activeSlide ? 'bg-primary' : 'bg-gray-300'}`}
            onClick={() => setActiveSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
