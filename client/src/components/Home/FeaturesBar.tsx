import { Truck, Award, RefreshCw, Headset } from "lucide-react";

export default function FeaturesBar() {
  const features = [
    {
      icon: <Truck className="text-3xl text-primary" />,
      title: "Free Shipping",
      description: "On orders over $150"
    },
    {
      icon: <Award className="text-3xl text-primary" />,
      title: "Premium Quality",
      description: "100% real human hair"
    },
    {
      icon: <RefreshCw className="text-3xl text-primary" />,
      title: "Easy Returns",
      description: "30-day return policy"
    },
    {
      icon: <Headset className="text-3xl text-primary" />,
      title: "Customer Support",
      description: "24/7 dedicated service"
    }
  ];

  return (
    <section className="bg-accent py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="mb-3">{feature.icon}</div>
              <h3 className="font-medium mb-1">{feature.title}</h3>
              <p className="text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
