import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
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

// GET /api/admin/mentors/pending - List pending mentor applications
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const userIsAdmin = await isAdmin(user.uid, user.email);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const mentorsRef = adminDb.collection('mentorApplications');
    const snapshot = await mentorsRef
      .where('status', '==', 'pending')
      .get();
    
    const pendingMentors = snapshot.docs.map((mentorDoc) => {
      const mentorData = mentorDoc.data();
      return {
        id: mentorDoc.id,
        ...mentorData,
        user: {
          firstName: mentorData.name?.split(' ')[0] || '',
          lastName: mentorData.name?.split(' ').slice(1).join(' ') || '',
          email: mentorData.email || '',
          avatar: mentorData.photoURL || '',
        },
        // UI compatibility fields
        expertise: mentorData.skills || [],
        yearsOfExperience: mentorData.experience || 0,
        mentoring_capacity: mentorData.capacity || 3,
        createdAt: mentorData.createdAt?.toDate?.()?.toISOString() || mentorData.createdAt,
      };
    });

    return NextResponse.json({ results: pendingMentors }, { status: 200 });
  } catch (error) {
    console.error('Error fetching pending mentors:', error);
    return NextResponse.json({ error: 'Failed to fetch pending mentors' }, { status: 500 });
  }
}
