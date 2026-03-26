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

// GET /api/mentorship/messages?conversationId=xxx - Fetch messages for a conversation
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    // Verify user is part of this conversation
    const convDoc = await adminDb.collection('conversations').doc(conversationId).get();
    if (!convDoc.exists) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const convData = convDoc.data();
    if (convData.mentorUid !== user.uid && convData.menteeUid !== user.uid) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const snapshot = await adminDb.collection('messages')
      .where('conversationId', '==', conversationId)
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    // Sort in memory (ascending by time)
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return NextResponse.json({ results: messages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/mentorship/messages - Send a message
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { conversationId, text } = await request.json();

    if (!conversationId || !text?.trim()) {
      return NextResponse.json({ error: 'conversationId and text are required' }, { status: 400 });
    }

    // Verify conversation exists and user is a participant
    const convDoc = await adminDb.collection('conversations').doc(conversationId).get();
    if (!convDoc.exists) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const convData = convDoc.data();
    if (convData.mentorUid !== user.uid && convData.menteeUid !== user.uid) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const messageData = {
      conversationId,
      senderUid: user.uid,
      text: text.trim(),
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('messages').add(messageData);

    // Update the conversation's last message
    await adminDb.collection('conversations').doc(conversationId).update({
      lastMessage: text.trim(),
      lastMessageAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: docRef.id,
      ...messageData,
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
