import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Sale from '@/lib/models/Sale';

// Demo mode sales (stored in memory)
let demoSales: any[] = [];

export async function GET() {
  try {
    const conn = await connectDB();
    
    if (!conn) {
      console.log('📌 Using demo data for sales (MongoDB not connected)');
      return NextResponse.json(demoSales.slice(0, 10), { status: 200 });
    }
    
    const sales = await Sale.find().sort({ createdAt: -1 }).limit(10);
    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    console.error('Error fetching sales:', error);
    // Return demo data as fallback
    return NextResponse.json(demoSales.slice(0, 10), { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { productId, productName, quantity, totalAmount } = body;

    if (!productId || !productName || !quantity || totalAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const conn = await connectDB();
    
    if (!conn) {
      console.log('📌 Recording sale in demo mode');
      const newSale = {
        _id: Date.now().toString(),
        productId,
        productName,
        quantity,
        totalAmount,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      demoSales.unshift(newSale);
      return NextResponse.json(newSale, { status: 201 });
    }

    const sale = new Sale({
      productId,
      productName,
      quantity,
      totalAmount,
    });

    await sale.save();
    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const conn = await connectDB();
    
    if (!conn) {
      console.log('📌 Deleting all sales in demo mode');
      demoSales = [];
      return NextResponse.json({ message: 'All sales deleted' }, { status: 200 });
    }
    
    await Sale.deleteMany({});
    return NextResponse.json({ message: 'All sales deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting sales:', error);
    return NextResponse.json(
      { error: 'Failed to delete sales' },
      { status: 500 }
    );
  }
}
