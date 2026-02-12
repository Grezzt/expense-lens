import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const base64 = formData.get('base64') as string;

    if (!file && !base64) {
      return NextResponse.json(
        { error: 'No file or base64 image provided' },
        { status: 400 }
      );
    }

    const result = await uploadImage(file || base64);

    return NextResponse.json({
      success: true,
      imageUrl: result.public_url,
      path: result.path,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
