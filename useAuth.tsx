// src/hooks/useAuth.ts

import { useState, useEffect } from 'react';
import { User } from './types';

export const useAuth = () => {
  // [수정] 초기값을 localStorage에서 읽지 않고 null로 설정하여 자동 로그인 방지
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });

  useEffect(() => {
    // 관리자 계정 초기화 로직은 유지
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
    // localStorage.setItem('currentUser', JSON.stringify(user)); // [주석 처리] 자동 로그인용 저장 안 함
  };

  const handleUserSignup = (user: User) => {
    setCurrentUser(user);
    // localStorage.setItem('currentUser', JSON.stringify(user)); // [주석 처리]
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