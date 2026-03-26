import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// Helper function to verify Firebase token
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

// GET /api/posts/[id] - Get single post
export async function GET(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const postDoc = await adminDb.collection('posts').doc(id).get();

    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = {
      id: postDoc.id,
      ...postDoc.data(),
      createdAt: postDoc.data().createdAt?.toDate().toISOString(),
      updatedAt: postDoc.data().updatedAt?.toDate().toISOString(),
    };

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { post } = body;

    if (!post || !post.trim()) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 });
    }

    const postRef = adminDb.collection('posts').doc(id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user is the owner or an admin
    if (postDoc.data().createdBy.uid !== user.uid && user.email !== 'mohitkumarbiswas9@gmail.com') {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own posts' }, { status: 403 });
    }

    await postRef.update({
      post: post.trim(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedPost = await postRef.get();

    return NextResponse.json({
      message: 'Post updated successfully',
      post: {
        id: updatedPost.id,
        ...updatedPost.data(),
        createdAt: updatedPost.data().createdAt?.toDate().toISOString(),
        updatedAt: updatedPost.data().updatedAt?.toDate().toISOString(),
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const postRef = adminDb.collection('posts').doc(id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user is the owner or an admin
    if (postDoc.data().createdBy.uid !== user.uid && user.email !== 'mohitkumarbiswas9@gmail.com') {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own posts' }, { status: 403 });
    }

    await postRef.delete();

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
