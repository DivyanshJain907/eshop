import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Booking API: POST request received');
    
    await connectDB();
    console.log('✅ Connected to database');

    // Get token from cookie
    const token = request.cookies.get('token')?.value;
    console.log('Token present:', !!token);
    
    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json(
        { message: 'Unauthorized - No token' },
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
      console.log('✅ Token verified, user ID:', decoded.id);
    } catch (jwtError: any) {
      console.log('❌ Token verification failed:', jwtError.message);
      return NextResponse.json(
        { message: 'Invalid token', error: jwtError.message },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { items, totalAmount } = body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ Invalid items array');
      return NextResponse.json(
        { message: 'Please provide at least one item' },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      console.log('❌ Invalid total amount:', totalAmount);
      return NextResponse.json(
        { message: 'Invalid total amount' },
        { status: 400 }
      );
    }

    // Validate items structure
    for (const item of items) {
      if (!item.productId || !item.productName || !item.quantity || item.price === undefined) {
        console.log('❌ Invalid item structure:', item);
        return NextResponse.json(
          { message: 'Invalid item structure. Each item must have productId, productName, quantity, and price.' },
          { status: 400 }
        );
      }
    }

    // Create booking with 24-hour expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    console.log('Creating booking with:', { userId: decoded.id, itemCount: items.length, totalAmount, expiresAt });

    const booking = await Booking.create({
      userId: decoded.id,
      items,
      totalAmount,
      status: 'pending',
      expiresAt,
    });

    console.log('✅ Booking created:', booking._id);

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully',
        booking: {
          id: booking._id,
          userId: booking.userId,
          items: booking.items,
          totalAmount: booking.totalAmount,
          status: booking.status,
          expiresAt: booking.expiresAt,
          createdAt: booking.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Booking creation error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        message: 'Error creating booking', 
        error: error.message,
        details: error.stack
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Get user to check role
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    let bookings;

    // If customer, get their bookings
    if (user.role === 'customer') {
      bookings = await Booking.find({ userId: decoded.id })
        .populate('userId', 'name email phone')
        .populate('items.productId', 'name price')
        .sort({ createdAt: -1 });
    } else if (user.role === 'employee' || user.role === 'admin') {
      // If employee/admin, get all bookings
      bookings = await Booking.find()
        .populate('userId', 'name email phone street city state pincode')
        .populate('items.productId', 'name price')
        .sort({ createdAt: -1 });
    } else {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        bookings,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json(
      { message: 'Error fetching bookings', error: error.message },
      { status: 500 }
    );
  }
}
