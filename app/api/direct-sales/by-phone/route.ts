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

    // Find all direct sales matching the customer phone number
    const orders = await DirectSale.find({ customerMobile: phone })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders: orders || [],
      total: orders?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching direct sales by phone:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
