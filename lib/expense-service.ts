import { uploadImage } from './storage';
import { extractExpenseFromImage, validateExtractedData } from './langchain';
import { createExpense } from './supabase';

/**
 * Service untuk handle upload dan AI extraction
 */
export async function processReceiptUpload(fileOrBase64: File | string) {
  try {
    // Step 1: Upload to Supabase Storage
    const uploadResult = await uploadImage(fileOrBase64);

    // Step 2: Extract data using Gemini Vision
    const extractedData = await extractExpenseFromImage(uploadResult.public_url);

    // Step 3: Validate and correct data
    const validatedData = validateExtractedData(extractedData);

    // Step 4: Save to Supabase with DRAFT status
    const expense = await createExpense({
      image_url: uploadResult.public_url,
      merchant_name: validatedData.merchant_name,
      amount: validatedData.amount,
      category: validatedData.category,
      date: validatedData.date,
      status: 'DRAFT',
      raw_data: {
        ...validatedData,
        extracted_at: new Date().toISOString(),
        storage_path: uploadResult.path,
      },
    });

    return {
      success: true,
      expense,
      extractedData: validatedData,
    };
  } catch (error) {
    console.error('Process receipt error:', error);
    throw new Error('Failed to process receipt');
  }
}
