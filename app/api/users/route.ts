import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20', 10)); // Max 100 per page
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

    // Check if user is admin
    const user = await User.findById(decoded.id);
    if (user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only admins can view users' },
        { status: 403 }
      );
    }

    // Get total count
    const total = await User.countDocuments();

    // Get paginated users (excluding passwords)
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const pages = Math.ceil(total / limit);

    console.log('🔵 Fetched users count:', users.length);
    if (users.length > 0) {
      console.log('🔵 First user:', {
        _id: users[0]._id,
        name: users[0].name,
        role: users[0].role,
      });
    }

    return NextResponse.json(
      {
        success: true,
        users,
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
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
        }
      }
    );
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { message: 'Error fetching users', error: error.message },
      { status: 500 }
    );
  }
}
