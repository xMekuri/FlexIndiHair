import { Star } from "lucide-react";

// Testimonial data
const testimonials = [
  {
    id: 1,
    content: "I've tried many hair extensions brands, but FlexIndi Hair is by far the best quality I've found. The hair is thick all the way to the ends and blends perfectly with my natural hair. Highly recommend!",
    rating: 5,
    name: "Sarah Johnson",
    location: "New York, NY",
    image: "https://randomuser.me/api/portraits/women/12.jpg"
  },
  {
    id: 2,
    content: "The customer service is outstanding! I had questions about which shade would match my hair, and they were so helpful in guiding me. The extensions arrived quickly and look amazing. Will be a repeat customer for sure.",
    rating: 5,
    name: "Emma Wilson",
    location: "Los Angeles, CA",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 3,
    content: "As a professional stylist, I'm very particular about the products I use and recommend. FlexIndi Hair extensions exceed my expectations. They're durable, tangle-free, and my clients always love the results!",
    rating: 4.5,
    name: "Jessica Martinez",
    location: "Miami, FL",
    image: "https://randomuser.me/api/portraits/women/68.jpg"
  }
];

export default function Testimonials() {
  // Helper function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="fill-current text-yellow-400" />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="fill-current text-yellow-400" />
          </div>
        </div>
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="text-gray-300" />
      );
    }
    
    return stars;
  };
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-playfair font-bold text-3xl md:text-4xl text-center mb-12">Our Customers Love Us</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex text-yellow-400 mb-4">
                {renderStars(testimonial.rating)}
              </div>
              <p className="italic mb-6">{testimonial.content}</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={testimonial.image} 
                    alt={`${testimonial.name} profile`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
