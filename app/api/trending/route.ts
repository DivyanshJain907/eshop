import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Product from '@/lib/models/Product';
import Sale from '@/lib/models/Sale';

// Ensure database is connected
async function ensureDbConnection() {
  if (mongoose.connection.readyState !== 1) {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDbConnection();

    // Get top 4 selling products from each category
    const topSales = await Sale.aggregate([
      {
        $group: {
          _id: '$productId',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
      {
        $limit: 100, // Get top 100 to filter by category later
      },
    ]);

    // Extract product IDs
    const topProductIds = topSales.map(sale => new mongoose.Types.ObjectId(sale._id));

    // Fetch product details with categories
    const topProducts = (await Product.find({ _id: { $in: topProductIds } })
      .select('_id name price quantity image images category retailDiscount discount superDiscount')
      .lean()) as any[];

    // Add sales metrics
    const productsWithMetrics = topProducts.map((product: any) => {
      const saleData = topSales.find(s => s._id.toString() === product._id.toString());
      return {
        ...product,
        _id: product._id.toString(),
        soldQuantity: saleData?.totalQuantity || 0,
        revenue: saleData?.totalRevenue || 0,
      };
    });

    // Group by category and get top 4 per category
    const trendingByCategory: { [key: string]: any[] } = {};
    
    for (const product of productsWithMetrics) {
      const cat = (product.category as string) || 'Uncategorized';
      if (!trendingByCategory[cat]) {
        trendingByCategory[cat] = [];
      }
      if (trendingByCategory[cat].length < 4) {
        trendingByCategory[cat].push(product);
      }
    }

    return NextResponse.json({
      success: true,
      trendingByCategory,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending products' },
      { status: 500 }
    );
  }
}
