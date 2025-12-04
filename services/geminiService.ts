import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

// ✅ 1. API 키 설정
const getApiKey = () => {
  // Vite 환경 변수 지원 - 여러 소스에서 API 키 찾기
  const apiKey = 
    import.meta.env.VITE_GEMINI_API_KEY || 
    import.meta.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    "AIzaSyASManCGTuek3Wbjavu_Vv14YS7r5ctslA"; // 기본값 (사용자가 제공한 키)
  
  if (!apiKey || apiKey.length < 10) {
    throw new Error('API 키가 설정되지 않았습니다. .env 파일에 VITE_GEMINI_API_KEY를 설정해주세요.');
  }
  
  return apiKey;
};

const getAI = () => {
  const apiKey = getApiKey();
  return new GoogleGenAI({ apiKey });
};

// ✅ 이미지 URL을 Base64로 변환
export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    if (url.startsWith('/')) {
      const response = await fetch(window.location.origin + url);
      return await blobToBase64(await response.blob());
    }
    
    try {
      const response = await fetch(url);
      return await blobToBase64(await response.blob());
    } catch (e) {
      return await convertImageViaCanvas(url);
    }
  } catch (error: any) {
    console.error("Error converting URL to Base64:", error);
    const errorMessage = error?.message || "이미지를 변환하는데 실패했습니다.";
    throw new Error(errorMessage);
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

const convertImageViaCanvas = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('캔버스 변환 실패'));
  });
};

// ✅ 2. 핵심 수정: runGenAI 함수 (Imagen 스타일)
const runGenAI = async (prompt: string, inputImages: {mime: string, data: string}[] = []) => {
  const ai = getAI();
  
  // 2.0 모델이 그나마 멀티모달(이미지+텍스트) 입력 후 이미지 생성을 지원합니다.
  const model = 'gemini-2.0-flash-exp'; 
  
  try {
    console.log(`🚀 AI 요청 시작 (Model: ${model})`);
    
    const parts: any[] = inputImages.map(img => ({
      inlineData: { 
        mimeType: img.mime, 
        // 데이터에 'base64,' 헤더가 붙어있으면 제거 (중복 방지)
        data: img.data.includes('base64,') ? img.data.split('base64,')[1] : img.data 
      }
    }));
    
    // 프롬프트에 "이미지만 줘!"라고 강력하게 명시
    parts.push({ 
      text: `${prompt}\n\nCRITICAL: You must generate an image, not text. Output ONLY the generated image as inlineData with mimeType and base64 data. Do not provide any text description, explanation, or refusal.` 
    });
    
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        // 이 설정이 중요합니다! (텍스트랑 이미지 둘 다 받을 수 있게)
        responseModalities: ["IMAGE", "TEXT"], 
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ] as any
      }
    });
    
    // 결과 확인
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log("🎉 이미지 생성 성공!");
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("⚠️ AI 텍스트 응답:", text);
    
    // 만약 텍스트로 "못한다"고 하면 에러 처리
    throw new Error("AI가 이미지 생성을 거부했습니다. (인물 사진 안전 정책)");
  } catch (e: any) {
    console.error("AI 요청 실패:", e);
    if (e.message?.includes('429')) {
      throw new Error("잠시 사용량이 많습니다. 10초 뒤 시도해주세요.");
    }
    throw e;
  }
};

// ✅ 3. 내보내기 함수들
export const generateFashionImage = async (prompt: string): Promise<string | null> => {
  return await runGenAI(prompt);
};

export const editFashionImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("이미지 형식 오류");
  return await runGenAI(prompt, [{ mime: matches[1], data: matches[2] }]);
};

export const tryOnFashionItem = async (
  userImageBase64: string, 
  productImageBase64: string, 
  prompt: string
): Promise<string | null> => {
  const userMatches = userImageBase64.match(/^data:(.+);base64,(.+)$/);
  const productMatches = productImageBase64.match(/^data:(.+);base64,(.+)$/);
  
  if (!userMatches || !productMatches) {
    throw new Error("이미지 형식 오류");
  }
  
  // 옷만 정확히 교체하고 나머지는 그대로 유지하는 프롬프트
  const fullPrompt = `CLOTHING REPLACEMENT ONLY - Virtual Try-On.

TASK: Replace ONLY the clothing in the first image (person photo) with the clothing from the second image (product photo). Keep EVERYTHING ELSE exactly the same.

ABSOLUTE REQUIREMENTS - DO NOT CHANGE:
1. PERSON (100% PRESERVE):
   - Keep the EXACT same face, facial features, expression, and identity
   - Maintain the EXACT same pose, body position, and stance
   - Preserve the EXACT same body shape, proportions, and physical characteristics
   - Keep the EXACT same skin tone, hair color, and hair style
   - Maintain the EXACT same hands, arms, legs position

2. BACKGROUND (100% PRESERVE):
   - Keep the EXACT same background from the first image
   - Do NOT change, modify, or recreate the background
   - Maintain the EXACT same lighting, shadows, and environment

3. PHOTOGRAPHY STYLE (100% PRESERVE):
   - Keep the EXACT same camera angle and perspective
   - Maintain the EXACT same lighting conditions and direction
   - Preserve the EXACT same image quality, resolution, and style

ONLY CHANGE:
- Replace ONLY the clothing/garment visible in the first image
- Use the clothing design, color, pattern, and style from the second image
- Make the new clothing fit naturally on the person's body
- Ensure the clothing matches the person's pose and body shape
- Add realistic shadows and highlights that match the original lighting

CRITICAL: This is a CLOTHING REPLACEMENT task, NOT image generation. The output should look like the first image with ONLY the clothing changed. Everything else must remain identical.

ADDITIONAL INSTRUCTIONS: ${prompt}

OUTPUT: Generate ONLY the image with clothing replaced. Do not provide any text description.`;
  
  return await runGenAI(fullPrompt, [
    { mime: userMatches[1], data: userMatches[2] },
    { mime: productMatches[1], data: productMatches[2] }
  ]);
};

// ✅ 검색 기능 (유지)
export const searchProductsWithAI = async (query: string, allProducts: Product[]): Promise<number[]> => {
  try {
    const ai = getAI();
    const productCatalog = allProducts.map(p => 
      `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Price: ${p.price}`
    ).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: { 
        parts: [{ 
          text: `You are a smart fashion shopping assistant. 
Analyze the User Query and select the Product IDs from the provided Product Catalog that best match the query.

Product Catalog:
${productCatalog}

User Query: "${query}"

Return JSON format: {"matchedIds": [1, 2, 3]}` 
        }] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object" as any,
          properties: {
            matchedIds: {
              type: "array" as any,
              items: { type: "integer" as any },
              description: "Array of matching product IDs"
            }
          }
        }
      }
    });
    
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanText = text.replace(/```json|```/g, '').trim(); 
    const result = JSON.parse(cleanText);
    return result.matchedIds || [];
  } catch (error) {
    console.error("Gemini AI Search Error:", error);
    return [];
  }
};
