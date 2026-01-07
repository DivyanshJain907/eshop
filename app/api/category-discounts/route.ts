import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import jwt from 'jsonwebtoken';

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      );
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { error: 'MongoDB not connected' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      category,
      retailDiscount,
      wholesaleDiscount,
      superWholesaleDiscount,
    } = body;

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    // Update all products in this category with the new discount tiers
    const updateResult = await Product.updateMany(
      { category },
      {
        retailDiscount: retailDiscount || 0,
        discount: wholesaleDiscount || 0,
        superDiscount: superWholesaleDiscount || 0,
      }
    );

    return NextResponse.json(
      {
        message: 'Category discounts updated',
        modifiedCount: updateResult.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating category discounts:', error);
    return NextResponse.json(
      { error: 'Failed to update category discounts' },
      { status: 500 }
    );
  }
}
