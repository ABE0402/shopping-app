import React, { useState } from 'react';

interface LoginProps {
  onLogin: (user: { id: string; password: string }) => any;
  onSwitchToSignup: () => void;
  onSwitchToFindId: () => void;
  onSwitchToFindPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ 
  onLogin, 
  onSwitchToSignup, 
  onSwitchToFindId, 
  onSwitchToFindPassword 
}) => {
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.id.trim() || !formData.password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = onLogin(formData);
      // App.tsx에서 loginResult가 null이면 로그인 실패를 의미
      if (!result) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-user text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
          <p className="text-gray-500 text-sm mt-2">쇼핑몰에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
              아이디
            </label>
            <input
              id="id"
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              placeholder="아이디를 입력하세요"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all ${
              isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-black to-gray-800 hover:shadow-xl active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                로그인 중...
              </span>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="flex justify-center gap-4 text-sm">
            <button
              onClick={onSwitchToFindId}
              className="text-gray-600 hover:text-black transition-colors"
            >
              아이디 찾기
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={onSwitchToFindPassword}
              className="text-gray-600 hover:text-black transition-colors"
            >
              비밀번호 찾기
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onSwitchToSignup}
              className="w-full py-3 border-2 border-black rounded-xl font-bold text-black hover:bg-black hover:text-white transition-all"
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
