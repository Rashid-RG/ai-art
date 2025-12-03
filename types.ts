
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  joinDate?: string;
  password?: string; // For mock auth
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  tags: string[];
  aiPricingDetails?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // For generated images in creative studio
  timestamp: number;
}

export interface CustomArtRequest {
  id: string;
  userId: string;
  description: string;
  generatedImageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  message: string;
}

export interface AnalyticsMetric {
  timestamp: number;
  activeUsers: number;
  pageViews: number;
  recentAction: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface WishlistItem {
  userId: string;
  productId: string;
  date: string;
}
