import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { isAdmin } from '@/lib/auth';

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

// PUT /api/admin/mentors/[id]/reject - Reject mentor application
export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userIsAdmin = await isAdmin(user.uid, user.email);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = params;
    let reason = '';
    try {
      const body = await request.json();
      reason = body.reason || '';
    } catch (_) {}

    const applicationRef = adminDb.collection('mentorApplications').doc(id);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    await applicationRef.update({
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: FieldValue.serverTimestamp(),
      rejectedBy: user.uid,
    });

    return NextResponse.json({
      message: 'Mentor application rejected',
      applicationId: id,
    }, { status: 200 });
  } catch (error) {
    console.error('Error rejecting mentor:', error);
    return NextResponse.json({ error: 'Failed to reject mentor' }, { status: 500 });
  }
}
