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

// PUT /api/admin/mentors/[id]/approve - Approve mentor application
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
    const applicationRef = adminDb.collection('mentorApplications').doc(id);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const applicationData = applicationDoc.data();

    // Create approved mentor document in 'mentors' collection using applicant's uid
    const mentorData = {
      uid: applicationData.uid,
      name: applicationData.name,
      email: applicationData.email,
      bio: applicationData.bio || '',
      skills: applicationData.skills || [],
      experience: applicationData.experience || 0,
      photoURL: applicationData.photoURL || '',
      capacity: applicationData.capacity || 3,
      company: applicationData.company || '',
      position: applicationData.position || '',
      linkedin_url: applicationData.linkedin_url || '',
      github_url: applicationData.github_url || '',
      portfolio_url: applicationData.portfolio_url || '',
      availability: applicationData.availability || {},
      currentMentees: 0,
      status: 'approved',
      approvedBy: user.uid,
      approvedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    };

    // Use applicant's uid as the mentor document ID
    await adminDb.collection('mentors').doc(applicationData.uid).set(mentorData);

    // Update the application status
    await applicationRef.update({
      status: 'approved',
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: user.uid,
    });

    return NextResponse.json({
      message: 'Mentor approved successfully',
      mentorId: applicationData.uid,
    }, { status: 200 });
  } catch (error) {
    console.error('Error approving mentor:', error);
    return NextResponse.json({ error: 'Failed to approve mentor' }, { status: 500 });
  }
}
