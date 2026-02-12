import { NextRequest, NextResponse } from 'next/server';
import { processReceiptUpload } from '@/lib/expense-service';

/**
 * POST /api/expenses/process
 * Upload receipt image and process with AI extraction
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const base64 = formData.get('base64') as string;
    const organizationId = formData.get('organizationId') as string;
    const userId = formData.get('userId') as string;

    // Validation
    if (!file && !base64) {
      return NextResponse.json(
        { success: false, error: 'No file or base64 image provided' },
        { status: 400 }
      );
    }

    if (!organizationId || !userId) {
      return NextResponse.json(
        { success: false, error: 'organizationId and userId are required' },
        { status: 400 }
      );
    }

    // Process receipt with AI
    const result = await processReceiptUpload(
      file || base64,
      organizationId,
      userId
    );

    return NextResponse.json({
      success: true,
      expense: result.expense,
      extractedData: result.extractedData,
    });
  } catch (error) {
    console.error('Process receipt error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process receipt' },
      { status: 500 }
    );
  }
}
