import React from 'react';

interface MyPhotoViewProps {
  userPhoto: string | null;
  isPhotoSheetOpen: boolean;
  setIsPhotoSheetOpen: (open: boolean) => void;
  galleryInputRef: React.RefObject<HTMLInputElement>;
  cameraInputRef: React.RefObject<HTMLInputElement>;
  onPhotoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
}

export const MyPhotoView: React.FC<MyPhotoViewProps> = ({
  userPhoto,
  isPhotoSheetOpen,
  setIsPhotoSheetOpen,
  galleryInputRef,
  cameraInputRef,
  onPhotoSelect,
  onBack,
}) => {
  return (
    <div className="bg-white min-h-screen relative z-40">
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md z-10 flex items-center px-4 max-w-md mx-auto">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-800">
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
        <div className="flex-1 text-center font-bold text-lg">내 사진</div>
        <div className="w-8"></div>
      </header>
      <div className="pt-20 px-4 pb-24 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold my-4">내 사진</h2>
        {userPhoto ? (
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border border-gray-100">
            <img src={userPhoto} alt="My Photo" className="w-full h-auto object-cover" />
          </div>
        ) : (
          <div className="w-full max-w-sm aspect-[3/4] bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
            <i className="fa-regular fa-image text-5xl mb-3"></i>
            <p>등록된 사진이 없습니다.</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => setIsPhotoSheetOpen(true)}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-base active:scale-[0.98] transition-transform"
          >
            사진 등록
          </button>
        </div>
      </div>

      {isPhotoSheetOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsPhotoSheetOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-md rounded-t-2xl p-4 z-10 animate-[slideUp_0.3s_ease-out] safe-pb">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-center font-bold text-lg mb-6">사진 가져오기</h3>
            <div className="space-y-3">
              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="w-full bg-gray-50 p-4 rounded-xl font-medium text-left flex items-center gap-3 hover:bg-gray-100"
              >
                <i className="fa-regular fa-images text-xl w-8 text-center"></i>
                저장된 이미지 넣기
              </button>
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="w-full bg-gray-50 p-4 rounded-xl font-medium text-left flex items-center gap-3 hover:bg-gray-100"
              >
                <i className="fa-solid fa-camera text-xl w-8 text-center"></i>
                지금 사진 찍기
              </button>
              <button 
                onClick={() => setIsPhotoSheetOpen(false)}
                className="w-full bg-white border border-gray-200 p-4 rounded-xl font-bold text-gray-500 mt-2"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={galleryInputRef}
        onChange={onPhotoSelect}
      />
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        className="hidden" 
        ref={cameraInputRef}
        onChange={onPhotoSelect}
      />
    </div>
  );
};
