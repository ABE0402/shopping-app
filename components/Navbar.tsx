import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, cartCount }) => {
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAiMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: string; label: string; icon: string; isImage?: boolean }[] = [
    { id: 'CART', label: '장바구니', icon: 'fa-cart-shopping' },
    { id: 'HOME', label: '홈', icon: 'fa-house' },
    // ▼▼▼ [아이콘 변경] fa-wand-magic-sparkles -> fa-shirt ▼▼▼
    { id: 'AI_MENU', label: 'AI 코디', icon: 'fa-shirt' }, 
    { id: 'MYPAGE', label: '마이페이지', icon: 'fa-user' },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'AI_MENU') {
      setIsAiMenuOpen(!isAiMenuOpen);
    } else {
      setCurrentView(id as ViewState);
      setIsAiMenuOpen(false);
    }
  };

  // AI 관련 메뉴가 활성화되어 있는지 확인
  const isAiActive = currentView === 'AI_COORDINATOR' || currentView === 'AI_STUDIO';

  return (
    <>
      {/* AI 선택 팝업 메뉴 */}
      {isAiMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-20 bg-black/20 backdrop-blur-[1px]" onClick={() => setIsAiMenuOpen(false)}>
          <div 
            ref={menuRef}
            className="w-[90%] max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 animate-[slideUp_0.2s_ease-out] mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setCurrentView('AI_COORDINATOR');
                  setIsAiMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                  currentView === 'AI_COORDINATOR' 
                    ? 'bg-purple-50 border-purple-200 text-purple-700' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-xl">
                  {/* 여기도 같은 옷 아이콘으로 통일감 있게 변경 */}
                  <i className="fa-solid fa-shirt text-purple-500"></i>
                </div>
                <span className="font-bold text-sm">코디네이터</span>
                <span className="text-[10px] text-gray-400 mt-0.5">상품 추천 & 검색</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('AI_STUDIO');
                  setIsAiMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                  currentView === 'AI_STUDIO' 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-xl">
                  <i className="fa-solid fa-camera text-indigo-500"></i>
                </div>
                <span className="font-bold text-sm">AI 스튜디오</span>
                <span className="text-[10px] text-gray-400 mt-0.5">가상 피팅 체험</span>
              </button>
            </div>
            
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-100"></div>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <div className="flex justify-around items-center h-16 w-full">
          {navItems.map((item) => {
            const isActive = item.id === 'AI_MENU' ? isAiActive : currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-black' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  {item.isImage ? (
                    <img src={item.icon} alt={item.label} className="w-6 h-6" />
                  ) : (
                    <i className={`fa-solid ${item.icon} text-xl transition-colors duration-200 ${
                      isActive && item.id === 'AI_MENU' ? 'text-purple-600' : ''
                    }`}></i>
                  )}
                  
                  {item.id === 'CART' && cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] flex items-center justify-center animate-bounce">
                      {cartCount}
                    </span>
                  )}
                  
                  {item.id === 'AI_MENU' && isAiMenuOpen && (
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full"></span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};