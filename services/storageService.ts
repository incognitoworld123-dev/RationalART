import { Product, Order, UserRequest } from '../types';
import { INITIAL_PRODUCTS, STORAGE_KEYS } from '../constants';

export { STORAGE_KEYS };

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(stored);
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  
  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const saveOrder = (order: Order): void => {
  const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
  const orders: Order[] = stored ? JSON.parse(stored) : [];
  orders.push(order);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

  // Update stock
  const products = getProducts();
  order.items.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
    }
  });
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const getRequests = (): UserRequest[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
  return stored ? JSON.parse(stored) : [];
};

export const saveRequest = (request: UserRequest): void => {
  const requests = getRequests();
  requests.push(request);
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
};