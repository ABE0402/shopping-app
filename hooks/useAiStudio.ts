import React, { useState, useRef } from 'react';
import { CartItem } from '../types';
import { generateFashionImage, editFashionImage, tryOnFashionItem, urlToBase64 } from '../services/geminiService';

export const useAiStudio = (cartItems: CartItem[], selectedCartItemId: number | null) => {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useMyPhoto, setUseMyPhoto] = useState(false);
  const [isCartSelectorOpen, setIsCartSelectorOpen] = useState(false);
  
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const aiStudioFileRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result as string);
        setIsPhotoSheetOpen(false);
        setUseMyPhoto(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGeneration = async () => {

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      let result;
      const cartItem = selectedCartItemId ? cartItems.find(i => i.id === selectedCartItemId) : null;
      // 사진이 있거나, 명시적으로 내 사진 사용을 체크했으면 사진 모드로 동작
      const shouldUsePhoto = useMyPhoto || userPhoto !== null;

      if (shouldUsePhoto && userPhoto && cartItem) {
        // [1] 가상 피팅 (내 사진 + 옷)
        try {
          // 서비스에서 프록시를 통해 이미지를 가져옵니다.
          const productBase64 = await urlToBase64(cartItem.image);
          result = await tryOnFashionItem(userPhoto, productBase64, aiPrompt);
        } catch (e: any) {
          console.error("Image conversion failed", e);
          // [수정됨] 무조건 CORS라고 하지 않고, 실제 에러 메시지를 보여줍니다.
          alert(`상품 이미지를 처리하는데 실패했습니다.\n\n사유: ${e.message || "알 수 없는 오류"}`);
          setIsGenerating(false);
          return;
        }
      } else if (shouldUsePhoto && userPhoto) {
        // [2] 이미지 편집 (내 사진만)
        result = await editFashionImage(userPhoto, aiPrompt);
      } else {
        // [3] 이미지 생성 (텍스트만)
        result = await generateFashionImage(aiPrompt);
      }
      
      if (result) {
        setGeneratedImage(result);
      } else {
        // geminiService에서 로그를 찍었으므로 여기선 간단히 알림
        alert("이미지를 생성하지 못했습니다. (AI가 이미지를 반환하지 않음)");
      }
    } catch (error: any) {
      console.error("AI 이미지 생성 오류:", error);
      
      let errorMessage = error?.message || error?.toString() || "알 수 없는 오류";
      
      // 구글 API의 JSON 형태 에러 메시지 파싱 시도
      if (errorMessage.includes('{"error"')) {
        try {
          const errorObj = JSON.parse(errorMessage);
          if (errorObj.error) {
            errorMessage = errorObj.error.message || errorMessage;
          }
        } catch (e) {
          // 파싱 실패 시 원본 사용
        }
      }
      
      // 할당량(Quota) 초과 에러 처리
      if (errorMessage.includes('할당량') || errorMessage.includes('quota') || errorMessage.includes('429') || error?.code === 429) {
        if (errorMessage.includes('⚠️')) {
          // geminiService에서 이미 포맷팅한 메시지라면 그대로 출력
          alert(errorMessage);
        } else {
          alert(`⚠️ API 할당량 초과\n\n무료 티어의 할당량이 초과되었습니다.\n잠시 기다린 후 다시 시도하거나, 유료 플랜을 고려해주세요.\n\n상세: ${errorMessage}`);
        }
      } else {
        // 일반 에러
        alert(`오류가 발생했습니다:\n\n${errorMessage}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    userPhoto,
    isPhotoSheetOpen,
    setIsPhotoSheetOpen,
    aiPrompt,
    setAiPrompt,
    generatedImage,
    isGenerating,
    useMyPhoto,
    isCartSelectorOpen,
    setIsCartSelectorOpen,
    galleryInputRef,
    cameraInputRef,
    aiStudioFileRef,
    handlePhotoSelect,
    handleAiGeneration,
  };
};