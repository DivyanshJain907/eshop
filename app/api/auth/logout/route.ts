import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // Clear the token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 0,
      path: '/', // Ensure cookie is cleared on all paths
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error logging out', error: error.message },
      { status: 500 }
    );
  }
}
