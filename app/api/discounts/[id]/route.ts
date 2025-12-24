import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// This would connect to your actual database in production
// For now using a reference to the parent route's discounts
let discounts: any[] = [];

// Helper function to get all discounts (shared state)
function getDiscounts() {
  return discounts;
}

function setDiscounts(newDiscounts: any[]) {
  discounts = newDiscounts;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (jwtError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const currentDiscounts = getDiscounts();
    const index = currentDiscounts.findIndex((d) => d.id === id);

    if (index === -1) {
      return NextResponse.json(
        { message: 'Discount not found' },
        { status: 404 }
      );
    }

    const updatedDiscount = {
      ...currentDiscounts[index],
      ...body,
      id: id, // Keep the same ID
      createdAt: currentDiscounts[index].createdAt, // Keep original creation date
    };

    currentDiscounts[index] = updatedDiscount;
    setDiscounts(currentDiscounts);

    return NextResponse.json(updatedDiscount);
  } catch (error: any) {
    console.error('Error updating discount:', error);
    return NextResponse.json(
      { message: 'Error updating discount' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (jwtError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    const currentDiscounts = getDiscounts();
    const index = currentDiscounts.findIndex((d) => d.id === id);

    if (index === -1) {
      return NextResponse.json(
        { message: 'Discount not found' },
        { status: 404 }
      );
    }

    currentDiscounts.splice(index, 1);
    setDiscounts(currentDiscounts);

    return NextResponse.json({ message: 'Discount deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting discount:', error);
    return NextResponse.json(
      { message: 'Error deleting discount' },
      { status: 500 }
    );
  }
}
