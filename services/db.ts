
import { Product, User, Order, AnalyticsMetric, Review, Message, WishlistItem } from '../types';
import { INITIAL_PRODUCTS, MOCK_ADMIN, MOCK_CUSTOMER } from '../constants';

const DB_KEYS = {
  USERS: 'artisha_users_v1',
  PRODUCTS: 'artisha_products_v1',
  ORDERS: 'artisha_orders_v1',
  ANALYTICS: 'artisha_analytics_v1',
  REVIEWS: 'artisha_reviews_v1',
  MESSAGES: 'artisha_messages_v1',
  WISHLIST: 'artisha_wishlist_v1'
};

const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage`, e);
    return fallback;
  }
};

// Initialize DB with seed data if empty
const initDB = () => {
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    const seedUsers = [
      { ...MOCK_ADMIN, password: 'password123' },
      { ...MOCK_CUSTOMER, password: 'password123' }
    ];
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(seedUsers));
  }
  if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(DB_KEYS.ORDERS)) {
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.REVIEWS)) {
    localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.MESSAGES)) {
    localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.WISHLIST)) {
    localStorage.setItem(DB_KEYS.WISHLIST, JSON.stringify([]));
  }
};

export const db = {
  init: initDB,
  
  users: {
    getAll: (): User[] => {
      return safeParse(DB_KEYS.USERS, []);
    },
    add: (user: User) => {
      const users = db.users.getAll();
      users.push(user);
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    },
    update: (updatedUser: User) => {
      const users = db.users.getAll();
      const index = users.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        users[index] = { ...users[index], ...updatedUser }; 
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      }
    },
    delete: (id: string) => {
      const users = db.users.getAll().filter(u => u.id !== id);
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    },
    findByEmail: (email: string): User | undefined => {
      return db.users.getAll().find(u => u.email === email);
    }
  },

  products: {
    getAll: (): Product[] => {
      return safeParse(DB_KEYS.PRODUCTS, []);
    },
    save: (products: Product[]) => {
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    }
  },

  orders: {
    getAll: (): Order[] => {
      return safeParse(DB_KEYS.ORDERS, []);
    },
    getByUserId: (userId: string): Order[] => {
      const allOrders = safeParse(DB_KEYS.ORDERS, []);
      return allOrders.filter((o: Order) => o.userId === userId);
    },
    add: (order: Order) => {
      const orders = db.orders.getAll();
      orders.unshift(order);
      localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    },
    update: (updatedOrder: Order) => {
      const orders = db.orders.getAll();
      const index = orders.findIndex(o => o.id === updatedOrder.id);
      if (index !== -1) {
        orders[index] = updatedOrder;
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
      }
    }
  },

  reviews: {
    getAll: (): Review[] => {
      return safeParse(DB_KEYS.REVIEWS, []);
    },
    add: (review: Review) => {
      const reviews = db.reviews.getAll();
      reviews.push(review);
      localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(reviews));
    },
    getByProductId: (productId: string): Review[] => {
      return db.reviews.getAll().filter(r => r.productId === productId);
    }
  },

  messages: {
    getAll: (): Message[] => {
      return safeParse(DB_KEYS.MESSAGES, []);
    },
    add: (msg: Message) => {
      const messages = db.messages.getAll();
      messages.unshift(msg);
      localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(messages));
    },
    markRead: (id: string) => {
      const messages = db.messages.getAll();
      const msg = messages.find(m => m.id === id);
      if (msg) {
        msg.read = true;
        localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(messages));
      }
    },
    delete: (id: string) => {
      const messages = db.messages.getAll().filter(m => m.id !== id);
      localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(messages));
    }
  },

  wishlist: {
    getAll: (): WishlistItem[] => {
      return safeParse(DB_KEYS.WISHLIST, []);
    },
    getUserWishlist: (userId: string): string[] => {
      const all = db.wishlist.getAll();
      return all.filter(w => w.userId === userId).map(w => w.productId);
    },
    toggle: (userId: string, productId: string) => {
      let all = db.wishlist.getAll();
      const exists = all.find(w => w.userId === userId && w.productId === productId);
      
      if (exists) {
        all = all.filter(w => !(w.userId === userId && w.productId === productId));
      } else {
        all.push({ userId, productId, date: new Date().toISOString() });
      }
      localStorage.setItem(DB_KEYS.WISHLIST, JSON.stringify(all));
      return !exists; // Returns true if added, false if removed
    }
  },

  analytics: {
    getRecent: (): AnalyticsMetric[] => {
      const data = safeParse(DB_KEYS.ANALYTICS, []);
      return Array.isArray(data) ? data.slice(-20) : [];
    },
    log: (metric: AnalyticsMetric) => {
      const data = db.analytics.getRecent();
      data.push(metric);
      if (data.length > 20) data.shift();
      localStorage.setItem(DB_KEYS.ANALYTICS, JSON.stringify(data));
    }
  }
};
