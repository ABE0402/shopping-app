import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const getApiKey = () => {
  // .env 파일에서 API 키를 가져옵니다.
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("Gemini API 키가 .env 파일에 설정되지 않았습니다.");
    // 사용자에게 명확한 오류를 표시하기 위해 여기서 에러를 던질 수 있습니다.
    // throw new Error("API 키가 설정되지 않았습니다.");
  }
  return apiKey;
};

const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey || apiKey.length < 10) throw new Error('유효하지 않은 API 키입니다.');
  return new GoogleGenAI({ apiKey });
};

export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    // 로컬 이미지와 외부 URL 모두 처리
    const fetchUrl = url.startsWith('/') ? window.location.origin + url : url;
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`이미지 다운로드 실패: ${response.statusText}`);
    }
    const blob = await response.blob();
    return await blobToBase64(blob);
  } catch (error) {
    console.error("urlToBase64 변환 실패:", error);
    throw new Error("이미지를 Base64로 변환하는 데 실패했습니다.");
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Gemini API를 직접 호출하여 이미지를 생성하는 핵심 함수
 */
const runGenAI = async (prompt: string, inputImages: { mime: string, data: string }[] = []) => {
  const ai = getAI();
  // 이미지 생성/편집을 지원하는 최신 모델 사용
  const model = 'gemini-1.5-pro-latest';

  try {
    console.log(`🚀 AI 요청 시작 (Model: ${model})`);

    const parts: any[] = inputImages.map(img => ({
      inlineData: {
        mimeType: img.mime,
        data: img.data.includes('base64,') ? img.data.split('base64,')[1] : img.data
      }
    }));

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      // 안전 설정을 완화하여 부적절하지 않은 콘텐츠가 차단되는 것을 방지
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    });

    // 응답에서 이미지 데이터를 찾아 반환
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log("🎉 이미지 생성 성공!");
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    const textResponse = response.candidates?.[0]?.content?.parts?.[0]?.text;
    console.warn("⚠️ AI가 이미지를 반환하지 않고 텍스트를 응답했습니다:", textResponse);
    throw new Error("AI가 이미지를 생성하지 못했습니다. 프롬프트를 수정하거나 다른 이미지를 사용해보세요.");

  } catch (e: any) {
    console.error("AI 요청 실패:", e);
    if (e.message?.includes('429') || e.status === 'RESOURCE_EXHAUSTED') {
      throw new Error("API 사용량이 너무 많습니다. 잠시 후 다시 시도해주세요.");
    }
    throw e;
  }
};

export const generateFashionImage = async (prompt: string): Promise<string | null> => {
  return await runGenAI(prompt);
};

export const editFashionImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("잘못된 이미지 형식입니다.");
  return await runGenAI(prompt, [{ mime: matches[1], data: matches[2] }]);
};

export const tryOnFashionItem = async (userImageBase64: string, productImageBase64: string, prompt: string): Promise<string | null> => {
  const userMatches = userImageBase64.match(/^data:(.+);base64,(.+)$/);
  const productMatches = productImageBase64.match(/^data:(.+);base64,(.+)$/);
  if (!userMatches || !productMatches) throw new Error("잘못된 이미지 형식입니다.");

  const fullPrompt = `[Instruction] You are a professional fashion photo editor. Generate a single, high-quality, photorealistic fashion image.
                   The first image is the reference person (User). 
                   The second image is the clothing item (Product). 
                   
                   Task: Visualize the person from the first image wearing the clothing item from the second image. 
                   - CRITICAL: Maintain the person's pose, body shape, and facial features from the first image. Do not change the person.
                   - CRITICAL: Preserve the original background from the user's photo.
                   - Adapt the clothing item to fit the person naturally.
                   - ${prompt}`;

  return await runGenAI(fullPrompt, [
    { mime: userMatches[1], data: userMatches[2] },
    { mime: productMatches[1], data: productMatches[2] }
  ]);
};

// 검색 기능 (유지)
export const searchProductsWithAI = async (query: string, allProducts: Product[]): Promise<number[]> => {
  try {
    const ai = getAI();
    const productCatalog = allProducts.map(p => `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro-latest",
      contents: { parts: [{ text: `Catalog:\n${productCatalog}\nQuery: "${query}"\nFind IDs. JSON: {"matchedIds": []}` }] },
      config: { responseMimeType: "application/json" }
    });
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText).matchedIds || [];
  } catch (error) {
    console.error("AI 검색 실패:", error);
    return [];
  }
};