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

// GET /api/events/[id] - Get single event
export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const eventDoc = await adminDb.collection('events').doc(id).get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = {
      id: eventDoc.id,
      ...eventDoc.data(),
      date: eventDoc.data().date?.toDate().toISOString(),
      createdAt: eventDoc.data().createdAt?.toDate().toISOString(),
      updatedAt: eventDoc.data().updatedAt?.toDate().toISOString(),
    };

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { eventName, date, eventType, location, description, imageUrl } = body;

    const eventRef = adminDb.collection('events').doc(id);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updateData = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (eventName) updateData.eventName = eventName;
    if (date) updateData.date = new Date(date);
    if (eventType) updateData.eventType = eventType;
    if (location) updateData.location = location;
    if (description) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    await eventRef.update(updateData);
    const updatedEvent = await eventRef.get();

    return NextResponse.json({
      message: 'Event updated successfully',
      event: {
        id: updatedEvent.id,
        ...updatedEvent.data(),
        date: updatedEvent.data().date?.toDate().toISOString(),
        createdAt: updatedEvent.data().createdAt?.toDate().toISOString(),
        updatedAt: updatedEvent.data().updatedAt?.toDate().toISOString(),
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const eventRef = adminDb.collection('events').doc(id);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await eventRef.delete();

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
