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

    // Extract data using Gemini Vision
    const extractedData = await extractExpenseFromImage(imageUrl);

    // Validate and correct data
    const validatedData = validateExtractedData(extractedData);

    // Save to Supabase with DRAFT status
    const expense = await createExpense({
      image_url: imageUrl,
      merchant_name: validatedData.merchant_name,
      amount: validatedData.amount,
      category: validatedData.category,
      date: validatedData.date,
      status: 'DRAFT',
      raw_data: {
        ...validatedData,
        extracted_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      expense,
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
