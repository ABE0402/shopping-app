
import React from 'react';

interface ComingSoonViewProps {
  title: string;
  onBack: () => void;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({ title, onBack }) => {
  return (
    <div className="pb-24 px-4 pt-6 min-h-screen bg-white z-50">
        <header className="flex items-center mb-6">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
                <i className="fa-solid fa-arrow-left text-xl"></i>
            </button>
            <h2 className="text-2xl font-bold ml-2">{title}</h2>
        </header>
        
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
            <i className="fa-solid fa-person-digging text-5xl mb-4 text-gray-300"></i>
            <p className="text-lg font-medium text-gray-600">아직 준비중인 서비스입니다.</p>
            <p className="text-sm mt-2 text-gray-400">조금만 기다려주세요!</p>
        </div>
    </div>
  );
};
