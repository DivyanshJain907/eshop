import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const booking = await Booking.findById(id)
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
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    // If cancelling a booking, restore product quantities
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      for (const item of booking.items) {
        try {
          const product = await Product.findById(item.productId);
          if (product) {
            // Restore quantity
            product.quantity += item.quantity;
            await product.save();
            console.log(`✅ Product ${item.productName} quantity restored by ${item.quantity}. New quantity: ${product.quantity}`);
          }
        } catch (productError) {
          console.warn(`⚠️  Could not restore product ${item.productId}:`, productError);
        }
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name price');

    return NextResponse.json(
      {
        success: true,
        message: `Booking status updated to ${status}`,
        booking: updatedBooking,
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
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const booking = await Booking.findById(id);

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
