import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import Product from '@/lib/models/Product';
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

    // Validate items structure and check availability
    for (const item of items) {
      if (!item.productId || !item.productName || !item.quantity || item.price === undefined) {
        console.log('❌ Invalid item structure:', item);
        return NextResponse.json(
          { message: 'Invalid item structure. Each item must have productId, productName, quantity, and price.' },
          { status: 400 }
        );
      }

      // Check if quantity is positive
      if (item.quantity <= 0) {
        console.log('❌ Invalid quantity:', item.quantity);
        return NextResponse.json(
          { message: `Invalid quantity for ${item.productName}. Quantity must be greater than 0.` },
          { status: 400 }
        );
      }

      // Check product availability
      try {
        const product = await Product.findById(item.productId);
        if (!product) {
          console.log('❌ Product not found:', item.productId);
          return NextResponse.json(
            { message: `Product "${item.productName}" not found.` },
            { status: 404 }
          );
        }

        if (product.quantity < item.quantity) {
          console.log(`❌ Insufficient stock for ${item.productName}. Available: ${product.quantity}, Requested: ${item.quantity}`);
          return NextResponse.json(
            { message: `Insufficient stock for "${item.productName}". Only ${product.quantity} item(s) available, but you requested ${item.quantity}.` },
            { status: 400 }
          );
        }
      } catch (productError) {
        console.error(`❌ Error checking product availability for ${item.productId}:`, productError);
        return NextResponse.json(
          { message: 'Error verifying product availability.' },
          { status: 500 }
        );
      }
    }

    // Create booking with 24-hour expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    console.log('Creating booking with:', { userId: decoded.id, itemCount: items.length, totalAmount, expiresAt });

    // Reduce product quantities for each booked item
    for (const item of items) {
      try {
        const product = await Product.findById(item.productId);
        if (product) {
          // Reduce quantity by booked amount
          product.quantity = Math.max(0, product.quantity - item.quantity);
          await product.save();
          console.log(`✅ Product ${item.productName} quantity reduced by ${item.quantity}. New quantity: ${product.quantity}`);
        }
      } catch (productError) {
        console.warn(`⚠️  Could not update product ${item.productId}:`, productError);
      }
    }

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
    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10)); // Max 50 per page
    const skip = (page - 1) * limit;

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

    let filter: any = {};
    
    // If customer, get their bookings
    if (user.role === 'customer') {
      filter.userId = decoded.id;
    } else if (user.role !== 'employee' && user.role !== 'admin') {
      // If not customer/employee/admin, unauthorized
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }
    // If employee/admin, no filter (get all bookings)

    // Get total count
    const total = await Booking.countDocuments(filter);

    // Fetch bookings with pagination and field projection
    const bookings = await Booking.find(filter)
      .select('userId items totalAmount status createdAt expiresAt') // Only necessary fields
      .populate('userId', 'name email phone street city state pincode') // Populate user details
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean for faster read-only queries

    const pages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        }
      }
    );
  } catch (error: any) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json(
      { message: 'Error fetching bookings', error: error.message },
      { status: 500 }
    );
  }
}
