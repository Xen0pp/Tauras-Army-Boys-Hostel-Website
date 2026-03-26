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

// GET /api/registration-requests/[id] - Get request detail (Admin)
export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const requestDoc = await adminDb.collection('registrationRequests').doc(id).get();

    if (!requestDoc.exists) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      request: {
        id: requestDoc.id,
        ...requestDoc.data(),
        createdAt: requestDoc.data().createdAt?.toDate().toISOString(),
        updatedAt: requestDoc.data().updatedAt?.toDate().toISOString(),
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching registration request:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// PUT /api/registration-requests/[id] - Approve/Reject request (Admin)
export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { isApproved, rejectionReason } = body;

    const requestRef = adminDb.collection('registrationRequests').doc(id);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await requestRef.update({
      isApproved: isApproved,
      rejectionReason: rejectionReason || '',
      updatedAt: FieldValue.serverTimestamp(),
    });

    // If approved, you might want to create a user account or send an email here
    
    return NextResponse.json({ message: 'Request updated' }, { status: 200 });
  } catch (error) {
    console.error('Error updating registration request:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
