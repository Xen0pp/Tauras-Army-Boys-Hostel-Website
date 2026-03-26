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

// GET /api/blogs/[id] - Get single blog
export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const blogDoc = await adminDb.collection('blogs').doc(id).get();

    if (!blogDoc.exists) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const blogData = {
      id: blogDoc.id,
      ...blogDoc.data(),
      createdAt: blogDoc.data().createdAt?.toDate().toISOString(),
      updatedAt: blogDoc.data().updatedAt?.toDate().toISOString(),
    };

    return NextResponse.json({ blog: blogData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}

// PUT /api/blogs/[id] - Update blog
export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const blogRef = adminDb.collection('blogs').doc(id);
    const blogDoc = await blogRef.get();

    if (!blogDoc.exists) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Check ownership
    if (blogDoc.data().author.uid !== user.uid) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own blogs' }, { status: 403 });
    }

    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Remove immutable fields
    delete updateData.id;
    delete updateData.author;
    delete updateData.createdAt;

    await blogRef.update(updateData);
    const updatedDoc = await blogRef.get();

    return NextResponse.json({
      message: 'Blog updated successfully',
      blog: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data().createdAt?.toDate().toISOString(),
        updatedAt: updatedDoc.data().updatedAt?.toDate().toISOString(),
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

// DELETE /api/blogs/[id] - Delete blog
export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const blogRef = adminDb.collection('blogs').doc(id);
    const blogDoc = await blogRef.get();

    if (!blogDoc.exists) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Check ownership
    if (blogDoc.data().author.uid !== user.uid) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own blogs' }, { status: 403 });
    }

    await blogRef.delete();

    return NextResponse.json({ message: 'Blog deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
