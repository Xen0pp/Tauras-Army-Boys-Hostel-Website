/**
 * Script to initialize the first admin in the system
 * Run this once to bootstrap admin access
 * 
 * Usage: node scripts/initializeAdmin.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found!');
  console.log('Please place your Firebase service account key at:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeAdmin() {
  try {
    // Get the admin email from environment or use default
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'mohitkumarbiswas9@gmail.com';
    
    console.log('🔍 Looking for user with email:', ADMIN_EMAIL);
    
    // Find user by email
    const usersSnapshot = await db.collection('users').where('email', '==', ADMIN_EMAIL).limit(1).get();
    
    if (usersSnapshot.empty) {
      console.error('❌ No user found with email:', ADMIN_EMAIL);
      console.log('Please ensure the user has registered first.');
      process.exit(1);
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log(`✅ Found user: ${userData.firstName} ${userData.lastName} (${userId})`);
    
    // Check if already admin
    const existingAdmin = await db.collection('admins').doc(userId).get();
    
    if (existingAdmin.exists && existingAdmin.data().isActive) {
      console.log('ℹ️  User is already an admin');
      process.exit(0);
    }
    
    // Create admin record
    await db.collection('admins').doc(userId).set({
      userId,
      email: ADMIN_EMAIL,
      isActive: true,
      addedBy: 'system',
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('🎉 Admin access granted successfully!');
    console.log('User ID:', userId);
    console.log('Email:', ADMIN_EMAIL);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
    process.exit(1);
  }
}

initializeAdmin();
