import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
      // Note: App state initialization will happen on client side
      // via the dashboard page's useEffect when it detects authenticated user
    } catch (error) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }
  }

  // Redirect to dashboard after OAuth callback
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
