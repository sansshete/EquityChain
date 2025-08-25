import { useState, useEffect } from 'react';
import { getUser, createUser, User } from '../lib/firestore';

export const useUserRole = (walletAddress: string | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (address: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await getUser(address);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const createUserWithRole = async (address: string, role: User['role']) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await createUser(address, role);
      setUser(userData);
      return userData;
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchUser(walletAddress);
    } else {
      setUser(null);
    }
  }, [walletAddress]);

  return {
    user,
    loading,
    error,
    createUserWithRole,
    refetchUser: () => walletAddress && fetchUser(walletAddress),
  };
};