import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import DirectSale from '@/lib/models/DirectSale';

async function ensureDbConnection() {
  if (mongoose.connection.readyState !== 1) {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDbConnection();

    const phone = request.nextUrl.searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Find all direct sales for this phone and get unique customer names
    const directSales = await DirectSale.find({ customerMobile: phone })
      .select('customerName')
      .lean();

    // Get unique customer names (in case there are multiple)
    const names = [...new Set(directSales.map(sale => sale.customerName))];

    return NextResponse.json({
      success: true,
      phone,
      customerNames: names,
      hasOrders: names.length > 0,
    });
  } catch (error) {
    console.error('Error checking customer names:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check customer names' },
      { status: 500 }
    );
  }
}
