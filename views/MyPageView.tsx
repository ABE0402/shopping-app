
import React from 'react';
import { ViewState } from '../types';

interface MyPageViewProps {
  onNavigate: (view: ViewState) => void;
}

export const MyPageView: React.FC<MyPageViewProps> = ({ onNavigate }) => {
  return (
    <div className="pb-24 px-4 pt-8 bg-white min-h-screen">
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            <i className="fa-solid fa-user text-2xl text-gray-400"></i>
        </div>
        <div className="ml-4">
            <h2 className="text-xl font-bold">홍길동님</h2>
            <p className="text-sm text-gray-500">Gold Level</p>
        </div>
      </div>

      <div className="mb-6">
        <button 
          onClick={() => onNavigate('AI_STUDIO')}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl shadow-lg shadow-purple-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
               <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
             </div>
             <div className="text-left">
               <div className="font-bold text-sm">AI 패션 스튜디오</div>
               <div className="text-xs text-purple-100 opacity-90">Nano Banana 모델로 스타일링</div>
             </div>
          </div>
          <i className="fa-solid fa-chevron-right text-sm opacity-50"></i>
        </button>
      </div>

      <div className="space-y-2">
        {['주문 내역', '찜한 상품', '최근 본 상품', '쿠폰함', '설정', '내 사진'].map((menu) => (
            <button 
              key={menu} 
              onClick={() => {
                if (menu === '내 사진') onNavigate('MY_PHOTOS');
                else if (menu === '찜한 상품') onNavigate('WISHLIST');
                else if (menu === '최근 본 상품') onNavigate('RECENTLY_VIEWED');
                else if (menu === '주문 내역') onNavigate('ORDER_HISTORY');
                else if (menu === '쿠폰함') onNavigate('COUPONS');
                else if (menu === '설정') onNavigate('SETTINGS');
              }}
              className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <span className="font-medium text-gray-700">{menu}</span>
                <i className="fa-solid fa-chevron-right text-gray-400 text-xs"></i>
            </button>
        ))}
      </div>
    </div>
  );
};
