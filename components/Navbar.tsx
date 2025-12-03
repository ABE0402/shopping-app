import React from 'react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, cartCount }) => {
  const navItems: { id: ViewState; label: string; icon: string; isImage?: boolean }[] = [
    { id: 'CART', label: '장바구니', icon: 'fa-cart-shopping' },
    { id: 'HOME', label: '홈', icon: 'fa-house' },
    { id: 'AI_COORDINATOR', label: 'AI 코디', icon: 'fa-wand-magic-sparkles' },
    { id: 'MYPAGE', label: '마이페이지', icon: 'fa-user' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-16 w-full">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentView === item.id ? 'text-black' : 'text-gray-400'
            }`}
          >
            <div className="relative">
              {item.isImage ? (
                <img src={item.icon} alt={item.label} className="w-6 h-6" />
              ) : (
                <i className={`fa-solid ${item.icon} text-xl transition-colors duration-200`}></i>
              )}
              {item.id === 'CART' && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};