import { Product, User, UserRole } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Serenity in Blue',
    description: 'A calming abstract oil painting depicting the ocean depths.',
    price: 25000,
    category: 'Painting',
    imageUrl: 'https://picsum.photos/400/500?random=1',
    stock: 5,
    tags: ['abstract', 'blue', 'ocean', 'oil']
  },
  {
    id: 'p2',
    title: 'Golden Elephant Sculpture',
    description: 'Hand-carved wooden elephant with gold leaf accents, traditional Sri Lankan craft.',
    price: 18500,
    category: 'Sculpture',
    imageUrl: 'https://picsum.photos/400/400?random=2',
    stock: 2,
    tags: ['wood', 'traditional', 'sculpture']
  },
  {
    id: 'p3',
    title: 'Sunset over Sigiriya',
    description: 'Vibrant acrylic on canvas capturing the ancient rock fortress at dusk.',
    price: 45000,
    category: 'Painting',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    stock: 1,
    tags: ['landscape', 'sri lanka', 'nature']
  },
  {
    id: 'p4',
    title: 'Batik Wall Hanging',
    description: 'Intricate traditional wax-resist dyeing on cotton fabric.',
    price: 8000,
    category: 'Textile',
    imageUrl: 'https://picsum.photos/400/600?random=4',
    stock: 10,
    tags: ['batik', 'textile', 'wall art']
  }
];

export const MOCK_ADMIN: User = {
  id: 'admin1',
  name: 'Aaiysha (Artist)',
  email: 'admin@artisha.com',
  role: UserRole.ADMIN,
  avatar: 'https://picsum.photos/100/100?random=5'
};

export const MOCK_CUSTOMER: User = {
  id: 'cust1',
  name: 'John Doe',
  email: 'john@example.com',
  role: UserRole.CUSTOMER,
  avatar: 'https://picsum.photos/100/100?random=6'
};
