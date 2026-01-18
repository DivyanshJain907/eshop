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
  barcode?: string;
  productCode?: string;
  modelName?: string;
  brandName?: string;
  mrp?: number;
  uom?: string;
  attributes?: Record<string, any>;
  createdBy?: string | { _id?: string; name: string; shopName?: string };
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

// Product Comparison Types
export interface ComparisonProduct {
  name: string;
  price: number;
  priceText: string;
  image: string;
  url: string;
  competitor: string;
}

export interface CompetitorSelectors {
  productContainer: string;
  productName: string;
  productBrand: string;
  productPrice: string;
  productImage: string;
  productUrl: string;
}

export interface CompetitorConfig {
  _id?: string;
  name: string;
  baseUrl: string;
  searchUrl: string;
  selectors: CompetitorSelectors;
  maxResults: number;
  timeout: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ComparisonCache {
  _id?: string;
  searchQuery: string;
  competitorName: string;
  results: ComparisonProduct[];
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ComparisonSearchResponse {
  success: boolean;
  productName?: string;
  results?: ComparisonProduct[];
  totalResults?: number;
  duration?: string;
  message?: string;
  error?: string;
}

export interface SelectorDetectionResponse {
  success: boolean;
  selectors?: CompetitorSelectors;
  confidence?: number;
  message?: string;
  warning?: string;
  error?: string;
}
