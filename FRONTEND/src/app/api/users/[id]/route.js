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

// GET /api/users/[id] - Get specific user profile
export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userDoc = await adminDb.collection('users').doc(id).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = {
      id: userDoc.id,
      ...userDoc.data(),
      createdAt: userDoc.data().createdAt?.toDate().toISOString(),
      updatedAt: userDoc.data().updatedAt?.toDate().toISOString(),
    };

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if user is admin or updating their own profile
    const isAdmin = ['mohitkumarbiswas9@gmail.com', 'taurusarmyboyshostel@gmail.com'].includes(user.email);
    if (!isAdmin && user.uid !== id) {
      return NextResponse.json({ error: 'Forbidden: You can only update your own profile' }, { status: 403 });
    }

    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Remove fields that shouldn't be updated manually
    delete updateData.uid;
    delete updateData.email;
    delete updateData.createdAt;

    const userRef = adminDb.collection('users').doc(id);
    await userRef.update(updateData);

    const updatedDoc = await userRef.get();

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data().createdAt?.toDate().toISOString(),
        updatedAt: updatedDoc.data().updatedAt?.toDate().toISOString(),
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin check
    if (!['mohitkumarbiswas9@gmail.com', 'taurusarmyboyshostel@gmail.com'].includes(user.email)) {
      return NextResponse.json({ error: 'Forbidden: Only admin can delete users' }, { status: 403 });
    }

    const { id } = params;
    const userRef = adminDb.collection('users').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await userRef.delete();

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

