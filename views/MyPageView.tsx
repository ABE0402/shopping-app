import React from 'react';
import { User } from '../types';

interface MyPageViewProps {
  currentUser: User | null;
  isAdmin: boolean;
  onLogout: () => void;
  onGoToLogin: () => void;
  onGoToAiStudio: () => void;
  onGoToMyPhotos: () => void;
  onGoToWishlist: () => void;
  onGoToRecentlyViewed: () => void;
  onGoToOrderHistory: () => void;
  onGoToAiHistory: () => void;
}

export const MyPageView: React.FC<MyPageViewProps> = ({
  currentUser,
  isAdmin,
  onLogout,
  onGoToLogin,
  onGoToAiStudio,
  onGoToMyPhotos,
  onGoToWishlist,
  onGoToRecentlyViewed,
  onGoToOrderHistory,
  onGoToAiHistory,
}) => {
  // 알림 함수 추가
  const showPrepareAlert = () => {
    alert("아직 준비중인 서비스입니다.");
  };

  if (!currentUser) {
    return (
      <div className="pb-24 pt-14 px-4 bg-white min-h-screen flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-user text-3xl text-gray-400"></i>
          </div>
          <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
          <p className="text-sm text-gray-500">로그인하여 더 많은 기능을 이용하세요</p>
        </div>
        <button
          onClick={onGoToLogin}
          className="w-full max-w-xs py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-black to-gray-800 hover:shadow-xl active:scale-[0.98] transition-all"
        >
          로그인
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-14 bg-white min-h-screen flex flex-col">
      <header className="px-4 pt-4 pb-4 border-b border-gray-100 flex-none">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            <i className="fa-solid fa-user text-2xl text-gray-400"></i>
          </div>
          <div className="ml-4 flex-1">
            <h2 className="text-xl font-bold">{currentUser.name}님</h2>
            <p className="text-sm text-gray-500">{currentUser.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-2">
          {[
            { label: '주문 내역', action: onGoToOrderHistory },
            { label: '찜한 상품', action: onGoToWishlist },
            { label: '쿠폰함', action: showPrepareAlert },    // ✅ [수정됨] 클릭 시 알림 표시
            { label: '최근 본 상품', action: onGoToRecentlyViewed },
            { label: '설정', action: showPrepareAlert },      // 여기도 준비중 처리
            { label: 'AI 생성 기록', action: onGoToAiHistory }, // 버튼 추가
            { label: '내 사진', action: onGoToMyPhotos },
          ].map((menu) => (
            <button 
              key={menu.label} 
              onClick={menu.action}
              className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">{menu.label}</span>
              <i className="fa-solid fa-chevron-right text-gray-400 text-xs"></i>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};