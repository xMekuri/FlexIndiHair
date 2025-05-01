import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Form validation schema
const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export default function NewsletterSignup() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form
  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: ""
    }
  });
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof newsletterSchema>) => {
    try {
      setIsSubmitting(true);
      
      // In a real application, we would send the email to the server
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Subscription Successful",
        description: "Thank you for joining our mailing list!",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "There was an error subscribing to the newsletter. Please try again later.",
        variant: "destructive",
      });
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section className="py-16 bg-secondary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-playfair font-bold text-3xl mb-4">Join Our Mailing List</h2>
        <p className="max-w-2xl mx-auto mb-8">
          Subscribe to get exclusive offers, early access to new products, and hair care tips from our experts.
        </p>
        
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="max-w-xl mx-auto flex flex-col sm:flex-row"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Your email address"
                      className="flex-1 px-4 py-3 rounded-l-sm text-darkgray focus:outline-none sm:rounded-r-none h-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-left text-red-300 mt-1" />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="bg-primary hover:bg-opacity-90 px-6 py-3 rounded-r-sm font-medium transition sm:rounded-l-none mt-2 sm:mt-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}
