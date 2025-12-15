import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

// Demo mode products (stored in memory for development)
let demoProducts: any[] = [
  {
    _id: '1',
    name: 'Laptop',
    price: 999.99,
    quantity: 15,
    image: '💻',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2',
    name: 'Smartphone',
    price: 699.99,
    quantity: 25,
    image: '📱',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '3',
    name: 'Tablet',
    price: 499.99,
    quantity: 20,
    image: '📱',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '4',
    name: 'Headphones',
    price: 199.99,
    quantity: 40,
    image: '🎧',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '5',
    name: 'Smart Watch',
    price: 299.99,
    quantity: 30,
    image: '⌚',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '6',
    name: 'Camera',
    price: 1299.99,
    quantity: 10,
    image: '📷',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function GET() {
  try {
    const conn = await connectDB();
    
    // If MongoDB is not connected, use demo data
    if (!conn) {
      console.log('📌 Using demo data (MongoDB not connected)');
      return NextResponse.json(demoProducts, { status: 200 });
    }
    
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      return NextResponse.json(products, { status: 200 });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return NextResponse.json(demoProducts, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return demo data as fallback
    return NextResponse.json(demoProducts, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      quantity,
      stock,
      image,
      images,
      category,
      minRetailQuantity,
      retailDiscount,
      retailPrice,
      minWholesaleQuantity,
      discount,
      wholesalePrice,
      minSuperWholesaleQuantity,
      superDiscount,
      superWholesalePrice,
    } = body;

    if (!name || price === undefined || quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    // Verify token and check role
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
    
    // If MongoDB is not connected, use demo mode (skip role check for demo)
    if (!conn) {
      console.log('⚠️  MongoDB not connected - saving to demo mode');
      const newProduct = {
        _id: Date.now().toString(),
        name,
        description: description || '',
        price,
        quantity,
        stock: stock || quantity,
        image: image || '📦',
        images: images || [],
        category: category || '',
        minRetailQuantity: minRetailQuantity || 1,
        retailDiscount: retailDiscount || 0,
        retailPrice: retailPrice || price,
        minWholesaleQuantity: minWholesaleQuantity || 10,
        discount: discount || 0,
        wholesalePrice: wholesalePrice || price,
        minSuperWholesaleQuantity: minSuperWholesaleQuantity || 50,
        superDiscount: superDiscount || 0,
        superWholesalePrice: superWholesalePrice || price,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      demoProducts.unshift(newProduct);
      console.log('📌 Product saved to demo mode:', newProduct.name);
      return NextResponse.json(newProduct, { status: 201 });
    }

    // Check user role in database
    try {
      const user = await User.findById(decoded.id);
      if (!user || (user.role !== 'employee' && user.role !== 'admin')) {
        return NextResponse.json(
          { error: 'Unauthorized - Only employees and admins can add products' },
          { status: 403 }
        );
      }
    } catch (userError) {
      console.error('Error checking user role:', userError);
      return NextResponse.json(
        { error: 'Error verifying user permissions' },
        { status: 500 }
      );
    }

    try {
      const product = new Product({
        name,
        description: description || '',
        price,
        quantity,
        stock: stock || quantity,
        image: image || '📦',
        images: images || [],
        category: category || '',
        minRetailQuantity: minRetailQuantity || 1,
        retailDiscount: retailDiscount || 0,
        retailPrice: retailPrice || price,
        minWholesaleQuantity: minWholesaleQuantity || 10,
        discount: discount || 0,
        wholesalePrice: wholesalePrice || price,
        minSuperWholesaleQuantity: minSuperWholesaleQuantity || 50,
        superDiscount: superDiscount || 0,
        superWholesalePrice: superWholesalePrice || price,
        createdBy: decoded.id,
      });

      const savedProduct = await product.save();
      console.log('✅ Product saved to MongoDB:', savedProduct.name);
      return NextResponse.json(savedProduct, { status: 201 });
    } catch (saveError) {
      console.error('Error saving product to MongoDB:', saveError);
      return NextResponse.json(
        { error: 'Failed to save product to database' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const conn = await connectDB();
    
    if (!conn) {
      console.log('📌 Deleting all products in demo mode');
      demoProducts = [
        {
          _id: '1',
          name: 'Laptop',
          price: 999.99,
          quantity: 15,
          image: '💻',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '2',
          name: 'Smartphone',
          price: 699.99,
          quantity: 25,
          image: '📱',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '3',
          name: 'Tablet',
          price: 499.99,
          quantity: 20,
          image: '📱',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '4',
          name: 'Headphones',
          price: 199.99,
          quantity: 40,
          image: '🎧',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '5',
          name: 'Smart Watch',
          price: 299.99,
          quantity: 30,
          image: '⌚',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '6',
          name: 'Camera',
          price: 1299.99,
          quantity: 10,
          image: '📷',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      return NextResponse.json({ message: 'All products reset' }, { status: 200 });
    }
    
    await Product.deleteMany({});
    return NextResponse.json({ message: 'All products deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting products:', error);
    return NextResponse.json(
      { error: 'Failed to delete products' },
      { status: 500 }
    );
  }
}
