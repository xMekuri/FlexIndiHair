import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const PromoBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        let { days, hours, minutes, seconds } = prevTime;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const padZero = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  return (
    <section className="py-12 bg-primary bg-opacity-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <img 
              src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80" 
              alt="Hair Care Collection" 
              className="rounded-lg shadow-lg mx-auto"
            />
          </div>
          <div className="w-full md:w-1/2 md:pl-12 text-center md:text-left">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Limited Time Offer</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mt-2 mb-4">Complete Hair Care Bundle</h2>
            <p className="text-gray-600 mb-6">
              Get our complete hair care collection at 30% off. Perfect for all hair types and designed to transform your hair care routine.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm px-4 py-3 text-center">
                <span className="block text-2xl font-bold">{padZero(timeLeft.days)}</span>
                <span className="text-xs text-gray-500">Days</span>
              </div>
              <div className="bg-white rounded-lg shadow-sm px-4 py-3 text-center">
                <span className="block text-2xl font-bold">{padZero(timeLeft.hours)}</span>
                <span className="text-xs text-gray-500">Hours</span>
              </div>
              <div className="bg-white rounded-lg shadow-sm px-4 py-3 text-center">
                <span className="block text-2xl font-bold">{padZero(timeLeft.minutes)}</span>
                <span className="text-xs text-gray-500">Minutes</span>
              </div>
              <div className="bg-white rounded-lg shadow-sm px-4 py-3 text-center">
                <span className="block text-2xl font-bold">{padZero(timeLeft.seconds)}</span>
                <span className="text-xs text-gray-500">Seconds</span>
              </div>
            </div>
            <Button asChild variant="secondaryRound" size="xl">
              <Link href="/shop/bundle">Shop The Bundle</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
