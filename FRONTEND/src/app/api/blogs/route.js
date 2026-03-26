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

// GET /api/blogs - List all blogs
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blogsRef = adminDb.collection('blogs');
    const snapshot = await blogsRef.orderBy('createdAt', 'desc').get();
    
    const blogs = [];
    snapshot.forEach(doc => {
      blogs.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      });
    });

    return NextResponse.json({ results: blogs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// POST /api/blogs - Create new blog
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, tags, imageUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Get user info
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    const newBlog = {
      title,
      content,
      author: {
        uid: user.uid,
        name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || user.email,
        avatar: userData?.avatar || '',
      },
      tags: tags || [],
      imageUrl: imageUrl || '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('blogs').add(newBlog);
    const createdDoc = await docRef.get();

    return NextResponse.json({
      message: 'Blog created successfully',
      blog: {
        id: docRef.id,
        ...createdDoc.data(),
        createdAt: createdDoc.data().createdAt?.toDate().toISOString(),
        updatedAt: createdDoc.data().updatedAt?.toDate().toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
