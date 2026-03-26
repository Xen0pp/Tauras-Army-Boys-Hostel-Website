import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

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

// GET /api/mentorship/mentors - List all approved mentors
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch from 'mentors' collection (approved only)
    const mentorsRef = adminDb.collection('mentors');
    const snapshot = await mentorsRef.where('status', '==', 'approved').get();
    
    const mentors = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        user: {
          firstName: data.name?.split(' ')[0] || '',
          lastName: data.name?.split(' ').slice(1).join(' ') || '',
          avatar: data.photoURL || '',
        },
        // Map field names for UI compatibility
        expertise: data.skills || data.expertise || [],
        yearsOfExperience: data.experience || data.yearsOfExperience || 0,
        company: data.company || '',
        position: data.position || '',
        bio: data.bio || '',
        mentoring_capacity: data.capacity || data.mentoring_capacity || 3,
        active_mentees_count: data.currentMentees || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      };
    });

    return NextResponse.json({ results: mentors }, { status: 200 });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json({ error: 'Failed to fetch mentors' }, { status: 500 });
  }
}

// POST /api/mentorship/mentors - Submit mentor application (writes to mentorApplications)
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      expertise_areas,
      years_experience,
      current_company,
      current_position,
      mentoring_capacity,
      bio,
      linkedin_url,
      github_url,
      portfolio_url,
      availability,
    } = body;

    // Check if user already has a pending application
    const existingApplication = await adminDb
      .collection('mentorApplications')
      .where('uid', '==', user.uid)
      .where('status', '==', 'pending')
      .get();

    if (!existingApplication.empty) {
      return NextResponse.json(
        { error: 'You already have a pending mentor application' },
        { status: 409 }
      );
    }

    // Get user info for display in application
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const fullName = userData.firstName && userData.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : user.displayName || '';

    const applicationData = {
      uid: user.uid,
      name: fullName,
      email: user.email || userData.email || '',
      bio: bio || '',
      skills: expertise_areas || [],
      experience: parseInt(years_experience) || 0,
      photoURL: user.photoURL || userData.avatar || '',
      capacity: parseInt(mentoring_capacity) || 3,
      company: current_company || '',
      position: current_position || '',
      linkedin_url: linkedin_url || '',
      github_url: github_url || '',
      portfolio_url: portfolio_url || '',
      availability: availability || {},
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('mentorApplications').add(applicationData);

    return NextResponse.json({
      message: 'Application submitted successfully! Our admin team will review and respond within 2-3 business days.',
      applicationId: docRef.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting mentor application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
