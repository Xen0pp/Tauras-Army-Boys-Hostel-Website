import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { isAdmin, isAdminByEmail } from '@/lib/auth';

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



// GET /api/users - List all users (Alumni)
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get('role');

    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.orderBy('createdAt', 'desc').get();
    
    const dbUsers = [];
    snapshot.forEach(doc => {
      dbUsers.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      });
    });

    // Filter DB data by role
    let allUsers = [...dbUsers];
    
    if (roleParam) {
      allUsers = allUsers.filter(u => u.role?.id == roleParam);
    }

    return NextResponse.json({ results: allUsers, count: allUsers.length }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin check via Firestore RBAC (with hardcoded fallback)
    const adminByUid = await isAdmin(user.uid);
    const adminByEmail = user.email ? await isAdminByEmail(user.email) : false;
    const hardcodedAdmin = user.email === 'mohitkumarbiswas9@gmail.com';
    if (!adminByUid && !adminByEmail && !hardcodedAdmin) {
      return NextResponse.json({ error: 'Forbidden: Only admin can create users' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      firstName, lastName, email, role, description, 
      phone, address, graduationYear, batch, currentCompany, 
      currentPosition, avatar, linkedin 
    } = body;

    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newUser = {
      firstName,
      lastName,
      email,
      role,
      description: description || '',
      phone: phone || '',
      address: address || '',
      graduationYear: graduationYear || null,
      batch: batch || null,
      currentCompany: currentCompany || '',
      currentPosition: currentPosition || '',
      avatar: avatar || '',
      socialLinks: {
        linkedin: linkedin || '',
        facebook: '',
        twitter: '',
        instagram: '',
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('users').add(newUser);
    const createdUser = await docRef.get();

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: docRef.id,
        ...createdUser.data(),
        createdAt: createdUser.data().createdAt?.toDate().toISOString(),
        updatedAt: createdUser.data().updatedAt?.toDate().toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
