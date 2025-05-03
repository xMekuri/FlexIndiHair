import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number | string;
  size?: 'sm' | 'md';
}

const StarRating = ({ rating, size = 'md' }: StarRatingProps) => {
  const numericRating = typeof rating === 'number' ? rating : parseFloat(rating);
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  const starSize = size === 'sm' ? 12 : 16;
  const starClass = `text-secondary ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`;

  return (
    <div className="flex">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={starClass} fill="currentColor" />
      ))}
      
      {hasHalfStar && (
        <StarHalf className={starClass} fill="currentColor" />
      )}
      
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${starClass} text-gray-300`} />
      ))}
    </div>
  );
};

export default StarRating;
