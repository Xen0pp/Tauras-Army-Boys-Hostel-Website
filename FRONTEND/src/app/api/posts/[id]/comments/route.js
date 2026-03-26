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

// GET /api/posts/[id]/comments - Get comments for a post
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

    const comments = postDoc.data().comments || [];

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments - Add comment to post
export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const postRef = adminDb.collection('posts').doc(id);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get user info
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    const newComment = {
      id: `comment_${Date.now()}`,
      content: content.trim(),
      userId: user.uid,
      userName: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || user.email,
      userAvatar: userData?.avatar || '',
      createdAt: new Date().toISOString(),
    };

    await postRef.update({
      comments: FieldValue.arrayUnion(newComment),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      message: 'Comment added successfully',
      comment: newComment
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
