// Cart related types
export interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  cartTotal: number;
  cartCount: number;
}

// Product filter types
export interface ProductFilters {
  categories?: string[];
  hairTypes?: string[];
  concerns?: string[];
  priceRange?: [number, number];
  sortBy?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Checkout types
export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  orderNotes?: string;
  paymentMethod: string;
}

export interface OrderData extends CheckoutFormData {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Review types
export interface ReviewFormData {
  name: string;
  email: string;
  rating: number;
  reviewText: string;
}

// Newsletter subscription
export interface NewsletterSubscription {
  email: string;
}
