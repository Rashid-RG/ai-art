
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Product, CartItem, Order, UserRole, Notification, AnalyticsMetric, Review, Message } from '../types';
import { db } from '../services/db';

interface AppContextType {
  user: User | null;
  allUsers: User[]; 
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  userOrders: Order[];
  notifications: Notification[];
  alerts: Notification[];
  newOrderCount: number;
  analyticsData: AnalyticsMetric[];
  reviews: Review[];
  messages: Message[];
  wishlist: string[]; // List of Product IDs
  
  // Auth
  login: (email: string, role?: UserRole, password?: string) => boolean;
  register: (name: string, email: string, role: UserRole, password?: string) => void;
  logout: () => void;
  updateProfile: (updatedUser: User) => void;
  changePassword: (current: string, newPass: string) => boolean;
  resetPassword: (email: string) => void;
  deleteUser: (id: string) => void;
  
  // Product & Cart
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  placeOrder: () => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  
  // New Features
  addReview: (review: Review) => void;
  sendMessage: (msg: Message) => void;
  toggleWishlist: (productId: string) => void;
  deleteMessage: (id: string) => void;

  // System
  notify: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;
  clearAlerts: () => void;
  clearNewOrderCount: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsMetric[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const userOrders = user ? orders.filter(o => o.userId === user.id) : [];

  useEffect(() => {
    db.init();
    setProducts(db.products.getAll());
    setOrders(db.orders.getAll());
    setAllUsers(db.users.getAll());
    setAnalyticsData(db.analytics.getRecent());
    setReviews(db.reviews.getAll());
    setMessages(db.messages.getAll());

    const storedUser = localStorage.getItem('artisha_active_session');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setWishlist(db.wishlist.getUserWishlist(parsedUser.id));
    }
  }, []);

  // Simulating Real-time Analytics
  useEffect(() => {
    const interval = setInterval(() => {
      const baseUsers = Math.floor(Math.random() * 20) + 10;
      const actions = ['Viewed Product', 'Added to Cart', 'Checkout', 'Search', 'Browse Gallery'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      const newMetric: AnalyticsMetric = {
        timestamp: Date.now(),
        activeUsers: baseUsers,
        pageViews: Math.floor(Math.random() * 5),
        recentAction: randomAction
      };
      
      db.analytics.log(newMetric);
      setAnalyticsData(prev => {
        const updated = [...prev, newMetric];
        if (updated.length > 20) updated.shift();
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const notify = (type: Notification['type'], message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    const note = { id, type, message };
    setNotifications(prev => [...prev, note]);
    setAlerts(prev => [note, ...prev].slice(0, 10));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const login = (email: string, role: UserRole = UserRole.CUSTOMER, password?: string) => {
    const foundUser = db.users.findByEmail(email);
    if (foundUser) {
      if (password && foundUser.password && password !== foundUser.password) {
        notify('error', 'Invalid password.');
        return false;
      }
      setUser(foundUser);
      setWishlist(db.wishlist.getUserWishlist(foundUser.id));
      localStorage.setItem('artisha_active_session', JSON.stringify(foundUser));
      notify('success', `Welcome back, ${foundUser.name}!`);
      return true;
    } else {
      notify('error', 'User not found. Please register.');
      return false;
    }
  };

  const register = (name: string, email: string, role: UserRole, password?: string) => {
    if (db.users.findByEmail(email)) {
      notify('error', 'Email already registered.');
      return;
    }
    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      role,
      password: password || 'password123',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      bio: 'New member of the Artisha community.',
      joinDate: new Date().toISOString()
    };
    db.users.add(newUser);
    setAllUsers(db.users.getAll());
    setUser(newUser);
    localStorage.setItem('artisha_active_session', JSON.stringify(newUser));
    notify('success', `Account created successfully! Welcome, ${name}.`);
  };

  const updateProfile = (updatedUser: User) => {
    db.users.update(updatedUser);
    setUser(updatedUser);
    setAllUsers(db.users.getAll());
    localStorage.setItem('artisha_active_session', JSON.stringify(updatedUser));
    notify('success', 'Profile updated successfully.');
  };

  const changePassword = (current: string, newPass: string) => {
    if (!user) return false;
    if (user.password && current !== user.password) {
      notify('error', 'Current password incorrect.');
      return false;
    }
    const updatedUser = { ...user, password: newPass };
    db.users.update(updatedUser);
    setUser(updatedUser);
    localStorage.setItem('artisha_active_session', JSON.stringify(updatedUser));
    notify('success', 'Password changed successfully.');
    return true;
  };

  const resetPassword = (email: string) => {
    const found = db.users.findByEmail(email);
    if(found) notify('success', `Password reset link sent to ${email}`);
    else notify('info', 'If account exists, reset link sent.');
  };

  const deleteUser = (id: string) => {
    db.users.delete(id);
    setAllUsers(db.users.getAll());
    notify('info', 'User deleted.');
  };

  const logout = () => {
    setUser(null);
    setWishlist([]);
    localStorage.removeItem('artisha_active_session');
    notify('info', 'You have been logged out.');
  };

  const addProduct = (product: Product) => {
    const updated = [...products, product];
    setProducts(updated);
    db.products.save(updated);
    notify('success', 'Product added successfully.');
  };

  const updateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(updated);
    db.products.save(updated);
    notify('success', 'Product updated successfully.');
  };

  const removeProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    db.products.save(updated);
    notify('success', 'Product removed.');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    notify('success', `${product.title} added to cart!`);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    notify('info', 'Item removed from cart.');
  };

  const clearCart = () => setCart([]);

  const placeOrder = () => {
    if (!user) return;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      userId: user.id,
      items: [...cart],
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'pending',
      date: new Date().toISOString()
    };
    db.orders.add(newOrder);
    setOrders(db.orders.getAll());
    setNewOrderCount(prev => prev + 1);
    clearCart();
    notify('success', 'Order placed successfully! We will notify you when it ships.');
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      const updated = { ...order, status };
      db.orders.update(updated);
      setOrders(db.orders.getAll());
      notify('success', `Order #${id} updated to ${status}.`);
      const message = `Update for Order #${id}: Your order status is now ${status}.`;
      const newAlert: Notification = { id: Date.now().toString(), type: 'info', message: message };
      setAlerts(prev => [newAlert, ...prev].slice(0, 10));
    }
  };

  const clearNewOrderCount = () => setNewOrderCount(0);

  const addReview = (review: Review) => {
    db.reviews.add(review);
    setReviews(db.reviews.getAll());
    notify('success', 'Review submitted successfully.');
  };

  const sendMessage = (msg: Message) => {
    db.messages.add(msg);
    setMessages(db.messages.getAll());
    notify('success', 'Message sent successfully. We will get back to you soon.');
  };
  
  const deleteMessage = (id: string) => {
    db.messages.delete(id);
    setMessages(db.messages.getAll());
    notify('info', 'Message deleted.');
  };

  const toggleWishlist = (productId: string) => {
    if (!user) {
      notify('info', 'Please login to use Wishlist.');
      return;
    }
    const added = db.wishlist.toggle(user.id, productId);
    setWishlist(db.wishlist.getUserWishlist(user.id));
    notify(added ? 'success' : 'info', added ? 'Added to wishlist.' : 'Removed from wishlist.');
  };

  return (
    <AppContext.Provider value={{
      user, allUsers, products, cart, orders, userOrders, notifications, alerts, newOrderCount, analyticsData, reviews, messages, wishlist,
      login, register, logout, updateProfile, changePassword, resetPassword, deleteUser,
      addProduct, updateProduct, removeProduct, addToCart, removeFromCart, clearCart, placeOrder, updateOrderStatus,
      addReview, sendMessage, toggleWishlist, deleteMessage,
      notify, removeNotification, clearAlerts, clearNewOrderCount
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
