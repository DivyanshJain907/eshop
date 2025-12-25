import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import DirectSale from '@/lib/models/DirectSale';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobileNumber = searchParams.get('mobileNumber');

    console.log('🔍 Checking mobile number:', mobileNumber);

    if (!mobileNumber) {
      return NextResponse.json(
        { message: 'Mobile number is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // First check User collection for registered customers
    let customer = await User.findOne({ 
      phone: mobileNumber,
      role: 'customer'
    }).select('name phone');

    console.log('📱 User check result:', customer);

    // If not found in User collection, check DirectSale collection for previous sales
    if (!customer) {
      const lastSale = await DirectSale.findOne({
        customerMobile: mobileNumber
      }).select('customerName customerMobile').sort({ createdAt: -1 });

      console.log('💳 DirectSale check result:', lastSale);

      if (lastSale) {
        customer = {
          name: lastSale.customerName,
          phone: lastSale.customerMobile,
        };
      }
    }

    if (customer) {
      console.log('✅ Customer found:', customer);
      return NextResponse.json({
        exists: true,
        customer: {
          name: customer.name || customer.customerName,
          phone: customer.phone || customer.customerMobile,
        }
      }, { status: 200 });
    }

    console.log('❌ No customer found');
    return NextResponse.json({
      exists: false,
      customer: null
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Check mobile error:', error);
    return NextResponse.json(
      { message: 'Error checking mobile number', error: error.message },
      { status: 500 }
    );
  }
}
