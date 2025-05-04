import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';

const CategoryBanner = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Fallback to hardcoded categories if API data is not available
  const displayCategories = categories || [
    {
      id: 1,
      name: "Shampoo",
      slug: "shampoo",
      image: "https://images.unsplash.com/photo-1594995846645-d58328c3ffa4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
    },
    {
      id: 2,
      name: "Conditioner",
      slug: "conditioner",
      image: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
    },
    {
      id: 3,
      name: "Hair Oils",
      slug: "hair-oils",
      image: "https://images.unsplash.com/photo-1615351897587-97f8e6bc9688?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
    },
    {
      id: 4,
      name: "Treatments",
      slug: "treatments",
      image: "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=600&q=80"
    }
  ];

  return (
    <section className="py-12 bg-neutral-light">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-heading font-bold text-center mb-8">Shop By Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayCategories.map((category) => (
            <Link key={category.id} href={`/shop?category=${category.slug}`}>
              <a className="group">
                <div className="rounded-lg overflow-hidden shadow-md bg-white relative">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-primary bg-opacity-20 group-hover:bg-opacity-30 transition duration-300 flex items-center justify-center">
                    <h3 className="text-white text-xl font-heading font-semibold bg-primary bg-opacity-70 px-4 py-2 rounded">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryBanner;
