import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronRight, CreditCard, Slack, Truck, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Form schema for validation
const checkoutFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(5, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter your full address"),
  city: z.string().min(2, "Please enter your city"),
  state: z.string().min(2, "Please enter your state/province"),
  zipCode: z.string().min(2, "Please enter your zip/postal code"),
  country: z.string().min(2, "Please select your country"),
  sameAsBilling: z.boolean().default(true),
  billingFirstName: z.string().optional(),
  billingLastName: z.string().optional(),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZipCode: z.string().optional(),
  billingCountry: z.string().optional(),
  paymentMethod: z.enum(["credit_card", "paypal"]),
  notes: z.string().optional(),
});

export default function Checkout() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { items, subtotal, clearCart } = useCart();
  const { isCustomerLoggedIn, customer } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Information, 2: Shipping, 3: Payment, 4: Review, 5: Confirmation
  
  // Define shipping options
  const shippingOptions = [
    { id: "standard", name: "Standard Shipping", price: subtotal >= 150 ? 0 : 15, days: "3-5" },
    { id: "express", name: "Express Shipping", price: 25, days: "1-2" },
  ];
  
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);
  
  // Calculate totals
  const shippingFee = selectedShipping.price;
  const taxRate = 0.07; // 7% tax rate
  const tax = subtotal * taxRate;
  const total = subtotal + shippingFee + tax;
  
  // Initialize form
  const form = useForm<z.infer<typeof checkoutFormSchema>>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      email: customer?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      sameAsBilling: true,
      paymentMethod: "credit_card",
      notes: "",
    },
    mode: "onSubmit", // Change validation mode to only validate on submit
  });
  
  // Log any form validation errors
  console.log("Form errors:", form.formState.errors);
  
  // Handle step navigation
  const nextStep = () => {
    window.scrollTo(0, 0);
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    window.scrollTo(0, 0);
    setStep(prev => prev - 1);
  };
  
  // Handle form submission
  const onSubmit = async (data: z.infer<typeof checkoutFormSchema>) => {
    console.log("FORM SUBMISSION STARTED", { data, step });
    
    // Show a toast to verify the function is being called
    toast({
      title: "Processing order",
      description: "Your order is being processed...",
    });
    
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add products to your cart before checking out.",
        variant: "destructive",
      });
      navigate('/products');
      return;
    }
    
    try {
      console.log("Form submission step 2 - Entering try block");
      setIsSubmitting(true);
      
      // Prepare billing address
      const billingAddress = data.sameAsBilling
        ? {
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
          }
        : {
            firstName: data.billingFirstName || "",
            lastName: data.billingLastName || "",
            address: data.billingAddress || "",
            city: data.billingCity || "",
            state: data.billingState || "",
            zipCode: data.billingZipCode || "",
            country: data.billingCountry || "",
          };
          
      console.log("Form submission step 3 - Prepared billing address", { billingAddress });
      
      // Prepare order data - include fields for both old and new schema
      const orderData = {
        // Use both user_id and customerId for compatibility
        user_id: customer?.id,
        customerId: customer?.id,
        // Add fields from shipping address directly to the order for schema compatibility
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        // Include the complete shipping and billing addresses
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
        billingAddress,
        subtotal,
        tax,
        shipping: shippingFee,
        total,
        paymentMethod: data.paymentMethod,
        paymentStatus: "pending", // In a real app, this would be updated after payment processing
        notes: data.notes,
        status: "pending",
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      };
      
      // Prepare order items
      const orderItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        totalPrice: item.price * item.quantity,
      }));
      
      console.log("Form submission step 4 - Ready to submit order", { orderData, orderItems });
      
      // Submit order
      let orderResponse;
      
      try {
        orderResponse = await apiRequest('POST', '/api/orders', {
          orderData,
          orderItems,
        });
        
        console.log("Form submission step 5 - API response", { 
          status: orderResponse.status, 
          ok: orderResponse.ok,
          statusText: orderResponse.statusText
        });
        
        if (!orderResponse.ok) {
          const errorText = await orderResponse.text();
          console.error("Order API error response:", errorText);
          throw new Error(`Failed to create order: ${orderResponse.status} ${orderResponse.statusText}`);
        }
      } catch (apiError) {
        console.error("API request error:", apiError);
        throw apiError;
      }
      
      // Get the created order
      let order;
      try {
        order = await orderResponse.json();
        console.log("Form submission step 6 - Order created", { order });
      } catch (error) {
        console.error("Error parsing order response", error);
        throw error;
      }
      
      // Clear cart and show confirmation
      clearCart();
      
      if (order && order.id) {
        // Redirect to the order confirmation page with the order ID
        navigate(`/order-confirmation?id=${order.id}`);
      } else {
        // Fallback if no order ID is returned
        nextStep();
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: "An error occurred while processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Redirect if cart is empty
  if (items.length === 0 && step !== 5) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="mb-6">You need to add items to your cart before proceeding to checkout.</p>
        <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Checkout - FlexIndi Hair</title>
        <meta name="description" content="Complete your purchase of premium hair extensions and hair care products." />
      </Helmet>
      
      {/* Breadcrumb */}
      <div className="bg-accent py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/cart" className="hover:text-primary transition">Cart</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-500">Checkout</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-playfair text-3xl font-bold mb-8 text-center">Checkout</h1>
        
        {/* Progress steps */}
        <div className="mb-10">
          <div className="flex justify-between max-w-3xl mx-auto">
            {["Information", "Shipping", "Payment", "Review"].map((stepName, index) => (
              <div 
                key={stepName} 
                className={`flex flex-col items-center ${
                  step > index + 1 ? 'text-primary' : step === index + 1 ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  step > index + 1 
                    ? 'bg-primary text-white' 
                    : step === index + 1 
                    ? 'border-2 border-primary text-primary' 
                    : 'border-2 border-gray-300'
                }`}>
                  {step > index + 1 ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className="text-xs md:text-sm">{stepName}</span>
              </div>
            ))}
          </div>
          
          <div className="relative flex justify-between max-w-3xl mx-auto mt-4">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
            {[1, 2, 3].map((_, index) => (
              <div 
                key={index} 
                className={`w-1/3 h-0.5 ${step > index + 1 ? 'bg-primary' : 'bg-gray-200'}`}
              ></div>
            ))}
          </div>
        </div>
        
        {step === 5 ? (
          // Order confirmation
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="font-playfair text-2xl font-bold mb-4">Order Confirmed!</h2>
            <p className="text-gray-600 mb-8">
              Thank you for your purchase! Your order has been received and is being processed.
              A confirmation email has been sent to your email address.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/')}>
                Return to Home
              </Button>
              <Button 
                onClick={() => navigate('/account/orders')}
                variant="outline"
              >
                View Your Orders
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Checkout form */}
            <div className="lg:w-2/3">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {step === 1 && (
                    <div className="space-y-6">
                      <h2 className="font-playfair text-xl font-bold">Contact Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="johndoe@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (234) 567-8901" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <h2 className="font-playfair text-xl font-bold pt-4">Shipping Address</h2>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St, Apt 4B" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State/Province</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP/Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="United States">United States</SelectItem>
                                  <SelectItem value="Canada">Canada</SelectItem>
                                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                  <SelectItem value="Australia">Australia</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="button" 
                          onClick={nextStep}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Continue to Shipping
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {step === 2 && (
                    <div className="space-y-6">
                      <h2 className="font-playfair text-xl font-bold">Shipping Method</h2>
                      
                      <div className="space-y-4">
                        {shippingOptions.map((option) => (
                          <div 
                            key={option.id}
                            className={`border rounded-lg p-4 cursor-pointer ${
                              selectedShipping.id === option.id ? 'border-primary' : 'border-gray-200'
                            }`}
                            onClick={() => setSelectedShipping(option)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  selectedShipping.id === option.id ? 'border-primary' : 'border-gray-300'
                                }`}>
                                  {selectedShipping.id === option.id && (
                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                  )}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium">{option.name}</p>
                                  <p className="text-sm text-gray-500">Delivery in {option.days} business days</p>
                                </div>
                              </div>
                              <div className="font-medium">
                                {option.price === 0 ? (
                                  <span className="text-green-600">Free</span>
                                ) : (
                                  <span>${option.price.toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <h2 className="font-playfair text-xl font-bold pt-4">Billing Address</h2>
                      
                      <div className="flex items-start mb-4">
                        <div className="flex items-center h-5">
                          <input
                            id="sameAsBilling"
                            type="checkbox"
                            checked={form.watch("sameAsBilling")}
                            onChange={(e) => form.setValue("sameAsBilling", e.target.checked)}
                            className="w-4 h-4 border border-gray-300 rounded focus:ring-primary"
                          />
                        </div>
                        <label htmlFor="sameAsBilling" className="ml-2 text-sm text-gray-700">
                          Same as shipping address
                        </label>
                      </div>
                      
                      {!form.watch("sameAsBilling") && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="billingFirstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="billingLastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="billingAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main St, Apt 4B" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="billingCity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="New York" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="billingState"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State/Province</FormLabel>
                                  <FormControl>
                                    <Input placeholder="NY" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="billingZipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ZIP/Postal Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="10001" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="billingCountry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value || "United States"}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a country" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="United States">United States</SelectItem>
                                      <SelectItem value="Canada">Canada</SelectItem>
                                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                      <SelectItem value="Australia">Australia</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          Back to Information
                        </Button>
                        <Button type="button" onClick={nextStep} className="bg-primary hover:bg-primary/90">
                          Continue to Payment
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {step === 3 && (
                    <div className="space-y-6">
                      <h2 className="font-playfair text-xl font-bold">Payment Method</h2>
                      
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-4"
                              >
                                <div className={`border rounded-lg p-4 ${
                                  field.value === "credit_card" ? 'border-primary' : 'border-gray-200'
                                }`}>
                                  <div className="flex items-center">
                                    <RadioGroupItem value="credit_card" id="credit_card" />
                                    <Label htmlFor="credit_card" className="flex items-center ml-3">
                                      <CreditCard className="w-5 h-5 mr-2" />
                                      <span>Credit Card</span>
                                    </Label>
                                  </div>
                                  
                                  {field.value === "credit_card" && (
                                    <div className="mt-4 space-y-4">
                                      <div>
                                        <label htmlFor="card_number" className="block text-sm font-medium text-gray-700 mb-1">
                                          Card Number
                                        </label>
                                        <Input id="card_number" placeholder="1234 5678 9012 3456" />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-1">
                                            Expiration (MM/YY)
                                          </label>
                                          <Input id="expiration" placeholder="MM/YY" />
                                        </div>
                                        <div>
                                          <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                                            CVC
                                          </label>
                                          <Input id="cvc" placeholder="123" />
                                        </div>
                                      </div>
                                      <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                                        <AlertDescription>
                                          This is a demo website. No actual payment will be processed.
                                        </AlertDescription>
                                      </Alert>
                                    </div>
                                  )}
                                </div>
                                
                                <div className={`border rounded-lg p-4 ${
                                  field.value === "paypal" ? 'border-primary' : 'border-gray-200'
                                }`}>
                                  <div className="flex items-center">
                                    <RadioGroupItem value="paypal" id="paypal" />
                                    <Label htmlFor="paypal" className="flex items-center ml-3">
                                      <Slack className="w-5 h-5 mr-2" />
                                      <span>PayPal</span>
                                    </Label>
                                  </div>
                                  
                                  {field.value === "paypal" && (
                                    <div className="mt-4">
                                      <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                                        <AlertDescription>
                                          You will be redirected to PayPal to complete your payment securely.
                                          <br />
                                          This is a demo website. No actual payment will be processed.
                                        </AlertDescription>
                                      </Alert>
                                    </div>
                                  )}
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Notes (optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any special instructions for your order?"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          Back to Shipping
                        </Button>
                        <Button type="button" onClick={nextStep} className="bg-primary hover:bg-primary/90">
                          Review Order
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {step === 4 && (
                    <div className="space-y-6">
                      <h2 className="font-playfair text-xl font-bold">Review Your Order</h2>
                      
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium mb-2">Contact Information</h3>
                          <p className="text-sm">{form.getValues('email')}</p>
                          <p className="text-sm">{form.getValues('phone')}</p>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium mb-2">Shipping Address</h3>
                          <p className="text-sm">
                            {form.getValues('firstName')} {form.getValues('lastName')}
                          </p>
                          <p className="text-sm">{form.getValues('address')}</p>
                          <p className="text-sm">
                            {form.getValues('city')}, {form.getValues('state')} {form.getValues('zipCode')}
                          </p>
                          <p className="text-sm">{form.getValues('country')}</p>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium mb-2">Shipping Method</h3>
                          <div className="flex justify-between">
                            <p className="text-sm">{selectedShipping.name} ({selectedShipping.days} business days)</p>
                            <p className="text-sm">
                              {selectedShipping.price === 0 ? (
                                <span className="text-green-600">Free</span>
                              ) : (
                                <span>${selectedShipping.price.toFixed(2)}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        {!form.getValues('sameAsBilling') && (
                          <div className="border rounded-lg p-4">
                            <h3 className="font-medium mb-2">Billing Address</h3>
                            <p className="text-sm">
                              {form.getValues('billingFirstName')} {form.getValues('billingLastName')}
                            </p>
                            <p className="text-sm">{form.getValues('billingAddress')}</p>
                            <p className="text-sm">
                              {form.getValues('billingCity')}, {form.getValues('billingState')} {form.getValues('billingZipCode')}
                            </p>
                            <p className="text-sm">{form.getValues('billingCountry')}</p>
                          </div>
                        )}
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium mb-2">Payment Method</h3>
                          <p className="text-sm">
                            {form.getValues('paymentMethod') === 'credit_card' ? 'Credit Card' : 'PayPal'}
                          </p>
                        </div>
                        
                        <div className="border rounded-lg divide-y">
                          <div className="p-4">
                            <h3 className="font-medium mb-2">Items</h3>
                          </div>
                          
                          {items.map((item) => (
                            <div key={item.id} className="p-4 flex justify-between">
                              <div className="flex items-center">
                                <div className="relative w-16 h-16 mr-4">
                                  <img 
                                    src={item.mainImageUrl} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover rounded"
                                  />
                                  <div className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {item.quantity}
                                  </div>
                                </div>
                                <span className="text-sm">{item.name}</span>
                              </div>
                              <span className="text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          Back to Payment
                        </Button>
                        <div className="space-x-2">
                          <Button 
                            type="button"
                            variant="outline"
                            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
                            onClick={async () => {
                              console.log("Debug button clicked");
                              try {
                                // Create a basic order directly with the API
                                const debugOrderData = {
                                  // Use both user_id and customerId for compatibility
                                  user_id: customer?.id,
                                  customerId: customer?.id,
                                  firstName: "Test",
                                  lastName: "User",
                                  email: "test@example.com",
                                  phone: "1234567890",
                                  address: "123 Test St",
                                  city: "Test City",
                                  state: "TS",
                                  zipCode: "12345",
                                  country: "United States",
                                  shippingAddress: {
                                    firstName: "Test",
                                    lastName: "User",
                                    address: "123 Test St",
                                    city: "Test City",
                                    state: "TS",
                                    zipCode: "12345",
                                    country: "United States",
                                  },
                                  billingAddress: {
                                    firstName: "Test",
                                    lastName: "User",
                                    address: "123 Test St",
                                    city: "Test City",
                                    state: "TS",
                                    zipCode: "12345",
                                    country: "United States",
                                  },
                                  subtotal: subtotal,
                                  tax: tax,
                                  shipping: shippingFee,
                                  total: total,
                                  paymentMethod: "credit_card",
                                  paymentStatus: "pending",
                                  notes: "Debug order",
                                  status: "pending",
                                  expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                                };
                                
                                const debugOrderItems = items.map(item => ({
                                  productId: item.id,
                                  quantity: item.quantity,
                                  price: item.price,
                                  name: item.name,
                                  totalPrice: item.price * item.quantity,
                                }));
                                
                                console.log("Sending debug order directly to API");
                                const response = await apiRequest('POST', '/api/orders', {
                                  orderData: debugOrderData,
                                  orderItems: debugOrderItems,
                                });
                                
                                console.log("Debug order response:", response);
                                if (!response.ok) {
                                  throw new Error(`API error: ${response.status}`);
                                }
                                
                                const orderResult = await response.json();
                                console.log("Debug order created:", orderResult);
                                
                                toast({
                                  title: "Debug order created",
                                  description: `Order ID: ${orderResult.id}`,
                                });
                                
                                clearCart();
                                
                                // Redirect to order confirmation
                                navigate(`/order-confirmation?id=${orderResult.id}`);
                              } catch (error) {
                                console.error("Debug order error:", error);
                                toast({
                                  title: "Debug order failed",
                                  description: String(error),
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            Debug Order
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-primary hover:bg-primary/90"
                            disabled={isSubmitting}
                            onClick={() => {
                              console.log("Complete Order button clicked");
                              const formData = form.getValues();
                              console.log("Form data:", formData);
                              toast({
                                title: "Button clicked",
                                description: "Attempting to process order...",
                              });
                              // Try manual submission
                              form.handleSubmit(onSubmit)();
                            }}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                Processing...
                              </>
                            ) : (
                              'Complete Order'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </div>
            
            {/* Order summary */}
            <div className="lg:w-1/3">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-playfair text-xl font-bold mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        <span>${shippingFee.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (7%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-4 font-bold flex justify-between">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center">
                        <div className="relative w-16 h-16 mr-4 flex-shrink-0">
                          <img 
                            src={item.mainImageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Custom Label component for radio buttons
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    />
  );
}
