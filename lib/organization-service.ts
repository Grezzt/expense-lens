import { supabase } from './supabase';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  invite_code?: string;
  invite_expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface OrganizationWithRole extends Organization {
  role: 'owner' | 'admin' | 'accountant' | 'member' | 'viewer';
  member_count?: number;
}

/**
 * Create a new organization
 */
export async function createOrganization(
  userId: string,
  name: string,
  slug: string,
  description?: string
): Promise<{ organization: Organization; error?: string }> {
  try {
    // Check if slug is already taken
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return { organization: null as any, error: 'Slug already taken' };
    }

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        description,
        created_by: userId,
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // Add creator as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: userId,
        role: 'owner',
      });

    if (memberError) throw memberError;

    return { organization: org };
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return { organization: null as any, error: error.message };
  }
}

/**
 * Join organization via invite code
 */
export async function joinOrganization(
  userId: string,
  inviteCode: string
): Promise<{ organization: Organization; role: string; error?: string }> {
  try {
    // Find organization by invite code
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (orgError || !org) {
      return { organization: null as any, role: '', error: 'Invalid invite code' };
    }

    // Check if invite code is expired
    if (org.invite_expires_at && new Date(org.invite_expires_at) < new Date()) {
      return { organization: null as any, role: '', error: 'Invite code has expired' };
    }

    // Check if user is already a member
    const { data: existing } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', org.id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return { organization: null as any, role: '', error: 'You are already a member of this organization' };
    }

    // Add user as member
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: userId,
        role: 'member',
      });

    if (memberError) throw memberError;

    return { organization: org, role: 'member' };
  } catch (error: any) {
    console.error('Error joining organization:', error);
    return { organization: null as any, role: '', error: error.message };
  }
}

/**
 * Get all organizations for a user
 */
export async function getUserOrganizations(userId: string): Promise<OrganizationWithRole[]> {
  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        role,
        organization:organizations (
          id,
          name,
          slug,
          description,
          invite_code,
          invite_expires_at,
          is_active,
          created_at
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    // Get member counts for each organization
    const orgsWithRole = await Promise.all(
      (data || []).map(async (item: any) => {
        const { count } = await supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', item.organization.id);

        return {
          ...item.organization,
          role: item.role,
          member_count: count || 0,
        };
      })
    );

    return orgsWithRole;
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    return [];
  }
}

/**
 * Generate new invite code for organization
 */
export async function regenerateInviteCode(
  orgId: string,
  userId: string
): Promise<{ invite_code: string; error?: string }> {
  try {
    // Check if user is owner or admin
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .single();

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return { invite_code: '', error: 'Only owners and admins can regenerate invite codes' };
    }

    // Generate new code (using database function)
    const { data, error } = await supabase.rpc('generate_invite_code');
    if (error) throw error;

    const newCode = data;

    // Update organization
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        invite_code: newCode,
        invite_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', orgId);

    if (updateError) throw updateError;

    return { invite_code: newCode };
  } catch (error: any) {
    console.error('Error regenerating invite code:', error);
    return { invite_code: '', error: error.message };
  }
}

/**
 * Leave organization
 */
export async function leaveOrganization(
  orgId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user is the last owner
    const { data: owners } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', orgId)
      .eq('role', 'owner');

    const { data: currentMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .single();

    if (currentMember?.role === 'owner' && owners && owners.length === 1) {
      return { success: false, error: 'Cannot leave as the last owner. Transfer ownership or delete the organization.' };
    }

    // Remove user from organization
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', orgId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error leaving organization:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete organization (owner only)
 */
export async function deleteOrganization(
  orgId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user is owner
    const { data: member } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .single();

    if (!member || member.role !== 'owner') {
      return { success: false, error: 'Only owners can delete organizations' };
    }

    // Delete organization (cascade will handle members and expenses)
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', orgId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
       if (error.code !== 'PGRST116') {
         console.error('Error fetching org by slug:', error);
       }
       return null;
    }

    return data as Organization;
  } catch (error) {
    console.error('Error in getOrganizationBySlug:', error);
    return null;
  }
}

/**
 * Check if user is a member of an organization
 */
export async function checkOrganizationMembership(
  userId: string,
  orgId: string
): Promise<{ role: string } | null> {
  try {
    const { data: member, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .single();

    if (error || !member) {
      return null;
    }

    return { role: member.role };
  } catch (error) {
    console.error('Error checking membership:', error);
    return null;
  }
}
