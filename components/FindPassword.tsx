import React, { useState } from 'react';

interface FindPasswordProps {
  onSwitchToLogin: () => void;
  onSwitchToFindId: () => void;
}

export const FindPassword: React.FC<FindPasswordProps> = ({ onSwitchToLogin, onSwitchToFindId }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: ''
  });
  const [foundPassword, setFoundPassword] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFoundPassword(null);

    if (!formData.id.trim() || !formData.name.trim() || !formData.email.trim()) {
      setError('모든 정보를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => 
        u.id === formData.id && 
        u.name === formData.name && 
        u.email === formData.email
      );
      
      if (user) {
        // 보안을 위해 일부만 표시
        const maskedPassword = user.password.substring(0, 2) + '*'.repeat(user.password.length - 2);
        setFoundPassword(user.password);
      } else {
        setError('입력하신 정보와 일치하는 계정을 찾을 수 없습니다.');
      }
    } catch (err) {
      setError('비밀번호 찾기 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-key text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">비밀번호 찾기</h1>
          <p className="text-gray-500 text-sm mt-2">아이디, 이름, 이메일로 비밀번호를 찾을 수 있습니다</p>
        </div>

        {!foundPassword ? (
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                placeholder="이름을 입력하세요"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                placeholder="example@email.com"
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
                  찾는 중...
                </span>
              ) : (
                '비밀번호 찾기'
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <i className="fa-solid fa-circle-check text-green-500 text-3xl mb-3"></i>
              <p className="text-sm text-gray-600 mb-2">비밀번호를 찾았습니다</p>
              <p className="text-xl font-bold text-gray-900 font-mono">{foundPassword}</p>
              <p className="text-xs text-gray-500 mt-2">보안을 위해 로그인 후 비밀번호를 변경하세요</p>
            </div>

            <button
              onClick={onSwitchToLogin}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-black to-gray-800 hover:shadow-xl active:scale-[0.98] transition-all"
            >
              로그인하러 가기
            </button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <div className="flex justify-center gap-4 text-sm">
            <button
              onClick={onSwitchToLogin}
              className="text-gray-600 hover:text-black transition-colors"
            >
              로그인
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={onSwitchToFindId}
              className="text-gray-600 hover:text-black transition-colors"
            >
              아이디 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


