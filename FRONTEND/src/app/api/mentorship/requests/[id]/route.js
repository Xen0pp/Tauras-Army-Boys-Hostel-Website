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

// GET /api/mentorship/requests/[id] - Get specific request
export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const requestDoc = await adminDb.collection('mentorshipRequests').doc(id).get();

    if (!requestDoc.exists) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const data = requestDoc.data();
    if (data.mentorId !== user.uid && data.menteeId !== user.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      request: {
        id: requestDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching mentorship request:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// PUT /api/mentorship/requests/[id] - Update request status (Accept/Decline)
export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    const requestRef = adminDb.collection('mentorshipRequests').doc(id);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const data = requestDoc.data();
    const mentorId = data.mentorUid || data.mentorId;
    const menteeId = data.menteeUid || data.menteeId;

    // Only the mentor can accept/reject requests
    if (mentorId !== user.uid) {
      return NextResponse.json(
        { error: 'Forbidden: Only the mentor can update request status' },
        { status: 403 }
      );
    }

    const updateData = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    };

    let conversationId = null;

    // When accepting, auto-create a conversation
    if (status === 'accepted') {
      // Check for existing conversation
      const existingConv = await adminDb.collection('conversations')
        .where('mentorUid', '==', mentorId)
        .where('menteeUid', '==', menteeId)
        .get();

      if (!existingConv.empty) {
        conversationId = existingConv.docs[0].id;
      } else {
        // Get name data
        const [mentorDoc, menteeDoc] = await Promise.all([
          adminDb.collection('mentors').doc(mentorId).get(),
          adminDb.collection('users').doc(menteeId).get(),
        ]);
        const mentorData = mentorDoc.exists ? mentorDoc.data() : {};
        const menteeData = menteeDoc.exists ? menteeDoc.data() : {};

        const convRef = await adminDb.collection('conversations').add({
          mentorUid: mentorId,
          menteeUid: menteeId,
          mentorName: mentorData.name || '',
          menteeName: menteeData.firstName
            ? `${menteeData.firstName} ${menteeData.lastName || ''}`.trim()
            : '',
          requestId: id,
          createdAt: FieldValue.serverTimestamp(),
          lastMessage: null,
          lastMessageAt: null,
        });
        conversationId = convRef.id;
      }
      updateData.conversationId = conversationId;
    }

    await requestRef.update(updateData);

    return NextResponse.json({
      message: `Request ${status}`,
      conversationId,
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating mentorship request:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
