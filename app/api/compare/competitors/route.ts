import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import CompetitorConfig from '@/lib/models/CompetitorConfig';

// GET /api/compare/competitors - Get all competitor configurations
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const competitors = await CompetitorConfig.find().sort({ name: 1 });

    return NextResponse.json({
      success: true,
      competitors,
    });
  } catch (error: any) {
    console.error('Error fetching competitors:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch competitor configurations',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/compare/competitors - Create or update competitor configuration
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, baseUrl, searchUrl, selectors, maxResults, timeout, isActive } = body;

    if (!name || !baseUrl || !searchUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, baseUrl, and searchUrl are required',
        },
        { status: 400 }
      );
    }

    // Update or create competitor config
    const competitor = await CompetitorConfig.findOneAndUpdate(
      { name },
      {
        name,
        baseUrl,
        searchUrl,
        selectors: selectors || {
          productContainer: '.product-item',
          productName: '.product-name',
          productPrice: '.product-price',
          productImage: '.product-image img',
          productUrl: '.product-link',
        },
        maxResults: maxResults || 10,
        timeout: timeout || 30000,
        isActive: isActive !== undefined ? isActive : true,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Competitor configuration saved successfully',
      competitor,
    });
  } catch (error: any) {
    console.error('Error saving competitor config:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save competitor configuration',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/compare/competitors - Delete competitor configuration
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Competitor ID is required',
        },
        { status: 400 }
      );
    }

    await CompetitorConfig.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Competitor deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting competitor:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete competitor',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
