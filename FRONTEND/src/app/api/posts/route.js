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

// GET /api/posts - List all posts
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postsRef = adminDb.collection('posts');
    const snapshot = await postsRef.orderBy('createdAt', 'desc').get();
    
    const posts = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Filter out posts from Xen0ppp
      if (data.createdBy?.firstName === 'Xen0ppp' || data.createdBy?.lastName === 'Xen0ppp') {
        return;
      }
      
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      });
    });

    return NextResponse.json({ results: posts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/posts - Create new post
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { post } = body;

    if (!post || !post.trim()) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 });
    }

    // Get user info from Firestore to check role and attach to post
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    // Admin check
    if (userData?.role?.id != 3 && userData?.role?.id !== "3" && user.email !== 'mohitkumarbiswas9@gmail.com') {
      return NextResponse.json({ error: 'Forbidden: Only admin can create posts' }, { status: 403 });
    }



    const newPost = {
      post: post.trim(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: {
        uid: user.uid,
        email: user.email,
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        avatar: userData?.avatar || '',
        role: userData?.role || { name: 'Member' },
      },
      comments: [],
    };

    const docRef = await adminDb.collection('posts').add(newPost);
    const createdPost = await docRef.get();

    return NextResponse.json({
      message: 'Post created successfully',
      post: {
        id: docRef.id,
        ...createdPost.data(),
        createdAt: createdPost.data().createdAt?.toDate().toISOString(),
        updatedAt: createdPost.data().updatedAt?.toDate().toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
