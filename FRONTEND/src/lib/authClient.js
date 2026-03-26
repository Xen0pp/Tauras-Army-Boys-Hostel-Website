/**
 * Client-side authentication utilities
 * Check user roles and permissions
 */

import axiosRequest from './axiosRequest';

/**
 * Check if current user is admin
 * Makes API call to backend to verify against Firestore
 * 
 * @param {function} getAuthToken - Function to get Firebase auth token
 * @returns {Promise<boolean>} - True if user is admin
 */
export async function isUserAdmin(getAuthToken) {
  try {
    const token = await getAuthToken();
    if (!token) return false;
    
    const response = await axiosRequest({
      url: '/api/admin/check/',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });
    
    return response?.isAdmin === true;
  } catch (error) {
    // If API returns 403/401, user is not admin
    if (error.response?.status === 403 || error.response?.status === 401) {
      return false;
    }
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * React hook to check if user is admin
 * Usage: const { isAdmin, loading } = useIsAdmin();
 */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { getAuthToken, user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    
    isUserAdmin(getAuthToken)
      .then(setIsAdmin)
      .finally(() => setLoading(false));
  }, [user, getAuthToken]);
  
  return { isAdmin, loading };
}
