import React from 'react';
// 이미지 경로가 src/icon/icon.png 라고 가정합니다.
// 만약 이미지가 안 나오면 경로를 '../icon/icon.png' 등으로 맞춰주세요.
import appIcon from '../icon/icon.png'; 

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* 아이콘 이미지 */}
      <div className="w-24 h-24 mb-4 rounded-2xl overflow-hidden shadow-lg animate-bounce">
        <img 
          src={appIcon} 
          alt="App Icon" 
          className="w-full h-full object-cover" 
        />
      </div>
      
      {/* 텍스트 */}
      <h1 className="text-2xl font-bold text-gray-900 tracking-widest animate-pulse">
        With Mall
      </h1>
    </div>
  );
};

export default LoadingScreen;