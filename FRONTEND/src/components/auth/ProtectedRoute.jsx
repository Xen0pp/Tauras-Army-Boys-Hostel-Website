"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const publicPaths = [
    '/portal',
    '/portal/eligibility',
    '/portal/about-alumni',
    '/portal/contact',
    '/portal/rooms-facilities',
    '/portal/gallery',
    '/portal/administration'
];

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const isPublicPath = typeof window !== 'undefined' ? publicPaths.includes(window.location.pathname) : false;
        if (!loading && !user && !isPublicPath) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vips-maroon"></div>
            </div>
        );
    }

    const isPublicPath = typeof window !== 'undefined' ? publicPaths.includes(window.location.pathname) : false;

    if (!user && !isPublicPath) {
        return null;
    }

    return children;
}
