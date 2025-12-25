import { fetchSales, fetchBookings } from '@/lib/api';

export async function fetchUserSalesRecords({ userId, customerMobile, customerName }) {
  // Fetch all sales
  const allSales = await fetchSales();
  // Filter by customerMobile or customerName
  return allSales.filter(sale => {
    if (customerMobile && sale.customerMobile) {
      return sale.customerMobile === customerMobile;
    }
    if (customerName && sale.customerName) {
      return sale.customerName === customerName;
    }
    return false;
  });
}

export async function fetchUserBookingRecords(userId) {
  // Fetch all bookings
  const allBookings = await fetchBookings();
  // Filter by userId
  return allBookings.filter(booking => booking.userId === userId);
}
