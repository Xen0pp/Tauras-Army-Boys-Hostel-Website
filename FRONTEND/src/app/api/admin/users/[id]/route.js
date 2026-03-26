import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { isAdmin, removeAdmin } from '@/lib/auth';

async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// DELETE /api/admin/users/[id] - Remove admin access
export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if requester is admin
    const userIsAdmin = await isAdmin(user.uid);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = params;
    
    await removeAdmin(id, user.uid);

    return NextResponse.json({ 
      message: 'Admin access removed successfully',
      userId: id 
    }, { status: 200 });
  } catch (error) {
    console.error('Error removing admin:', error);
    return NextResponse.json({ error: error.message || 'Failed to remove admin' }, { status: 500 });
  }
}
