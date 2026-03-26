"use client";
import React, { useEffect, useState } from 'react';
import AdminPanel from '@/components/admin/AdminPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import axiosRequest from '@/lib/axiosRequest';

const AdminPage = () => {
  const { user, loading: authLoading, getAuthToken } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!authLoading && user) {
        try {
          const token = await getAuthToken();
          const response = await axiosRequest({
            url: '/api/admin/check/',
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response?.isAdmin) {
            setIsAdmin(true);
          } else {
            router.push('/portal');
          }
        } catch (error) {
          console.error('Admin check failed:', error);
          router.push('/portal');
        }
      } else if (!authLoading && !user) {
        router.push('/portal');
      }
      setCheckingAdmin(false);
    };

    checkAdminStatus();
  }, [user, authLoading, getAuthToken, router]);

  if (authLoading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-vips-maroon dark:text-white mb-6">Admin Panel</h1>
      <AdminPanel />
    </div>
  );
};

export default AdminPage;
