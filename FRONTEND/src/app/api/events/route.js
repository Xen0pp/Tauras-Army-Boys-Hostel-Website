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



// GET /api/events - List all events
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventsRef = adminDb.collection('events');
    const snapshot = await eventsRef.orderBy('date', 'desc').get();
    
    const dbEvents = [];
    snapshot.forEach(doc => {
      dbEvents.push({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate().toISOString(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      });
    });

    // Return only db events
    const allEvents = [...dbEvents];

    return NextResponse.json({ results: allEvents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/events - Create new event
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin check
    if (user.email !== 'mohitkumarbiswas9@gmail.com') {
      return NextResponse.json({ error: 'Forbidden: Only admin can create events' }, { status: 403 });
    }

    const body = await request.json();
    const { eventName, date, eventType, location, description, imageUrl } = body;

    if (!eventName || !date || !location || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newEvent = {
      eventName,
      date: new Date(date),
      eventType: eventType || 'General',
      location,
      description,
      imageUrl: imageUrl || '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: user.uid,
    };

    const docRef = await adminDb.collection('events').add(newEvent);
    const createdEvent = await docRef.get();

    return NextResponse.json({
      message: 'Event created successfully',
      event: {
        id: docRef.id,
        ...createdEvent.data(),
        date: createdEvent.data().date?.toDate().toISOString(),
        createdAt: createdEvent.data().createdAt?.toDate().toISOString(),
        updatedAt: createdEvent.data().updatedAt?.toDate().toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
