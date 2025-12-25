import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Registration keys for different roles
const REGISTRATION_KEYS = {
  employee: process.env.EMPLOYEE_REGISTRATION_KEY || 'employee-key-123',
  admin: process.env.ADMIN_REGISTRATION_KEY || 'admin-key-456',
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password, name, phone, shopName, street, city, state, pincode, registrationKey } = await request.json();

    // Validation
    if (!email || !password || !name || !phone || !street || !city || !state || !pincode) {
      return NextResponse.json(
        { message: 'Please provide all required fields: email, password, name, phone, street, city, state, and pincode' },
        { status: 400 }
      );
    }

    // Validate phone number (must be exactly 10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { message: 'Phone number must be exactly 10 digits' },
        { status: 400 }
      );
    }

    // Validate pincode (must be exactly 6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { message: 'Pincode must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Determine role based on registration key
    let userRole: 'customer' | 'employee' | 'admin' = 'customer';
    
    if (registrationKey) {
      if (registrationKey === REGISTRATION_KEYS.employee) {
        userRole = 'employee';
      } else if (registrationKey === REGISTRATION_KEYS.admin) {
        userRole = 'admin';
      } else {
        return NextResponse.json(
          { message: 'Invalid registration key' },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      phone,
      shopName: shopName || null,
      street,
      city,
      state,
      pincode,
      role: userRole,
    });

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
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
      { status: 201 }
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Error registering user', error: error.message },
      { status: 500 }
    );
  }
}
