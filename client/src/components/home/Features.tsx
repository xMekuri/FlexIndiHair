import { Leaf, Ban, Truck, RotateCcw } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Leaf className="w-8 h-8 text-primary" />,
      title: "Natural Ingredients"
    },
    {
      icon: <Ban className="w-8 h-8 text-primary" />,
      title: "No Harmful Chemicals"
    },
    {
      icon: <Truck className="w-8 h-8 text-primary" />,
      title: "Free Shipping Over $75"
    },
    {
      icon: <RotateCcw className="w-8 h-8 text-primary" />,
      title: "30-Day Returns"
    }
  ];

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {features.map((feature, index) => (
            <div key={index} className="py-4">
              {feature.icon}
              <h3 className="text-sm font-semibold mt-3">{feature.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
