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

// GET /api/admin/mentorship/requests - List ALL mentorship requests
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const userIsAdmin = await isAdmin(user.uid);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status'); // Optional filter

    let requestsRef = adminDb.collection('mentorshipRequests');
    let snapshot;

    if (statusFilter && statusFilter !== 'all') {
      snapshot = await requestsRef.where('status', '==', statusFilter).get();
    } else {
      snapshot = await requestsRef.get();
    }
    
    const requests = [];
    snapshot.forEach(doc => {
      const data = doc.data();
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

    // Sort by date
    requests.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    // Populate user details for each request
    const populatedRequests = await Promise.all(requests.map(async (req) => {
      try {
        // Fetch Mentee Details
        let menteeData = { id: req.menteeId, firstName: 'Unknown', lastName: 'User' };
        if (req.menteeId) {
            const menteeDoc = await adminDb.collection('users').doc(req.menteeId).get();
            if (menteeDoc.exists) {
                const u = menteeDoc.data();
                menteeData = {
                    id: req.menteeId,
                    firstName: u.firstName || '',
                    lastName: u.lastName || '',
                    email: u.email || ''
                };
            }
        }

        // Fetch Mentor Details
        let mentorData = { id: req.mentorId, firstName: 'Unknown', lastName: 'Mentor' };
        if (req.mentorId) {
            const mentorUserDoc = await adminDb.collection('users').doc(req.mentorId).get();
            const mentorProfileDoc = await adminDb.collection('mentorProfiles').doc(req.mentorId).get();
            
            let userData = {};
            let profileData = {};

            if (mentorUserDoc.exists) userData = mentorUserDoc.data();
            if (mentorProfileDoc.exists) profileData = mentorProfileDoc.data();

            mentorData = {
                id: req.mentorId,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                position: profileData.position || '',
                company: profileData.company || ''
            };
        }

        return {
            ...req,
            mentee: menteeData,
            mentor: mentorData
        };
      } catch (err) {
        console.error('Error populating request details:', err);
        return req;
      }
    }));

    return NextResponse.json({ results: populatedRequests }, { status: 200 });
  } catch (error) {
    console.error('Error fetching mentorship requests:', error);
    return NextResponse.json({ error: 'Failed to fetch mentorship requests' }, { status: 500 });
  }
}
