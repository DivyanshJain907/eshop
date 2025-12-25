import { connectDB } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
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
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Fetch user by ID with field projection
    const user = await User.findById(decoded.id).select(
      '_id email name phone shopName street city state pincode role'
    );

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          shopName: user.shopName,
          street: user.street,
          city: user.city,
          state: user.state,
          pincode: user.pincode,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Add cache headers for auth check
    response.headers.set('Cache-Control', 'private, max-age=60'); // Cache for 60 seconds
    return response;
  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { message: 'Not authenticated' },
      { status: 401 }
    );
  }
}
