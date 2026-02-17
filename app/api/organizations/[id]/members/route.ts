import { NextRequest, NextResponse } from 'next/server';
import {
  getOrganizationMembers,
  addMemberToOrganization,
  updateMemberRole,
  removeMemberFromOrganization,
} from '@/lib/supabase';

/**
 * GET /api/organizations/[id]/members
 * Get all members of an organization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const members = await getOrganizationMembers(params.id);

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations/[id]/members
 * Add a member to organization
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: 'userId and role are required' },
        { status: 400 }
      );
    }

    const validRoles = ['owner', 'admin', 'accountant', 'member', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    const member = await addMemberToOrganization(params.id, userId, role);

    return NextResponse.json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    console.error('Error adding member:', error);

    // Handle duplicate member error
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'User is already a member' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add member' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizations/[id]/members
 * Update member role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: 'userId and role are required' },
        { status: 400 }
      );
    }

    const member = await updateMemberRole(params.id, userId, role);

    return NextResponse.json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[id]/members
 * Remove member from organization
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if user is the last owner
    const members = await getOrganizationMembers(params.id);
    const owners = members.filter((m: any) => m.role === 'owner');
    const memberToRemove = members.find((m: any) => m.users.id === userId);

    if (memberToRemove?.role === 'owner' && owners.length === 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove the last owner from organization' },
        { status: 400 }
      );
    }

    await removeMemberFromOrganization(params.id, userId);

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing member:', error);

    // Handle "cannot remove last owner" error
    if (error.message?.includes('last owner')) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove the last owner from organization' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
