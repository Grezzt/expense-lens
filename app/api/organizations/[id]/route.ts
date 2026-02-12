import { NextRequest, NextResponse } from 'next/server';
import {
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from '@/lib/supabase';

/**
 * GET /api/organizations/[id]
 * Get organization details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organization = await getOrganizationById(params.id);

    return NextResponse.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { success: false, error: 'Organization not found' },
      { status: 404 }
    );
  }
}

/**
 * PATCH /api/organizations/[id]
 * Update organization details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, settings } = body;

    const updates: any = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (settings) updates.settings = settings;

    const organization = await updateOrganization(params.id, updates);

    return NextResponse.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[id]
 * Delete organization
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteOrganization(params.id);

    return NextResponse.json({
      success: true,
      message: 'Organization deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
