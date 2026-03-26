import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { isAdmin, addAdmin, removeAdmin, getAllAdmins } from '@/lib/auth';

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

// GET /api/admin/users - List all admins
export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if requester is admin
    const userIsAdmin = await isAdmin(user.uid);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const admins = await getAllAdmins();
    
    // Fetch user details for each admin
    const adminsWithDetails = await Promise.all(admins.map(async (admin) => {
      try {
        const userDoc = await adminDb.collection('users').doc(admin.userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        
        return {
          ...admin,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          avatar: userData.avatar || '',
        };
      } catch (err) {
        return admin;
      }
    }));

    return NextResponse.json({ admins: adminsWithDetails }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

// POST /api/admin/users - Add new admin
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if requester is admin
    const userIsAdmin = await isAdmin(user.uid);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { userId, email } = await request.json();
    
    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400 });
    }

    await addAdmin(userId, email, user.uid);

    return NextResponse.json({ 
      message: 'Admin added successfully',
      adminId: userId 
    }, { status: 200 });
  } catch (error) {
    console.error('Error adding admin:', error);
    return NextResponse.json({ error: error.message || 'Failed to add admin' }, { status: 500 });
  }
}
