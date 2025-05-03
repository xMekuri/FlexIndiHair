import { Instagram } from 'lucide-react';

const InstagramFeed = () => {
  const instagramPosts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      link: "#"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      link: "#"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1562864758-143c0cc8b5a4?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      link: "#"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1588212716027-495a8cbedb70?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      link: "#"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1508704019882-f9cf40e475b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      link: "#"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1580618864180-f6d7d39b8ff6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80",
      link: "#"
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-heading font-bold text-center mb-2">Follow Us On Instagram</h2>
        <p className="text-center text-gray-600 mb-8">@flexindihair</p>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {instagramPosts.map((post) => (
            <a 
              key={post.id} 
              href={post.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block overflow-hidden group relative"
            >
              <img 
                src={post.image} 
                alt="Instagram Post" 
                className="w-full h-40 md:h-48 object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                <Instagram className="text-white w-6 h-6" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
