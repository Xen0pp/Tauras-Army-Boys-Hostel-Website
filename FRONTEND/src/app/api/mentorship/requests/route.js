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

// GET /api/mentorship/requests - List requests (for mentor or mentee)
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'mentor' or 'mentee'

    let requestsRef = adminDb.collection('mentorshipRequests');
    let snapshot;

    // Removed orderBy to avoid Firestore index requirement
    if (type === 'mentor') {
      snapshot = await requestsRef.where('mentorId', '==', user.uid).get();
    } else {
      snapshot = await requestsRef.where('menteeId', '==', user.uid).get();
    }
    
    const requests = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Safe timestamp conversion
      const getIsoString = (timestamp) => {
        if (!timestamp) return new Date().toISOString();
        if (typeof timestamp === 'string') return timestamp;
        if (timestamp.toDate) return timestamp.toDate().toISOString();
        return new Date().toISOString(); 
      };

      requests.push({
        id: doc.id,
        ...data,
        createdAt: getIsoString(data.createdAt),
        updatedAt: getIsoString(data.updatedAt),
      });
    });

    // Sort in memory
    requests.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA; // Descending order
    });

    // Populate user details for each request
    const populatedRequests = await Promise.all(requests.map(async (req) => {
      try {
        // Fetch Mentee Details (User)
        let menteeData = { id: req.menteeId, firstName: 'Unknown', lastName: 'User' };
        if (req.menteeId) {
            const menteeDoc = await adminDb.collection('users').doc(req.menteeId).get();
            if (menteeDoc.exists) {
                const u = menteeDoc.data();
                menteeData = {
                    id: req.menteeId,
                    firstName: u.firstName || '',
                    lastName: u.lastName || '',
                    avatar: u.avatar || '',
                    email: u.email || ''
                };
            }
        }

        // Fetch Mentor Details (User + Profile)
        let mentorData = { id: req.mentorId, firstName: 'Unknown', lastName: 'Mentor' };
        if (req.mentorId) {
            // Get User data
            const mentorUserDoc = await adminDb.collection('users').doc(req.mentorId).get();
            // Get Mentor Profile data
            const mentorProfileDoc = await adminDb.collection('mentorProfiles').doc(req.mentorId).get();
            
            let userData = {};
            let profileData = {};

            if (mentorUserDoc.exists) userData = mentorUserDoc.data();
            if (mentorProfileDoc.exists) profileData = mentorProfileDoc.data();

            mentorData = {
                id: req.mentorId,
                user: {
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    avatar: userData.avatar || ''
                },
                position: profileData.position || '',
                company: profileData.company || ''
            };
        }

        return {
            ...req,
            mentee: {
                id: menteeData.id,
                user: {
                    firstName: menteeData.firstName,
                    lastName: menteeData.lastName,
                    avatar: menteeData.avatar
                }
            }, // Format to match MentorshipCard expectation
            mentor: mentorData
        };
      } catch (err) {
        console.error('Error populating request details:', err);
        return req; // Return original if fetch fails
      }
    }));

    return NextResponse.json({ results: populatedRequests }, { status: 200 });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST /api/mentorship/requests - Create new mentorship request
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mentorId, mentorUid, topic, message } = body;
    const resolvedMentorId = mentorId || mentorUid;

    if (!resolvedMentorId) {
      return NextResponse.json({ error: 'Mentor ID is required' }, { status: 400 });
    }

    // Prevent self-request
    if (resolvedMentorId === user.uid) {
      return NextResponse.json({ error: 'You cannot request mentorship from yourself' }, { status: 400 });
    }

    // Check for existing pending or accepted request
    const existingSnapshot = await adminDb
      .collection('mentorshipRequests')
      .where('menteeUid', '==', user.uid)
      .where('mentorUid', '==', resolvedMentorId)
      .where('status', 'in', ['pending', 'accepted'])
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: 'You already have an active request with this mentor' },
        { status: 409 }
      );
    }

    const newRequest = {
      menteeUid: user.uid,
      mentorUid: resolvedMentorId,
      // Keep legacy fields for backward compat
      menteeId: user.uid,
      mentorId: resolvedMentorId,
      topic: topic || 'General Mentorship',
      message: message || '',
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('mentorshipRequests').add(newRequest);

    return NextResponse.json({
      message: 'Mentorship request submitted! The mentor will review your request.',
      request: {
        id: docRef.id,
        ...newRequest,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
