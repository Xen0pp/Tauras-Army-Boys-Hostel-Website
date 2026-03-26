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

// GET /api/mentorship/sessions - List sessions
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'mentor' or 'mentee'

    let sessionsRef = adminDb.collection('mentorshipSessions');
    let snapshot;

    if (role === 'mentor') {
      snapshot = await sessionsRef.where('mentorId', '==', user.uid).orderBy('scheduledDate', 'desc').get();
    } else {
      snapshot = await sessionsRef.where('menteeId', '==', user.uid).orderBy('scheduledDate', 'desc').get();
    }
    
    const sessions = [];
    snapshot.forEach(doc => {
      sessions.push({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate().toISOString(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
      });
    });

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST /api/mentorship/sessions - Create session
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, mentorId, menteeId, scheduledDate, duration, notes } = body;

    const newSession = {
      requestId,
      mentorId,
      menteeId,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 60,
      notes: notes || '',
      status: 'scheduled',
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('mentorshipSessions').add(newSession);
    const createdDoc = await docRef.get();

    return NextResponse.json({
      message: 'Mentorship session scheduled',
      session: {
        id: docRef.id,
        ...createdDoc.data(),
        scheduledDate: createdDoc.data().scheduledDate?.toDate().toISOString(),
        createdAt: createdDoc.data().createdAt?.toDate().toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
