import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'The Atlas',
    quote: "Who is John Galt?",
    description: "A stark, minimalist design featuring the question that stopped the world. High-contrast gold text on black.",
    price: 999,
    stock: 50,
    imageUrl: 'https://picsum.photos/seed/atlas/400/500'
  },
  {
    id: '2',
    title: 'The Architect',
    quote: "A building has integrity just like a man.",
    description: "Inspired by Howard Roark. Geometric lines representing the Cortlandt Homes complex.",
    price: 1299,
    stock: 30,
    imageUrl: 'https://picsum.photos/seed/roark/400/500'
  },
  {
    id: '3',
    title: 'The Motor',
    quote: "I swear by my life and my love of it that I will never live for the sake of another man.",
    description: "The ultimate oath of the objectivist. Industrial gear motif.",
    price: 1499,
    stock: 15,
    imageUrl: 'https://picsum.photos/seed/motor/400/500'
  },
  {
    id: '4',
    title: 'The Currency',
    quote: "Money is the barometer of a society's virtue.",
    description: "Features the sign of the dollar, the symbol of free trade and honest value.",
    price: 1150,
    stock: 100,
    imageUrl: 'https://picsum.photos/seed/money/400/500'
  }
];

export const STORAGE_KEYS = {
  PRODUCTS: 'galt_threads_products',
  ORDERS: 'galt_threads_orders',
  REQUESTS: 'galt_threads_requests',
  USER: 'galt_threads_user',
};

export const ADMIN_PASSKEY = 'GALT';

// Replace this with your actual Google Cloud Console Client ID for production use
export const GOOGLE_CLIENT_ID = ''; 
