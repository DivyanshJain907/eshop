import { Product } from './types';

// Use relative URLs for same-origin requests (works in both dev and production)
const getApiUrl = (path: string) => {
  // For client-side requests, use relative URLs (will use current origin)
  return path.startsWith('/') ? path : `/${path}`;
};

export async function fetchProducts(): Promise<Product[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(getApiUrl('/api/products?limit=10000'), {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      // Don't throw, let it fall through to return empty array
      // The API should have demo data fallback
      return [];
    }

    const data = await response.json();
    
    // Handle both old array format and new paginated format
    if (Array.isArray(data)) {
      console.log(`✅ Fetched ${data.length} products (array format)`);
      return data;
    }
    if (data.products && Array.isArray(data.products)) {
      console.log(`✅ Fetched ${data.products.length} products`);
      return data.products;
    }
    
    console.warn('⚠️ Unexpected response format:', data);
    return [];
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('⏱️ Fetch timeout - taking too long to get products');
    } else {
      console.error('❌ Error fetching products:', error?.message || error);
    }
    return [];
  }
}

export async function createProduct(
  product: Omit<Product, 'id' | '_id'>
): Promise<Product | null> {
  try {
    const response = await fetch(getApiUrl('/api/products'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  try {
    const response = await fetch(getApiUrl(`/api/products/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl(`/api/products/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

export async function deleteAllProducts(): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl('/api/products'), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete all products');
    return true;
  } catch (error) {
    console.error('Error deleting all products:', error);
    return false;
  }
}

export async function fetchSales() {
  try {
    const response = await fetch(getApiUrl('/api/sales'));
    if (!response.ok) throw new Error('Failed to fetch sales');
    return response.json();
  } catch (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
}

export async function createSale(sale: {
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
}) {
  try {
    const response = await fetch(getApiUrl('/api/sales'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale),
    });
    if (!response.ok) throw new Error('Failed to create sale');
    return response.json();
  } catch (error) {
    console.error('Error creating sale:', error);
    return null;
  }
}

export async function deleteAllSales(): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl('/api/sales'), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete all sales');
    return true;
  } catch (error) {
    console.error('Error deleting all sales:', error);
    return false;
  }
}

// Booking API functions
export async function createBooking(items: any[], totalAmount: number) {
  try {
    console.log('🔵 Starting booking creation...');
    console.log('Items:', items);
    console.log('Total Amount:', totalAmount);
    
    const payload = { items, totalAmount };
    console.log('Request payload:', JSON.stringify(payload));
    
    const response = await fetch(getApiUrl('/api/bookings'), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    console.log('Response received - Status:', response.status);
    console.log('Response content-type:', response.headers.get('content-type'));
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (!responseText) {
      throw new Error('Empty response from server');
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response');
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    console.log('Parsed data:', data);

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP ${response.status}`;
      console.error('❌ API returned error:', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('✅ Booking created successfully:', data.booking);
    return data.booking;
  } catch (error: any) {
    console.error('❌ Booking creation failed:', error.message);
    throw error;
  }
}

export async function fetchBookings() {
  try {
    const response = await fetch(getApiUrl('/api/bookings'), {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    const data = await response.json();
    return data.bookings || [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

export async function getBooking(id: string) {
  try {
    const response = await fetch(getApiUrl(`/api/bookings/${id}`), {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch booking');
    const data = await response.json();
    return data.booking;
  } catch (error) {
    console.error('Error fetching booking:', error);
    return null;
  }
}

export async function updateBookingStatus(id: string, status: string) {
  try {
    const response = await fetch(getApiUrl(`/api/bookings/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update booking');
    const data = await response.json();
    return data.booking;
  } catch (error) {
    console.error('Error updating booking:', error);
    return null;
  }
}

export async function cancelBooking(id: string) {
  try {
    const response = await fetch(getApiUrl(`/api/bookings/${id}`), {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to cancel booking');
    return true;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return false;
  }
}

// User Management API functions
export async function fetchAllUsers() {
  try {
    const response = await fetch(getApiUrl('/api/users'), {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getUser(id: string) {
  try {
    const response = await fetch(getApiUrl(`/api/users/${id}`), {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function updateUserRole(id: string, role: string) {
  try {
    console.log('🔵 Updating user role:', { id, role, idType: typeof id, idLength: id?.length });
    
    const response = await fetch(getApiUrl(`/api/users/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
    });
    
    console.log('🔵 Response status:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('🔴 Update role failed - response:', responseText);
      
      let errorData: any = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText || 'Unknown error' };
      }
      
      console.error('🔴 Update role failed:', {
        status: response.status,
        message: errorData.message,
        details: errorData.details,
      });
      throw new Error(errorData.message || 'Failed to update user role');
    }
    
    const data = await response.json();
    console.log('✅ User role updated:', data.user);
    return data.user;
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    return null;
  }
}

export async function updateUser(id: string, updates: any) {
  try {
    const response = await fetch(getApiUrl(`/api/users/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update user');
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

export async function deleteUser(id: string) {
  try {
    const response = await fetch(getApiUrl(`/api/users/${id}`), {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

export async function fetchDirectSalesCustomers() {
  try {
    const response = await fetch(getApiUrl('/api/direct-sales'), {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch direct sales');
    const sales = await response.json();
    
    // Extract unique customers from sales, deduplicating by phone number
    const customersMap = new Map();
    sales.forEach((sale: any) => {
      // Use phone number as primary key, fallback to customer name
      const key = sale.customerMobile?.trim() || sale.customerName?.trim();
      
      if (key) {
        if (!customersMap.has(key)) {
          customersMap.set(key, {
            _id: `direct-sale-${key}`,
            name: sale.customerName,
            email: sale.customerMobile || 'N/A',
            phone: sale.customerMobile || '',
            role: 'customer',
            street: '',
            city: '',
            state: '',
            pincode: '',
            createdAt: sale.createdAt,
            isDirectSaleCustomer: true,
            totalPurchases: 0,
            totalAmount: 0,
            totalAmountPaid: 0,
            totalAmountDue: 0,
            pendingPayments: 0,
            lastPurchaseDate: null,
          });
        }
        const customer = customersMap.get(key);
        customer.totalPurchases += 1;
        customer.totalAmount += sale.totalAmount || 0;
        customer.totalAmountPaid += sale.amountPaid || 0;
        customer.totalAmountDue += sale.remainingAmount || 0;
        
        // Count pending/partially paid orders
        if (sale.paymentStatus === 'pending' || sale.paymentStatus === 'partially-paid') {
          customer.pendingPayments += 1;
        }
        
        // Track most recent purchase date
        if (!customer.lastPurchaseDate || new Date(sale.createdAt) > new Date(customer.lastPurchaseDate)) {
          customer.lastPurchaseDate = sale.createdAt;
        }
      }
    });
    
    return Array.from(customersMap.values());
  } catch (error) {
    console.error('Error fetching direct sales customers:', error);
    return [];
  }
}