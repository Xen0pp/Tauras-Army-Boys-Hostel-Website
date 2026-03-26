"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                // Fetch user info from Firestore
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        let userData = userDoc.data();

                        // Force Admin role for specific email
                        if (firebaseUser.email === 'mohitkumarbiswas9@gmail.com' && userData?.role?.id !== '3') {
                            const adminRole = { id: '3', name: 'Admin' };
                            await setDoc(userDocRef, { ...userData, role: adminRole });
                            userData = { ...userData, role: adminRole };
                            console.log("Admin role enforced for user.");
                        }

                        setUserInfo(userData);
                    }
                } catch (error) {
                    console.error('Error fetching user info:', error);
                }
            } else {
                setUser(null);
                setUserInfo(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Email/Password Sign Up
    const signUp = async (email, password, userData) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            avatar: '',
            description: '',
            phone: userData.phone || '',
            address: userData.address || '',
            graduationYear: userData.graduationYear || null,
            batch: userData.batch || null,
            currentCompany: '',
            currentPosition: '',
            experience: '',
            skills: [],
            interests: [],
            achievements: '',
            socialLinks: {
                facebook: '',
                twitter: '',
                linkedin: '',
                instagram: '',
            },
            role: email === 'mohitkumarbiswas9@gmail.com'
                ? { id: '3', name: 'Admin' }
                : { id: '1', name: 'Student' },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return userCredential;
    };

    // Email/Password Sign In
    const signIn = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Google Sign In
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        // Check if user document exists
        let userDoc;
        try {
            userDoc = await getDoc(doc(db, 'users', result.user.uid));
        } catch (e) {
            console.error("Error getting user doc during google sign in:", e);
            throw e;
        }

        if (!userDoc.exists()) {
            // Create new user document
            try {
                await setDoc(doc(db, 'users', result.user.uid), {
                    uid: result.user.uid,
                    email: result.user.email,
                    firstName: result.user.displayName?.split(' ')[0] || '',
                    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                    avatar: result.user.photoURL || '',
                    description: '',
                    phone: '',
                    address: '',
                    graduationYear: null,
                    batch: null,
                    currentCompany: '',
                    currentPosition: '',
                    experience: '',
                    skills: [],
                    interests: [],
                    achievements: '',
                    socialLinks: {
                        facebook: '',
                        twitter: '',
                        linkedin: '',
                        instagram: '',
                    },
                    role: result.user.email === 'mohitkumarbiswas9@gmail.com'
                        ? { id: '3', name: 'Admin' }
                        : { id: '1', name: 'Student' },
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            } catch (e) {
                console.error("Error setting new user doc during google sign in:", e);
                throw e;
            }
        }

        // Ensure role is updated if already exists but role is wrong (for existing users)
        if (result.user.email === 'mohitkumarbiswas9@gmail.com' && userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role?.id !== '3') {
                try {
                    await setDoc(doc(db, 'users', result.user.uid), {
                        ...userData,
                        role: { id: '3', name: 'Admin' }
                    });
                } catch (e) {
                    console.error("Error updating admin role during google sign in:", e);
                    throw e;
                }
            }
        }

        return result;
    };

    // Sign Out
    const signOut = () => firebaseSignOut(auth);

    // Get ID Token
    const getAuthToken = async () => {
        if (!auth.currentUser) return null;
        return await auth.currentUser.getIdToken(true);
    };

    const value = {
        user,
        userInfo,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        getAuthToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
