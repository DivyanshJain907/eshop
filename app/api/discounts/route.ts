import { connectDB } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Simple in-memory storage for discounts (for demo)
// In production, use MongoDB
let discounts: any[] = [];
let discountIdCounter = 1;

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    return NextResponse.json(discounts);
  } catch (error: any) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { message: 'Error fetching discounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (jwtError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin or employee
    const user = JSON.parse(Buffer.from(decoded.id).toString());
    if (!['admin', 'employee'].includes(user.role)) {
      return NextResponse.json(
        { message: 'Only admin and employees can create discounts' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validation
    if (!body.productId || !body.productName) {
      return NextResponse.json(
        { message: 'Product is required' },
        { status: 400 }
      );
    }

    if (!body.discountValue || body.discountValue <= 0) {
      return NextResponse.json(
        { message: 'Discount value must be greater than 0' },
        { status: 400 }
      );
    }

    if (body.discountType === 'percentage' && body.discountValue > 100) {
      return NextResponse.json(
        { message: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      );
    }

    const discount = {
      id: (discountIdCounter++).toString(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    discounts.push(discount);

    return NextResponse.json(discount, { status: 201 });
  } catch (error: any) {
    console.error('Error creating discount:', error);
    return NextResponse.json(
      { message: 'Error creating discount' },
      { status: 500 }
    );
  }
}
