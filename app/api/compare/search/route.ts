import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { scrapeAllCompetitors } from '@/lib/scraper';

export const runtime = 'nodejs';
export const maxDuration = 120;

// POST /api/compare/search - Search and compare products across competitors
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { productName } = body;

    if (!productName || productName.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product name is required',
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Starting product comparison for: "${productName}"`);

    // Scrape all competitors
    const startTime = Date.now();
    const results = await scrapeAllCompetitors(productName);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ Comparison completed in ${duration}s - Found ${results.length} products`);

    // Sort by price (lowest first)
    const sortedResults = results.sort((a, b) => a.price - b.price);

    return NextResponse.json({
      success: true,
      productName,
      results: sortedResults,
      totalResults: sortedResults.length,
      duration: `${duration}s`,
    });
  } catch (error: any) {
    console.error('Error comparing products:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to compare products',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
