import { NextRequest, NextResponse } from 'next/server';
import {
  getUserOrganizations,
  createOrganization,
  addMemberToOrganization,
} from '@/lib/supabase';

/**
 * GET /api/organizations
 * Get all organizations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from auth session
    // For now, we'll expect it from query params for testing
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const organizations = await getUserOrganizations(userId);

    return NextResponse.json({
      success: true,
      data: organizations,
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, settings, userId } = body;

    if (!name || !slug || !userId) {
      return NextResponse.json(
        { success: false, error: 'Name, slug, and userId are required' },
        { status: 400 }
      );
    }

    // Create organization
    const organization = await createOrganization(
      name,
      slug,
      userId,
      description,
      settings
    );

    // Add creator as owner
    await addMemberToOrganization(organization.id, userId, 'owner');

    return NextResponse.json({
      success: true,
      data: organization,
    });
  } catch (error: any) {
    console.error('Error creating organization:', error);

    // Handle duplicate slug error
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Organization slug already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
