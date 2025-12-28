import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import DirectSale from '@/lib/models/DirectSale';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, phone, password, identifier } = await request.json();

    // Accept either email or phone as identifier
    const loginId = identifier || email || phone;

    if (!loginId || !password) {
      return NextResponse.json(
        { message: 'Please provide email/phone and password' },
        { status: 400 }
      );
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: loginId },
        { phone: loginId },
      ],
    }).select('+password');

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // If login is by phone and password matches phone, allow initial login
    let isPasswordCorrect = false;
    if (user.phone === loginId && password === user.phone) {
      isPasswordCorrect = true;
    } else {
      isPasswordCorrect = await user.comparePassword(password);
    }

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // If logging in with phone and password is phone, prompt to update password
    let mustUpdatePassword = false;
    if (user.phone === loginId && password === user.phone) {
      mustUpdatePassword = true;
    }

    // Check if phone exists in DirectSale records (for name validation)
    let requiresNameValidation = false;
    const directSaleRecords = await DirectSale.findOne({
      customerMobile: user.phone,
    });
    if (directSaleRecords) {
      requiresNameValidation = true;
    }

    // Create JWT token (include role)
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged in successfully',
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
        },
        mustUpdatePassword,
        requiresNameValidation,
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/', // Ensure cookie is available on all paths
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Error logging in', error: error.message },
      { status: 500 }
    );
  }
}
