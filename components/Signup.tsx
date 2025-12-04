import React, { useState } from 'react';

interface SignupProps {
  onSignup: (user: { id: string; name: string; email: string }) => void;
  onSwitchToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    passwordConfirm: '',
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.id.trim()) {
      newErrors.id = '아이디를 입력해주세요.';
    } else if (formData.id.length < 4) {
      newErrors.id = '아이디는 4자 이상이어야 합니다.';
    }

    if (!formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Firebase에서 사용자 서비스 가져오기
      const { userService } = await import('../services/dbService');
      
      // 1. Firebase에서 아이디 중복 확인
      const existingUser = await userService.getUser(formData.id);
      if (existingUser) {
        setErrors({ id: '이미 사용 중인 아이디입니다.' });
        setIsLoading(false);
        return;
      }

      // 2. Firebase에서 이메일 중복 확인
      const existingEmailUser = await userService.getUserByEmail(formData.email);
      if (existingEmailUser) {
        setErrors({ email: '이미 사용 중인 이메일입니다.' });
        setIsLoading(false);
        return;
      }

      // 3. localStorage에서도 중복 확인 (하위 호환성)
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some((u: any) => u.id === formData.id)) {
        setErrors({ id: '이미 사용 중인 아이디입니다.' });
        setIsLoading(false);
        return;
      }
      if (users.some((u: any) => u.email === formData.email)) {
        setErrors({ email: '이미 사용 중인 이메일입니다.' });
        setIsLoading(false);
        return;
      }

      // 4. Firebase에 새 사용자 저장
      const newUser = {
        id: formData.id,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date().toISOString()
      };

      await userService.saveUser(newUser);

      // 5. localStorage에도 저장 (하위 호환성)
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // 6. 자동 로그인
      const userData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      onSignup(userData);
    } catch (err: any) {
      console.error('회원가입 오류:', err);
      setErrors({ submit: err.message || '회원가입 중 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-user-plus text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-gray-500 text-sm mt-2">새로운 계정을 만드세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
              아이디 <span className="text-red-500">*</span>
            </label>
            <input
              id="id"
              type="text"
              value={formData.id}
              onChange={(e) => {
                setFormData({ ...formData, id: e.target.value });
                if (errors.id) setErrors({ ...errors, id: '' });
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${
                errors.id ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="4자 이상 입력하세요"
              disabled={isLoading}
            />
            {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="6자 이상 입력하세요"
              disabled={isLoading}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={formData.passwordConfirm}
              onChange={(e) => {
                setFormData({ ...formData, passwordConfirm: e.target.value });
                if (errors.passwordConfirm) setErrors({ ...errors, passwordConfirm: '' });
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${
                errors.passwordConfirm ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="비밀번호를 다시 입력하세요"
              disabled={isLoading}
            />
            {errors.passwordConfirm && <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm}</p>}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="이름을 입력하세요"
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="example@email.com"
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="010-1234-5678"
              disabled={isLoading}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{errors.submit}</span>
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
                가입 중...
              </span>
            ) : (
              '회원가입'
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onSwitchToLogin}
            className="w-full py-3 text-gray-600 hover:text-black transition-colors text-sm"
          >
            이미 계정이 있으신가요? <span className="font-bold">로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
};


