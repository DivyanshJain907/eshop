import { NextRequest, NextResponse } from 'next/server';
import { autoDetectSelectors } from '@/lib/selector-detector';

// POST /api/compare/detect-selectors - Auto-detect CSS selectors from a website
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchUrl } = body;

    if (!searchUrl || searchUrl.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Search URL is required',
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Detecting selectors for: ${searchUrl}`);

    const detected = await autoDetectSelectors(searchUrl);

    if (detected && detected.confidence >= 50) {
      return NextResponse.json({
        success: true,
        selectors: {
          productContainer: detected.productContainer,
          productName: detected.productName,
          productPrice: detected.productPrice,
          productImage: detected.productImage,
          productUrl: detected.productUrl,
        },
        confidence: detected.confidence,
        message: 'Selectors detected successfully',
      });
    } else if (detected) {
      return NextResponse.json({
        success: true,
        selectors: {
          productContainer: detected.productContainer,
          productName: detected.productName,
          productPrice: detected.productPrice,
          productImage: detected.productImage,
          productUrl: detected.productUrl,
        },
        confidence: detected.confidence,
        message: 'Selectors detected with low confidence. Please verify.',
        warning: 'Low confidence detection',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Could not detect selectors automatically. Please enter them manually.',
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error detecting selectors:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to detect selectors',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
