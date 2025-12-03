import { useState, useEffect } from 'react';
import { User } from './types';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // // 앱 시작 시 localStorage에서 로그인 정보 확인 (자동 로그인 기능 비활성화)
    // try {
    //   const storedUser = localStorage.getItem('currentUser');
    //   const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
    //   if (storedUser) {
    //     setCurrentUser(JSON.parse(storedUser));
    //     setIsAdmin(storedIsAdmin);
    //   }
    // } catch (error) {
    //   console.error("Failed to parse auth data from localStorage", error);
    //   localStorage.removeItem('currentUser');
    //   localStorage.removeItem('isAdmin');
    // }
  }, []);

  const handleUserLogin = (userCredentials: any): (User & { isAdmin: boolean }) | null => {
    // --- 관리자 계정 정보 수정 위치 ---
    // 아래의 'admin'과 'admin123'을 원하는 아이디와 비밀번호로 변경하세요.
    if (userCredentials.id === 'admin' && userCredentials.password === 'admin123') {
      const adminUser: User = { id: 'admin', name: '관리자', email: 'admin@stylehub.com' };
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      localStorage.setItem('isAdmin', 'true');
      setCurrentUser(adminUser);
      setIsAdmin(true);
      return { ...adminUser, isAdmin: true };
    }

    // 일반 사용자 로그인 처리
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: any) => u.id === userCredentials.id && u.password === userCredentials.password);

    if (foundUser) {
      const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isAdmin', 'false');
      setCurrentUser(userData);
      setIsAdmin(false);
      return { ...userData, isAdmin: false };
    } else {
      // 로그인 실패 시 onLogin prop에서 처리되므로 여기서는 특별한 처리를 하지 않음
      // 필요하다면 여기서 에러를 throw 하거나 상태를 설정할 수 있습니다.
      return null;
    }
  };

  const handleUserSignup = (user: User) => {
    // Signup.tsx에서 이미 localStorage에 저장하지만,
    // 앱의 상태(currentUser)를 업데이트하기 위해 여기서도 처리합니다.
    setCurrentUser(user);
    setIsAdmin(false);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isAdmin', 'false');
  };

  const handleUserLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    setCurrentUser(null);
    setIsAdmin(false);
  };

  return { currentUser, isAdmin, handleUserLogin, handleUserSignup, handleUserLogout };
};