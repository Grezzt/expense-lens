import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/supabase';

/**
 * GET /api/categories
 * Get all expense categories
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await getAllCategories();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
