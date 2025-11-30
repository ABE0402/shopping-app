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
      const shouldUsePhoto = useMyPhoto || userPhoto !== null;

      // 기본 프롬프트 설정 (사용자 입력이 없으면 자동 생성)
      const defaultPrompt = cartItem && userPhoto 
        ? "자연스럽고 현실적인 가상 피팅 이미지를 생성해주세요."
        : userPhoto 
        ? "이미지를 자연스럽게 편집해주세요."
        : "고품질의 패션 이미지를 생성해주세요.";
      
      const finalPrompt = aiPrompt.trim() || defaultPrompt;

      if (shouldUsePhoto && userPhoto && cartItem) {
        try {
          const productBase64 = await urlToBase64(cartItem.image);
          result = await tryOnFashionItem(userPhoto, productBase64, finalPrompt);
        } catch (e: any) {
          console.error("Image conversion failed", e);
          const errorMessage = e?.message || "상품 이미지를 불러오는데 실패했습니다.";
          alert(errorMessage);
          setIsGenerating(false);
          return;
        }
      } else if (shouldUsePhoto && userPhoto) {
        result = await editFashionImage(userPhoto, finalPrompt);
      } else {
        result = await generateFashionImage(finalPrompt);
      }
      
      if (result) {
        setGeneratedImage(result);
      } else {
        // result가 null인 경우는 이미 catch 블록에서 처리되어야 함
        // 하지만 혹시 모를 경우를 대비해 에러 throw
        throw new Error("이미지 생성에 실패했습니다. 결과를 받지 못했습니다.");
      }
    } catch (error: any) {
      console.error("AI 이미지 생성 오류:", error);
      
      let errorMessage = error?.message || error?.toString() || "알 수 없는 오류";
      
      // JSON 형태의 에러 메시지 파싱
      if (typeof errorMessage === 'string' && errorMessage.includes('{"error"')) {
        try {
          const errorObj = JSON.parse(errorMessage);
          if (errorObj.error) {
            errorMessage = errorObj.error.message || errorMessage;
          }
        } catch (e) {
          // JSON 파싱 실패 시 원본 메시지 사용
        }
      }
      
      // 할당량 초과 오류 처리
      const isQuotaError = errorMessage.includes('할당량') || 
                           errorMessage.includes('quota') || 
                           errorMessage.includes('429') || 
                           error?.code === 429 ||
                           error?.status === 'RESOURCE_EXHAUSTED' ||
                           (error?.error && (error.error.code === 429 || error.error.status === 'RESOURCE_EXHAUSTED'));
      
      if (isQuotaError) {
        // 이미 포맷된 메시지인 경우 그대로 사용 (⚠️ 포함)
        if (errorMessage.includes('⚠️')) {
          alert(errorMessage);
        } else {
          // 할당량 초과 안내 메시지
          alert(`⚠️ API 할당량 초과

현재 API 키의 할당량이 모두 소진되었습니다.

📊 상황:
- 모든 모델에서 할당량 초과 오류 발생
- 무료 티어의 일일/월별 할당량이 소진됨

💡 해결 방법 (우선순위):
1. ⭐ 결제 정보 추가 (가장 확실한 방법)
   → Google Cloud Console: https://console.cloud.google.com/billing
   → 프로젝트에 결제 계정 연결
   → 유료 플랜으로 전환되어 할당량 제한 해소
   → 즉시 사용 가능

2. 할당량 리셋 대기
   → 무료 티어는 일일/월별로 리셋됩니다
   → 사용량 확인: https://ai.dev/usage?tab=rate-limit
   → 리셋 시간 확인 후 재시도

3. 다른 Google 계정으로 새 API 키 발급
   → Google AI Studio: https://aistudio.google.com/apikey
   → 다른 계정으로 로그인
   → 새 API 키 생성

⚠️ 중요: 
- 이미지 생성 기능은 많은 할당량을 소모합니다
- 무료 티어는 제한적이므로 유료 플랜을 권장합니다
- 결제 정보를 추가하면 즉시 사용 가능합니다`);
        }
      } else {
        // 다른 오류인 경우
        alert(`오류가 발생했습니다:\n\n${errorMessage}\n\n콘솔을 확인해주세요.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    userPhoto,
    isPhotoSheetOpen,
    setIsPhotoSheetOpen,
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

