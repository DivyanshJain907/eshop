import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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

    // Check if user is admin
    const user = await User.findById(decoded.id);
    if (user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only admins can view users' },
        { status: 403 }
      );
    }

    // Get all users (excluding passwords)
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    console.log('🔵 Fetched users count:', users.length);
    if (users.length > 0) {
      console.log('🔵 First user:', {
        _id: users[0]._id,
        _idType: typeof users[0]._id,
        _idString: users[0]._id?.toString(),
        name: users[0].name,
        role: users[0].role,
      });
    }

    return NextResponse.json(
      {
        success: true,
        users,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { message: 'Error fetching users', error: error.message },
      { status: 500 }
    );
  }
}
