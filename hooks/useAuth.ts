import { useState, useEffect } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });

  useEffect(() => {
    const adminAccounts = JSON.parse(localStorage.getItem('adminAccounts') || '[]');
    if (adminAccounts.length === 0) {
      const defaultAdmin = {
        id: 'admin',
        password: 'admin123',
        name: '관리자',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('adminAccounts', JSON.stringify([defaultAdmin]));
    }
  }, []);

  const handleUserLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleUserSignup = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    localStorage.setItem('isAdmin', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  return {
    currentUser,
    isAdmin,
    handleUserLogin,
    handleUserSignup,
    handleUserLogout,
    handleAdminLogin,
    handleAdminLogout,
  };
};

