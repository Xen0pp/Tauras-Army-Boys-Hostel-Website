import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split('Bearer ')[1];
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

// GET /api/mentorship/conversations - List conversations for current user
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch as mentor
    const asMentorSnap = await adminDb.collection('conversations')
      .where('mentorUid', '==', user.uid).get();
    // Fetch as mentee
    const asMenteeSnap = await adminDb.collection('conversations')
      .where('menteeUid', '==', user.uid).get();

    const seen = new Set();
    const conversations = [];

    for (const doc of [...asMentorSnap.docs, ...asMenteeSnap.docs]) {
      if (seen.has(doc.id)) continue;
      seen.add(doc.id);
      const data = doc.data();
      conversations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      });
    }

    return NextResponse.json({ results: conversations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST /api/mentorship/conversations - Create conversation (called when mentor accepts request)
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { mentorUid, menteeUid, requestId } = await request.json();

    if (!mentorUid || !menteeUid) {
      return NextResponse.json({ error: 'mentorUid and menteeUid are required' }, { status: 400 });
    }

    // Only the mentor (or admin) can create a conversation
    if (user.uid !== mentorUid) {
      return NextResponse.json({ error: 'Only the mentor can accept requests' }, { status: 403 });
    }

    // Check for existing conversation
    const existing = await adminDb.collection('conversations')
      .where('mentorUid', '==', mentorUid)
      .where('menteeUid', '==', menteeUid)
      .get();

    if (!existing.empty) {
      const doc = existing.docs[0];
      return NextResponse.json({ id: doc.id, ...doc.data() }, { status: 200 });
    }

    // Get mentor and mentee names
    const [mentorDoc, menteeDoc] = await Promise.all([
      adminDb.collection('mentors').doc(mentorUid).get(),
      adminDb.collection('users').doc(menteeUid).get(),
    ]);

    const mentorData = mentorDoc.exists ? mentorDoc.data() : {};
    const menteeData = menteeDoc.exists ? menteeDoc.data() : {};

    const conversationData = {
      mentorUid,
      menteeUid,
      mentorName: mentorData.name || '',
      menteeName: menteeData.firstName
        ? `${menteeData.firstName} ${menteeData.lastName || ''}`.trim()
        : '',
      requestId: requestId || null,
      createdAt: FieldValue.serverTimestamp(),
      lastMessage: null,
      lastMessageAt: null,
    };

    const docRef = await adminDb.collection('conversations').add(conversationData);

    // Update the mentorship request status if requestId provided
    if (requestId) {
      await adminDb.collection('mentorshipRequests').doc(requestId).update({
        status: 'accepted',
        conversationId: docRef.id,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      message: 'Conversation created',
      id: docRef.id,
      conversationId: docRef.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
