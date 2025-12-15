import { Product } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/api/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function createProduct(
  product: Omit<Product, 'id' | '_id'>
): Promise<Product | null> {
  try {
    const response = await fetch(`${API_URL}/api/products`, {
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
    const response = await fetch(`${API_URL}/api/products/${id}`, {
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
    const response = await fetch(`${API_URL}/api/products/${id}`, {
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
    const response = await fetch(`${API_URL}/api/products`, {
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
    const response = await fetch(`${API_URL}/api/sales`);
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
    const response = await fetch(`${API_URL}/api/sales`, {
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
    const response = await fetch(`${API_URL}/api/sales`, {
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
    
    const response = await fetch(`${API_URL}/api/bookings`, {
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
    const response = await fetch(`${API_URL}/api/bookings`, {
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
    const response = await fetch(`${API_URL}/api/bookings/${id}`, {
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
    const response = await fetch(`${API_URL}/api/bookings/${id}`, {
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
    const response = await fetch(`${API_URL}/api/bookings/${id}`, {
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
    const response = await fetch(`${API_URL}/api/users`, {
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
    const response = await fetch(`${API_URL}/api/users/${id}`, {
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
    
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
    });
    
    console.log('🔵 Response status:', response.status);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('🔴 Update role failed - response:', responseText);
      
      let errorData = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText || 'Unknown error' };
      }
      
      console.error('🔴 Update role failed:', {
        status: response.status,
        message: errorData.message,
        details: errorData.details,
        urlUsed: `${API_URL}/api/users/${id}`,
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
    const response = await fetch(`${API_URL}/api/users/${id}`, {
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
    const response = await fetch(`${API_URL}/api/users/${id}`, {
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
