import { useQuery } from '@tanstack/react-query';
import StarRating from '@/components/icons/StarRating';

const Testimonials = () => {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['/api/testimonials'],
  });

  // Fallback to hardcoded testimonials if API data is not available
  const displayTestimonials = testimonials || [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80",
      rating: 5,
      text: "I've been using the Hydrating Shampoo and Repair Conditioner for 3 months now, and my hair has never felt better. Finally found products that actually work for my dry hair!",
      productName: "Hydrating Shampoo & Repair Conditioner"
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80",
      rating: 4.5,
      text: "The Nourishing Hair Oil is a game changer! My frizz is gone and my hair feels so soft. A little goes a long way, so the bottle lasts forever. Highly recommend!",
      productName: "Nourishing Hair Oil"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80",
      rating: 5,
      text: "After trying countless products for my curly hair, I finally found the Hair Mask Treatment. It defines my curls without weighing them down. Plus, it smells amazing!",
      productName: "Hair Mask Treatment"
    }
  ];

  return (
    <section className="py-12 bg-neutral-light">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-heading font-bold text-center mb-2">Customer Love</h2>
        <p className="text-center text-gray-600 mb-8">See what our customers are saying about our products</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="ml-3">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            displayTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <h4 className="font-medium">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">Verified Customer</p>
                    </div>
                  </div>
                  <div className="text-secondary">
                    <i className="fas fa-quote-right text-xl"></i>
                  </div>
                </div>
                <div className="mb-4">
                  <StarRating rating={testimonial.rating} size="sm" />
                </div>
                <p className="text-gray-600 mb-3">"{testimonial.text}"</p>
                <p className="text-sm text-gray-500">{testimonial.productName}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
