export interface Product {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  stockThreshold?: number;
  image?: string;
  images?: string[];
  category?: string;
  // Retail tier
  minRetailQuantity?: number;
  retailDiscount?: number;
  retailPrice?: number;
  // Wholesale tier
  minWholesaleQuantity?: number;
  discount?: number;
  wholesalePrice?: number;
  // Super wholesale tier
  minSuperWholesaleQuantity?: number;
  superDiscount?: number;
  superWholesalePrice?: number;
  // Metadata
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Sale {
  _id?: string;
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  phone: string;
  shopName?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  role: 'customer' | 'employee' | 'admin';
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}
