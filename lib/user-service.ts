import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  invite_code?: string;
}

export interface OrganizationMember {
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'accountant' | 'member' | 'viewer';
  organization: Organization;
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Get user's organizations and their role
 */
export async function getUserOrganizations(userId: string): Promise<OrganizationMember[]> {
  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        user_id,
        role,
        organization:organizations (
          id,
          name,
          slug,
          description,
          invite_code
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map((member: any) => ({
      organization_id: member.organization_id,
      user_id: member.user_id,
      role: member.role,
      organization: member.organization,
    }));
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    return [];
  }
}

/**
 * Get user's role in a specific organization
 */
export async function getUserRole(
  userId: string,
  orgId: string
): Promise<'owner' | 'admin' | 'accountant' | 'member' | 'viewer' | null> {
  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .single();

    if (error) throw error;
    return data?.role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

/**
 * Create a new organization and add creator as owner
 */
export async function createOrganization(
  userId: string,
  name: string,
  slug: string,
  description?: string
): Promise<Organization | null> {
  try {
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

    return org;
  } catch (error) {
    console.error('Error creating organization:', error);
    return null;
  }
}

/**
 * Initialize user data after login
 * Returns user profile and organizations (NO auto-create)
 */
export async function initializeUserData(userId: string) {
  try {
    // Fetch user profile and organizations in parallel
    const [profile, orgMembers] = await Promise.all([
      getUserProfile(userId),
      getUserOrganizations(userId),
    ]);

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Return organizations without auto-creating
    const organizations = orgMembers.map(m => m.organization);

    return {
      user: profile,
      organizations,
    };
  } catch (error) {
    console.error('Error initializing user data:', error);
    throw error;
  }
}
