import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/supabase';

/**
 * POST /api/users
 * Create a new user or get existing user by email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, full_name, avatar_url } = body;

    if (!email || !full_name) {
      return NextResponse.json(
        { success: false, error: 'Email and full_name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: true,
        data: existingUser,
        message: 'User already exists',
      });
    }

    // Create new user
    const user = await createUser({
      email,
      full_name,
      avatar_url,
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
