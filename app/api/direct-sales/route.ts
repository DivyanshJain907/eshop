import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// In-memory storage for direct sales
let directSales: any[] = [];

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Direct Sales API: POST request received');

    const token = request.cookies.get('token')?.value;

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
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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

      if (item.quantity <= 0) {
        console.log('❌ Invalid quantity:', item.quantity);
        return NextResponse.json(
          { message: `Invalid quantity for ${item.productName}. Quantity must be greater than 0.` },
          { status: 400 }
        );
      }

      // Check product availability
      try {
        await connectDB();
        const product = await Product.findById(item.productId);

        if (!product) {
          console.log('❌ Product not found:', item.productId);
          return NextResponse.json(
            { message: `Product "${item.productName}" not found.` },
            { status: 404 }
          );
        }

        if (product.quantity < item.quantity) {
          console.log(
            `❌ Insufficient stock for ${item.productName}. Available: ${product.quantity}, Requested: ${item.quantity}`
          );
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

    // Reduce product quantities for each sold item
    for (const item of items) {
      try {
        await connectDB();
        const product = await Product.findById(item.productId);
        if (product) {
          // Reduce quantity by sold amount
          product.quantity = Math.max(0, product.quantity - item.quantity);
          await product.save();
          console.log(`✅ Product ${item.productName} quantity reduced by ${item.quantity}. New quantity: ${product.quantity}`);
        }
      } catch (productError) {
        console.warn(`⚠️ Could not update product ${item.productId}:`, productError);
      }
    }

    // Record the direct sale
    const sale = {
      id: Date.now().toString(),
      employeeId: decoded.id,
      items,
      totalAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    directSales.push(sale);

    console.log('✅ Direct sale created successfully:', sale);

    return NextResponse.json(sale, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error processing direct sale:', error);
    return NextResponse.json(
      { message: 'Error processing sale', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    return NextResponse.json(directSales);
  } catch (error: any) {
    console.error('Error fetching direct sales:', error);
    return NextResponse.json(
      { message: 'Error fetching sales' },
      { status: 500 }
    );
  }
}
