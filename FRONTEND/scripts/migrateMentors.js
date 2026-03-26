/**
 * Stage 8: Data Migration Script
 *
 * Run once with: node scripts/migrateMentors.js
 *
 * What it does:
 *   1. Reads all docs in `mentorProfiles` where isActive == true
 *   2. Creates corresponding docs in `mentors` collection with status: "approved"
 *   3. Marks migrated docs in mentorProfiles with migratedAt timestamp
 *
 * Requires the Firebase Admin SDK service account key at ./serviceAccount.json
 * OR set GOOGLE_APPLICATION_CREDENTIALS env variable.
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  || path.join(__dirname, 'serviceAccount.json');

if (!admin.apps.length) {
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    // Use application default credentials if no key file found
    admin.initializeApp();
  }
}

const db = admin.firestore();

async function migrateMentors() {
  console.log('🚀 Starting mentor migration...');

  const snapshot = await db.collection('mentorProfiles')
    .where('isActive', '==', true)
    .get();

  if (snapshot.empty) {
    console.log('✅ No active mentors in mentorProfiles to migrate.');
    return;
  }

  console.log(`📋 Found ${snapshot.size} mentor(s) to migrate.`);

  const batch = db.batch();
  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const uid = data.userId || data.uid || doc.id;

    const mentorRef = db.collection('mentors').doc(uid);
    const existing = await mentorRef.get();

    if (existing.exists) {
      console.log(`  ⏭️  Skipping ${uid} — already exists in 'mentors'`);
      continue;
    }

    // Map old mentorProfiles fields to new mentors schema
    batch.set(mentorRef, {
      uid,
      name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      email: data.email || '',
      bio: data.bio || '',
      skills: data.expertise_areas || data.skills || data.expertise || [],
      experience: data.years_experience || data.experience || data.yearsOfExperience || 0,
      photoURL: data.photoURL || data.avatar || '',
      capacity: data.mentoring_capacity || data.capacity || 3,
      company: data.current_company || data.company || '',
      position: data.current_position || data.position || '',
      linkedin_url: data.linkedin_url || '',
      github_url: data.github_url || '',
      portfolio_url: data.portfolio_url || '',
      availability: data.availability || {},
      currentMentees: data.active_mentees_count || 0,
      status: 'approved',
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: 'migration-script',
      createdAt: data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
    });

    // Mark as migrated in legacy collection
    batch.update(doc.ref, {
      migratedAt: admin.firestore.FieldValue.serverTimestamp(),
      migratedTo: 'mentors',
    });

    count++;
    console.log(`  ✅ Queued migration for: ${uid}`);
  }

  if (count === 0) {
    console.log('✅ Nothing new to migrate.');
    return;
  }

  await batch.commit();
  console.log(`\n🎉 Migration complete! ${count} mentor(s) migrated to 'mentors' collection.`);
}

migrateMentors().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
