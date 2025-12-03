import React from 'react';

interface GlobalHeaderProps {
  title?: string;
  onBack?: () => void;
  onGoToHome: () => void;
  onGoToDashboard: () => void;
  showBack: boolean;
  isAdmin: boolean;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ title, onBack, onGoToHome, onGoToDashboard, showBack, isAdmin }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md z-30 flex items-center px-4 max-w-md mx-auto border-b border-gray-100">
      <div className="flex items-center">
        <button onClick={onGoToHome} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
          <img src="/icon/icon.png" alt="Home" className="w-6 h-6" />
        </button>
        {showBack && onBack && (
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
            <i className="fa-solid fa-arrow-left text-xl"></i>
          </button>
        )}
      </div>
      <div className="flex-1 text-center font-medium truncate px-2">
        {title}
      </div>
      <div className="w-16 flex justify-end">
        {isAdmin && (
          <button
            onClick={onGoToDashboard}
            className="w-10 h-10 flex items-center justify-center text-gray-800"
          >
            <i className="fa-solid fa-shield-halved text-xl"></i>
          </button>
        )}
      </div>
    </header>
  );
};