import { NextRequest, NextResponse } from 'next/server';
import { extractExpenseFromImage, validateExtractedData } from '@/lib/langchain';
import { createExpense } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    // Extract data using AI
    const extractedData = await extractExpenseFromImage(imageUrl);

    // Validate and correct data
    const validatedData = validateExtractedData(extractedData);

    // Return extracted data directly (Frontend will handle saving)
    return NextResponse.json({
      success: true,
      extractedData: validatedData,
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract expense data' },
      { status: 500 }
    );
  }
}
