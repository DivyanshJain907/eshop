import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Check if user is admin
    const adminUser = await User.findById(decoded.id);
    if (adminUser?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only admins can view user details' },
        { status: 403 }
      );
    }

    const user = await User.findById(params.id).select('-password');

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch user error:', error);
    return NextResponse.json(
      { message: 'Error fetching user', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔵 PUT /api/users/:id called with params:', params);
    
    await connectDB();
    console.log('✅ Database connected');

    const token = request.cookies.get('token')?.value;
    console.log('🔵 Token present:', !!token);
    
    if (!token) {
      console.log('🔴 No token found');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );
    
    console.log('🔵 Token decoded, user id:', decoded.id);

    // Check if user is admin
    const adminUser = await User.findById(decoded.id);
    console.log('🔵 Admin user found:', !!adminUser, 'role:', adminUser?.role);
    
    if (adminUser?.role !== 'admin') {
      console.log('🔴 User is not admin');
      return NextResponse.json(
        { message: 'Only admins can update users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('🔵 Request body:', body);
    
    const { role, name, email, phone, street, city, state, pincode } = body;

    // Validate role
    const validRoles = ['customer', 'employee', 'admin'];
    if (role && !validRoles.includes(role)) {
      console.log('🔴 Invalid role:', role);
      return NextResponse.json(
        { message: 'Invalid role. Must be customer, employee, or admin.' },
        { status: 400 }
      );
    }

    // Validate user ID format - accept string representation of ObjectId
    let validObjectId = params.id;
    console.log('🔵 ID to validate:', params.id, 'length:', params.id.length);
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.log('🔴 Invalid user ID format:', params.id);
      return NextResponse.json(
        { message: `Invalid user ID format: ${params.id}` },
        { status: 400 }
      );
    }

    // Check if user exists first
    const userExists = await User.findById(params.id);
    console.log('🔵 User exists:', !!userExists);
    if (!userExists) {
      console.log('🔴 User not found before update:', params.id);
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (street) updateData.street = street;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (pincode) updateData.pincode = pincode;
    
    console.log('🔵 Update data:', updateData);

    const updatedUser = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(params.id),
      updateData,
      { new: true, runValidators: false }
    ).select('-password');
    
    console.log('🔵 Updated user:', updatedUser);

    if (!updatedUser) {
      console.log('🔴 Failed to update user:', params.id);
      return NextResponse.json(
        { message: 'Failed to update user' },
        { status: 500 }
      );
    }

    console.log('✅ User updated successfully in database');
    return NextResponse.json(
      {
        success: true,
        message: 'User updated successfully',
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('🔴 Update user error:', error.message, error.stack);
    return NextResponse.json(
      { 
        message: 'Error updating user', 
        error: error.message,
        details: error.errors ? Object.values(error.errors) : null 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Check if user is admin
    const adminUser = await User.findById(decoded.id);
    if (adminUser?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only admins can delete users' },
        { status: 403 }
      );
    }

    // Prevent deleting yourself
    if (params.id === decoded.id) {
      return NextResponse.json(
        { message: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(params.id);

    if (!deletedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { message: 'Error deleting user', error: error.message },
      { status: 500 }
    );
  }
}
