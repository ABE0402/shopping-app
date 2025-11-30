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
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      let result;
      const cartItem = selectedCartItemId ? cartItems.find(i => i.id === selectedCartItemId) : null;
      const shouldUsePhoto = useMyPhoto || userPhoto !== null;

      if (shouldUsePhoto && userPhoto && cartItem) {
        try {
          const productBase64 = await urlToBase64(cartItem.image);
          result = await tryOnFashionItem(userPhoto, productBase64, aiPrompt);
        } catch (e) {
          console.error("Image conversion failed", e);
          alert("상품 이미지를 불러오는데 실패했습니다. (CORS 보안 정책)");
          setIsGenerating(false);
          return;
        }
      } else if (shouldUsePhoto && userPhoto) {
        result = await editFashionImage(userPhoto, aiPrompt);
      } else {
        result = await generateFashionImage(aiPrompt);
      }
      
      if (result) {
        setGeneratedImage(result);
      } else {
        alert("이미지를 생성하지 못했습니다. 다시 시도해주세요.");
      }
    } catch (error: any) {
      console.error("AI 이미지 생성 오류:", error);
      
      let errorMessage = error?.message || error?.toString() || "알 수 없는 오류";
      
      if (errorMessage.includes('{"error"')) {
        try {
          const errorObj = JSON.parse(errorMessage);
          if (errorObj.error) {
            errorMessage = errorObj.error.message || errorMessage;
          }
        } catch (e) {
          // JSON 파싱 실패 시 원본 메시지 사용
        }
      }
      
      if (errorMessage.includes('할당량') || errorMessage.includes('quota') || errorMessage.includes('429') || error?.code === 429) {
        if (errorMessage.includes('⚠️')) {
          alert(errorMessage);
        } else {
          alert(`⚠️ API 할당량 초과\n\n무료 티어의 할당량이 초과되었습니다.\n\n${errorMessage}\n\n잠시 기다린 후 다시 시도하거나, 유료 플랜을 고려해주세요.`);
        }
      } else {
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

