import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 간단한 관리자 인증 (실제로는 서버에서 처리해야 함)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // 에러 초기화
    
    // 입력값 정리 (공백 제거)
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    console.log('로그인 시도:', { username: trimmedUsername, password: trimmedPassword });
    
    // 기본 관리자 계정 먼저 체크 (가장 간단한 방법)
    if (trimmedUsername === 'admin' && trimmedPassword === 'admin123') {
      console.log('기본 관리자 계정으로 로그인 시도');
      // 기본 계정을 localStorage에 저장 (없으면)
      try {
        const adminAccounts = JSON.parse(localStorage.getItem('adminAccounts') || '[]');
        if (!adminAccounts.find((acc: any) => acc.id === 'admin')) {
          const defaultAdmin = {
            id: 'admin',
            password: 'admin123',
            name: '관리자',
            createdAt: new Date().toISOString()
          };
          adminAccounts.push(defaultAdmin);
          localStorage.setItem('adminAccounts', JSON.stringify(adminAccounts));
          console.log('기본 관리자 계정 생성됨');
        }
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('currentAdmin', JSON.stringify({ id: 'admin', name: '관리자' }));
        console.log('관리자 로그인 성공');
        onLogin();
        return;
      } catch (err) {
        console.error('로그인 중 오류:', err);
        setError('로그인 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
        return;
      }
    }
    
    // localStorage에서 관리자 계정 확인
    try {
      const adminAccounts = JSON.parse(localStorage.getItem('adminAccounts') || '[]');
      console.log('저장된 관리자 계정:', adminAccounts);
      const admin = adminAccounts.find((acc: any) => 
        acc.id === trimmedUsername && acc.password === trimmedPassword
      );
      
      if (admin) {
        console.log('관리자 계정으로 로그인 성공:', admin);
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('currentAdmin', JSON.stringify({ id: admin.id, name: admin.name }));
        onLogin();
      } else {
        console.log('관리자 계정을 찾을 수 없음');
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('관리자 계정 확인 중 오류:', err);
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-shield-halved text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 로그인</h1>
          <p className="text-gray-500 text-sm mt-2">상품 관리 시스템에 접속합니다</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              아이디
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="관리자 아이디"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="비밀번호"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-3.5 rounded-lg font-bold text-base hover:bg-gray-800 transition-colors"
          >
            로그인
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            테스트 계정: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

