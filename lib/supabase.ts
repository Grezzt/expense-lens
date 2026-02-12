import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  settings: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'accountant' | 'member' | 'viewer';
  joined_at: string;
}

export interface Expense {
  id: string;
  organization_id: string;
  created_by: string;
  image_url: string;
  merchant_name: string;
  amount: number;
  category: string;
  date: string;
  raw_data: Record<string, any>;
  status: 'DRAFT' | 'VERIFIED';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
}

// Database helper functions
export async function getAllExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Expense[];
}

export async function getExpenseById(id: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function updateExpense(id: string, updates: Partial<Expense>) {
  const { data, error } = await supabase
    .from('expenses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function getExpensesByStatus(status: 'DRAFT' | 'VERIFIED') {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Expense[];
}

// Category helper functions
export async function getAllCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Category[];
}

export async function getCategoryByName(name: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('name', name)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data as Category;
}

// ============================================
// USER FUNCTIONS
// ============================================

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as User;
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as User;
}

export async function createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

export async function updateUser(id: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

// ============================================
// ORGANIZATION FUNCTIONS
// ============================================

export async function createOrganization(
  name: string,
  slug: string,
  createdBy: string,
  description?: string,
  settings?: Record<string, any>
) {
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      name,
      slug,
      description,
      settings: settings || {},
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Organization;
}

export async function getOrganizationById(id: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Organization;
}

export async function getOrganizationBySlug(slug: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Organization;
}

export async function getUserOrganizations(userId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      role,
      joined_at,
      organizations (
        id,
        name,
        slug,
        description,
        settings,
        created_by,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateOrganization(id: string, updates: Partial<Organization>) {
  const { data, error } = await supabase
    .from('organizations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Organization;
}

export async function deleteOrganization(id: string) {
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// ============================================
// ORGANIZATION MEMBER FUNCTIONS
// ============================================

export async function addMemberToOrganization(
  organizationId: string,
  userId: string,
  role: OrganizationMember['role']
) {
  const { data, error } = await supabase
    .from('organization_members')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data as OrganizationMember;
}

export async function getOrganizationMembers(organizationId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      id,
      organization_id,
      user_id,
      role,
      joined_at,
      users (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('organization_id', organizationId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateMemberRole(
  organizationId: string,
  userId: string,
  role: OrganizationMember['role']
) {
  const { data, error } = await supabase
    .from('organization_members')
    .update({ role })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as OrganizationMember;
}

export async function removeMemberFromOrganization(
  organizationId: string,
  userId: string
) {
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}

export async function getUserRole(organizationId: string, userId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data.role as OrganizationMember['role'];
}

