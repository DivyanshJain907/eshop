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
    console.log('📥 Sales API received:', body);

    const { items, totalAmount, customerName, customerPhone } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ Missing items array');
      return NextResponse.json(
        { message: 'Missing or invalid items array' },
        { status: 400 }
      );
    }

    if (totalAmount === undefined || totalAmount === null) {
      console.error('❌ Missing totalAmount');
      return NextResponse.json(
        { message: 'Missing totalAmount' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, saving to database');

    const conn = await connectDB();
    
    if (!conn) {
      console.log('📌 Recording sale in demo mode');
      const newSale = {
        _id: Date.now().toString(),
        items: items.map((item: any) => ({
          productId: item.productId || '',
          productName: item.productName || 'Unknown Product',
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || 0,
        })),
        totalAmount: parseFloat(totalAmount.toString()),
        customerName: customerName || 'Guest',
        customerPhone: customerPhone || 'N/A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demoSales.unshift(newSale);
      console.log('✅ Sale saved in demo mode:', newSale._id);
      return NextResponse.json(newSale, { status: 201 });
    }

    // Try to save to database
    try {
      const sale = new Sale({
        items: items.map((item: any) => ({
          productId: item.productId || '',
          productName: item.productName || 'Unknown Product',
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || 0,
        })),
        totalAmount: parseFloat(totalAmount.toString()),
        customerName: customerName || 'Guest',
        customerPhone: customerPhone || 'N/A',
      });

      const savedSale = await sale.save();
      console.log('✅ Sale saved to database:', savedSale._id);
      return NextResponse.json(savedSale, { status: 201 });
    } catch (dbError: any) {
      console.error('⚠️ Database save failed, falling back to demo mode:', dbError.message);
      // Fall back to demo mode if database fails
      const newSale = {
        _id: Date.now().toString(),
        items: items.map((item: any) => ({
          productId: item.productId || '',
          productName: item.productName || 'Unknown Product',
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || 0,
        })),
        totalAmount: parseFloat(totalAmount.toString()),
        customerName: customerName || 'Guest',
        customerPhone: customerPhone || 'N/A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demoSales.unshift(newSale);
      console.log('✅ Sale saved in fallback demo mode:', newSale._id);
      return NextResponse.json(newSale, { status: 201 });
    }
  } catch (error: any) {
    console.error('❌ Error creating sale:', error);
    return NextResponse.json(
      { message: 'Failed to create sale', error: error.message || 'Unknown error' },
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
