import React, { useState } from 'react';

// App.tsx에서 가져온 타입 정의
interface AiHistoryItem {
  id: string;
  generatedImage: string;
  title: string;
  timestamp: number;
}

interface AiHistoryViewProps {
  historyItems: AiHistoryItem[];
  onBack: () => void;
  onDeleteImage: (id: string) => void;
}

export const AiHistoryView: React.FC<AiHistoryViewProps> = ({ historyItems, onBack, onDeleteImage }) => {
  const [selectedItem, setSelectedItem] = useState<AiHistoryItem | null>(null);

  const handleDownload = () => {
    if (!selectedItem) return;
    const link = document.createElement('a');
    link.href = selectedItem.generatedImage;
    // 파일명에 상품 제목과 고유 ID를 포함하여 다운로드
    link.download = `ai-generated-${selectedItem.title.replace(/\s+/g, '_')}-${selectedItem.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pb-24 pt-14 bg-white min-h-screen">
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md z-10 flex items-center px-4 max-w-md mx-auto">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <div className="flex-1 text-center font-bold text-lg">AI 생성 기록</div>
        <div className="w-8"></div>
      </header>

      <main className="px-4 py-6">
        {historyItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="fa-regular fa-images text-4xl mb-3"></i>
            <p>아직 AI로 생성한 이미지가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {historyItems.map((item) => {
              const date = new Date(item.timestamp);
              const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}. ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

              return (
                <div key={item.id}>
                  <div 
                    className="relative group aspect-square cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <img src={item.generatedImage} alt={item.title} className="w-full h-full object-cover rounded-lg shadow-sm transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <button 
                        onClick={() => onDeleteImage(item.id)}
                        className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        title="삭제"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                      <div className="absolute top-2 right-2 text-white text-xs bg-black/40 px-2 py-1 rounded-full">
                        <i className="fa-solid fa-expand mr-1.5"></i>
                        크게 보기
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <p className="font-bold truncate">{item.title}</p>
                    <p className="text-gray-400">{formattedDate}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 이미지 상세 보기 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <button 
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>

          <div className="w-full max-w-lg aspect-square flex items-center justify-center">
            <img 
              src={selectedItem.generatedImage} 
              alt={selectedItem.title} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button 
              onClick={handleDownload}
              className="bg-white text-black font-bold py-3 px-6 rounded-full flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <i className="fa-solid fa-download"></i>
              <span>다운로드</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};