import { FaInstagram } from "react-icons/fa";

// Mock Instagram feed data
const instagramPosts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1646893807752-9f73e31dde13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGhhaXIlMjBzYWxvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    link: "https://www.instagram.com/p/example1/"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aGFpciUyMHNhbG9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    link: "https://www.instagram.com/p/example2/"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1633681926037-3b5336be3cfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGhhaXIlMjBjYXJlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    link: "https://www.instagram.com/p/example3/"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aGFpciUyMHNhbG9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
    link: "https://www.instagram.com/p/example4/"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1620331688629-a191b3989748?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGhhaXIlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    link: "https://www.instagram.com/p/example5/"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGhhaXIlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    link: "https://www.instagram.com/p/example6/"
  }
];

export default function InstagramFeed() {
  return (
    <section className="py-16 bg-accent">
      <div className="container mx-auto px-4">
        <h2 className="font-playfair font-bold text-3xl md:text-4xl text-center mb-6">Follow Us On Instagram</h2>
        <p className="text-center text-lg mb-12">@flexindihair</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <a 
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-hidden"
            >
              <div 
                className="aspect-square bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${post.image})` }}
              ></div>
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white">
                  <FaInstagram className="text-xl" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
