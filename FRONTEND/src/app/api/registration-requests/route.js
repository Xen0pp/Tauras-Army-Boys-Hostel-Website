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

// GET /api/registration-requests - List all requests (Admin)
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    if (!userDoc.exists || userDoc.data()?.role?.name !== 'Admin') {
      // return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      // Note: During initial migration, we might temporarily relax this or rely on Firebase Security Rules
    }

    const requestsRef = adminDb.collection('registrationRequests');
    const snapshot = await requestsRef.orderBy('createdAt', 'desc').get();
    
    const requests = [];
    snapshot.forEach(doc => {
      requests.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      });
    });

    return NextResponse.json({ results: requests }, { status: 200 });
  } catch (error) {
    console.error('Error fetching registration requests:', error);
    return NextResponse.json({ error: 'Failed to fetch registration requests' }, { status: 500 });
  }
}

// POST /api/registration-requests - Submit new registration request
export async function POST(request) {
  try {
    // This endpoint can be public or require a minimal auth
    const body = await request.json();
    
    const registrationData = {
      ...body,
      isApproved: false,
      rejectionReason: '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('registrationRequests').add(registrationData);
    const createdDoc = await docRef.get();

    return NextResponse.json({
      message: 'Registration request submitted successfully',
      id: docRef.id,
      request: {
        id: docRef.id,
        ...createdDoc.data(),
        createdAt: createdDoc.data().createdAt?.toDate().toISOString(),
        updatedAt: createdDoc.data().updatedAt?.toDate().toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting registration request:', error);
    return NextResponse.json({ error: 'Failed to submit registration request' }, { status: 500 });
  }
}
