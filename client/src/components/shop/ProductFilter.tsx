import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface ProductFilterProps {
  onFilter: (filters: {
    categories: string[];
    hairTypes: string[];
    concerns: string[];
    priceRange: [number, number];
  }) => void;
}

const ProductFilter = ({ onFilter }: ProductFilterProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [hairTypes, setHairTypes] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);

  const { data: categoriesData } = useQuery({
    queryKey: ['/api/categories'],
  });

  const categoryOptions = categoriesData || [
    { id: 'shampoo', name: 'Shampoo' },
    { id: 'conditioner', name: 'Conditioner' },
    { id: 'hair-oils', name: 'Hair Oils' },
    { id: 'treatments', name: 'Treatments' },
    { id: 'styling', name: 'Styling Products' }
  ];

  const hairTypeOptions = [
    { id: 'dry-hair', name: 'Dry Hair' },
    { id: 'oily-hair', name: 'Oily Hair' },
    { id: 'normal-hair', name: 'Normal Hair' },
    { id: 'curly-hair', name: 'Curly Hair' },
    { id: 'straight-hair', name: 'Straight Hair' },
    { id: 'wavy-hair', name: 'Wavy Hair' },
  ];

  const concernOptions = [
    { id: 'frizz', name: 'Frizz Control' },
    { id: 'damage', name: 'Damage Repair' },
    { id: 'volume', name: 'Volume' },
    { id: 'color-protection', name: 'Color Protection' },
    { id: 'dandruff', name: 'Dandruff Control' },
    { id: 'hair-fall', name: 'Hair Fall Control' },
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setCategories([...categories, category]);
    } else {
      setCategories(categories.filter(c => c !== category));
    }
  };

  const handleHairTypeChange = (hairType: string, checked: boolean) => {
    if (checked) {
      setHairTypes([...hairTypes, hairType]);
    } else {
      setHairTypes(hairTypes.filter(h => h !== hairType));
    }
  };

  const handleConcernChange = (concern: string, checked: boolean) => {
    if (checked) {
      setConcerns([...concerns, concern]);
    } else {
      setConcerns(concerns.filter(c => c !== concern));
    }
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const applyFilters = () => {
    onFilter({
      categories,
      hairTypes,
      concerns,
      priceRange: [priceRange[0], priceRange[1]]
    });
  };

  const clearFilters = () => {
    setCategories([]);
    setHairTypes([]);
    setConcerns([]);
    setPriceRange([0, 100]);
    onFilter({
      categories: [],
      hairTypes: [],
      concerns: [],
      priceRange: [0, 100]
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Categories</h3>
        <div className="space-y-2">
          {categoryOptions.map(category => (
            <div key={category.id} className="flex items-center">
              <Checkbox
                id={`category-${category.id}`}
                checked={categories.includes(category.id)}
                onCheckedChange={(checked) => 
                  handleCategoryChange(category.id, checked as boolean)
                }
              />
              <label
                htmlFor={`category-${category.id}`}
                className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Hair Type</h3>
        <div className="space-y-2">
          {hairTypeOptions.map(hairType => (
            <div key={hairType.id} className="flex items-center">
              <Checkbox
                id={`hair-type-${hairType.id}`}
                checked={hairTypes.includes(hairType.id)}
                onCheckedChange={(checked) => 
                  handleHairTypeChange(hairType.id, checked as boolean)
                }
              />
              <label
                htmlFor={`hair-type-${hairType.id}`}
                className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {hairType.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Concerns</h3>
        <div className="space-y-2">
          {concernOptions.map(concern => (
            <div key={concern.id} className="flex items-center">
              <Checkbox
                id={`concern-${concern.id}`}
                checked={concerns.includes(concern.id)}
                onCheckedChange={(checked) => 
                  handleConcernChange(concern.id, checked as boolean)
                }
              />
              <label
                htmlFor={`concern-${concern.id}`}
                className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {concern.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Price Range</h3>
        <Slider
          value={[priceRange[0], priceRange[1]]}
          min={0}
          max={100}
          step={1}
          onValueChange={handlePriceChange}
          className="mb-4"
        />
        <div className="flex justify-between text-sm">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Button onClick={applyFilters} variant="primary">
          Apply Filters
        </Button>
        <Button onClick={clearFilters} variant="outline">
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default ProductFilter;
