/**
 * Centralized authentication and authorization utilities
 * Provides flexible admin management via Firestore
 */

import { adminDb } from './firebase/admin';

// Bootstrap admin emails — these always have admin access even without a Firestore document
const BOOTSTRAP_ADMIN_EMAILS = ['mohitkumarbiswas9@gmail.com'];

/**
 * Check if a user is an admin
 * 3-tier check: Firestore by UID → Firestore by email → hardcoded email list
 *
 * @param {string} userId - Firebase user ID
 * @param {string} [email] - Optional user email for fallback checks
 * @returns {Promise<boolean>}
 */
export async function isAdmin(userId, email) {
  if (!userId) return false;

  try {
    // Tier 1: Firestore admins collection by UID
    const adminDoc = await adminDb.collection('admins').doc(userId).get();
    if (adminDoc.exists && adminDoc.data()?.isActive === true) return true;

    // Tier 2: Firestore admins by email
    if (email) {
      const snapshot = await adminDb.collection('admins')
        .where('email', '==', email)
        .where('isActive', '==', true)
        .limit(1)
        .get();
      if (!snapshot.empty) return true;
    }

    // Tier 3: Bootstrap hardcoded admin email
    if (email && BOOTSTRAP_ADMIN_EMAILS.includes(email)) return true;

    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    // Tier 3 fallback even on DB error
    return !!(email && BOOTSTRAP_ADMIN_EMAILS.includes(email));
  }
}

/**
 * Check if a user is an admin by email
 * Fallback for systems that only have email
 * 
 * @param {string} email - User email
 * @returns {Promise<boolean>} - True if user is admin
 */
export async function isAdminByEmail(email) {
  if (!email) return false;
  
  try {
    const snapshot = await adminDb.collection('admins')
      .where('email', '==', email)
      .where('isActive', '==', true)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking admin status by email:', error);
    return false;
  }
}

/**
 * Check if a user is an approved mentor
 * 
 * @param {string} userId - Firebase user ID
 * @returns {Promise<boolean>} - True if user is approved mentor
 */
export async function isMentor(userId) {
  if (!userId) return false;
  
  try {
    const mentorDoc = await adminDb.collection('mentorProfiles').doc(userId).get();
    if (!mentorDoc.exists) return false;
    
    const data = mentorDoc.data();
    return data?.isActive === true && data?.approvalStatus === 'approved';
  } catch (error) {
    console.error('Error checking mentor status:', error);
    return false;
  }
}

/**
 * Add a new admin to the system
 * Only callable by existing admins
 * 
 * @param {string} userId - User ID to make admin
 * @param {string} email - User email
 * @param {string} addedBy - Admin user ID who is adding this admin
 * @returns {Promise<void>}
 */
export async function addAdmin(userId, email, addedBy) {
  const isCallerAdmin = await isAdmin(addedBy);
  if (!isCallerAdmin) {
    throw new Error('Unauthorized: Only admins can add other admins');
  }
  
  await adminDb.collection('admins').doc(userId).set({
    userId,
    email,
    isActive: true,
    addedBy,
    addedAt: new Date(),
  });
}

/**
 * Remove admin access
 * 
 * @param {string} userId - User ID to remove admin access
 * @param {string} removedBy - Admin user ID who is removing
 * @returns {Promise<void>}
 */
export async function removeAdmin(userId, removedBy) {
  const isCallerAdmin = await isAdmin(removedBy);
  if (!isCallerAdmin) {
    throw new Error('Unauthorized: Only admins can remove other admins');
  }
  
  // Prevent removing yourself
  if (userId === removedBy) {
    throw new Error('Cannot remove your own admin access');
  }
  
  await adminDb.collection('admins').doc(userId).update({
    isActive: false,
    removedBy,
    removedAt: new Date(),
  });
}

/**
 * Get all active admins
 * 
 * @returns {Promise<Array>} - List of admin users
 */
export async function getAllAdmins() {
  try {
    const snapshot = await adminDb.collection('admins')
      .where('isActive', '==', true)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
}
