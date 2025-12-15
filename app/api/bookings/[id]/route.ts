import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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

    const booking = await Booking.findById(params.id)
      .populate('userId', 'name email phone street city state pincode')
      .populate('items.productId', 'name price');

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const user = await User.findById(decoded.id);
    if (
      booking.userId.toString() !== decoded.id &&
      user?.role !== 'employee' &&
      user?.role !== 'admin'
    ) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch booking error:', error);
    return NextResponse.json(
      { message: 'Error fetching booking', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Check if user is employee or admin
    const user = await User.findById(decoded.id);
    if (user?.role !== 'employee' && user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only employees can update bookings' },
        { status: 403 }
      );
    }

    const { status } = await request.json();

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    const booking = await Booking.findByIdAndUpdate(
      params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name price');

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Booking status updated to ${status}`,
        booking,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { message: 'Error updating booking', error: error.message },
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

    const booking = await Booking.findById(params.id);

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check authorization - customer can cancel their own, employees can delete any
    const user = await User.findById(decoded.id);
    if (
      booking.userId.toString() !== decoded.id &&
      user?.role !== 'employee' &&
      user?.role !== 'admin'
    ) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update status to cancelled instead of deleting
    booking.status = 'cancelled';
    await booking.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Booking cancelled',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { message: 'Error cancelling booking', error: error.message },
      { status: 500 }
    );
  }
}
