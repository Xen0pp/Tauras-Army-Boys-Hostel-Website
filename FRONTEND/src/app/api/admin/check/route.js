import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { isAdmin, isAdminByEmail } from '@/lib/auth';

// Hardcoded admin email as the ultimate fallback
// (same email the sidebar already uses for admin visibility)
const ADMIN_EMAILS = ['mohitkumarbiswas9@gmail.com', 'taurusarmyboyshostel@gmail.com'];

async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split('Bearer ')[1];
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// GET /api/admin/check - Check if user is admin
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', isAdmin: false }, { status: 401 });
    }

    // Check 1: Firestore admins collection by UID
    const adminByUid = await isAdmin(user.uid);
    if (adminByUid) {
      return NextResponse.json({ isAdmin: true }, { status: 200 });
    }

    // Check 2: Firestore admins collection by email
    if (user.email) {
      const adminByEmail = await isAdminByEmail(user.email);
      if (adminByEmail) {
        return NextResponse.json({ isAdmin: true }, { status: 200 });
      }

      // Check 3: Hardcoded email fallback (bootstrap admin)
      if (ADMIN_EMAILS.includes(user.email)) {
        return NextResponse.json({ isAdmin: true }, { status: 200 });
      }
    }

    return NextResponse.json({ isAdmin: false }, { status: 200 });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ error: 'Failed to check admin status', isAdmin: false }, { status: 500 });
  }
}
