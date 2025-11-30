import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

const getApiKey = () => {
  // Vite 환경 변수 지원 - 여러 소스에서 API 키 찾기
  // 1. import.meta.env (Vite 기본 방식)
  // 2. process.env (vite.config.ts의 define을 통해 주입)
  // 3. window 객체 (런타임 설정용)
  const apiKey = 
    (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__) ||
    import.meta.env.VITE_GEMINI_API_KEY || 
    import.meta.env.GEMINI_API_KEY ||
    (typeof process !== 'undefined' && (process as any).env?.GEMINI_API_KEY) ||
    (typeof process !== 'undefined' && (process as any).env?.API_KEY) ||
    '';
  
  console.log('API Key check:', {
    hasWindowKey: typeof window !== 'undefined' && !!(window as any).__GEMINI_API_KEY__,
    hasViteKey: !!import.meta.env.VITE_GEMINI_API_KEY,
    hasMetaKey: !!import.meta.env.GEMINI_API_KEY,
    hasProcessKey: typeof process !== 'undefined' && !!(process as any).env?.GEMINI_API_KEY,
    keyLength: apiKey ? apiKey.length : 0,
    keyPreview: apiKey ? `${apiKey.substring(0, 15)}...` : 'empty',
    keyValid: apiKey && apiKey.length > 20 && apiKey !== 'your_api_key_here'
  });
  
  return apiKey;
};

/**
 * 사용 가능한 이미지 생성 모델 목록 가져오기
 */
const getAvailableImageModels = async (ai: any): Promise<string[]> => {
  try {
    // 실제 사용 가능한 모델 목록을 가져오려고 시도
    // 하지만 API가 이를 지원하지 않을 수 있으므로, 알려진 모델 목록 반환
    return [
      'gemini-2.0-flash-exp',           // 실험적 모델
      'gemini-2.0-flash-thinking-exp',  // 실험적 모델
      'gemini-1.5-flash',              // 텍스트 모델 (이미지 생성 지원 여부 확인 필요)
      'gemini-2.5-flash'               // 최신 모델
    ];
  } catch (error) {
    console.warn('모델 목록을 가져올 수 없습니다:', error);
    return [];
  }
};

const getAI = () => {
  const apiKey = getApiKey();
  
  // API 키가 없거나 placeholder인 경우
  if (!apiKey || apiKey === 'your_api_key_here' || apiKey.trim() === '') {
    const errorMsg = `
⚠️ Gemini API 키가 설정되지 않았습니다!

해결 방법:
1. https://aistudio.google.com/apikey 에서 API 키를 발급받으세요
2. 프로젝트 루트의 .env 파일을 열고 다음을 수정하세요:
   GEMINI_API_KEY=발급받은_실제_API_키

3. 개발 서버를 재시작하세요 (Ctrl+C 후 npm run dev)

현재 API 키 상태: ${apiKey ? `"${apiKey.substring(0, 20)}..." (유효하지 않음)` : '없음'}
    `;
    console.error(errorMsg);
    throw new Error('GEMINI_API_KEY가 설정되지 않았거나 유효하지 않습니다. .env 파일을 확인하고 개발 서버를 재시작해주세요.');
  }
  
  // API 키가 너무 짧으면 유효하지 않을 가능성이 높음
  if (apiKey.length < 20) {
    console.warn('⚠️ API 키가 너무 짧습니다. 유효한 API 키인지 확인해주세요.');
  }
  
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper to convert an image URL to a Base64 string.
 * Note: This relies on the image server allowing CORS.
 */
export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to Base64:", error);
    throw new Error("이미지를 변환하는데 실패했습니다.");
  }
};

/**
 * Uses Gemini to interpret a user's natural language query and map it to product IDs.
 * e.g., "데이트할 때 입기 좋은 옷" -> Returns IDs of coats, shirts, slacks.
 */
export const searchProductsWithAI = async (query: string, allProducts: Product[]): Promise<number[]> => {
  try {
    const ai = getAI();
    // Create a simplified product catalog string for the model to analyze
    const productCatalog = allProducts.map(p => 
      `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Price: ${p.price}`
    ).join('\n');

    const prompt = `
      You are a smart fashion shopping assistant. 
      Analyze the User Query and select the Product IDs from the provided Product Catalog that best match the query.
      Consider the occasion, style, weather, and gender implied by the query.
      
      Product Catalog:
      ${productCatalog}

      User Query: "${query}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedIds: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: "Array of matching product IDs"
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{ "matchedIds": [] }');
    return result.matchedIds || [];

  } catch (error) {
    console.error("Gemini AI Search Error:", error);
    return []; // Return empty if error
  }
};

/**
 * Generates a fashion image based on a text prompt using Nano Banana (gemini-2.5-flash-image).
 */
export const generateFashionImage = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    console.log("Generating image with prompt:", prompt);
    console.log("Using model: gemini-2.5-flash-image");
    
    // 무료 티어에서 사용 가능한 모델 시도
    // 참고: 이미지 생성 모델은 실제로는 텍스트 모델과 다른 API를 사용할 수 있습니다
    const modelOptions = [
      'gemini-2.0-flash-exp',           // 실험적 모델 (무료 티어에서 사용 가능할 수 있음)
      'gemini-2.0-flash-thinking-exp',  // 실험적 모델
      'gemini-1.5-flash',              // 안정적인 모델
      'gemini-2.5-flash',               // 최신 모델
      'gemini-2.0-flash-exp-image-generation',  // 이미지 생성 전용 (존재 여부 확인 필요)
      'gemini-2.0-flash-image',                 // 대안
      'gemini-1.5-flash-image',                 // 대안
      'gemini-2.5-flash-image'                  // 원본 (fallback)
    ];
    
    let lastError: any = null;
    
    for (const model of modelOptions) {
      try {
        console.log(`Trying model: ${model}`);
        const response = await ai.models.generateContent({
          model: model,
          contents: {
            parts: [{ text: prompt }]
          }
        });
        
        console.log(`✅ Success with model: ${model}`);
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      } catch (error: any) {
        const errorMsg = error?.message || error?.toString() || '알 수 없는 오류';
        const errorCode = error?.code || error?.status;
        console.log(`❌ Model ${model} failed:`, {
          model,
          code: errorCode,
          message: errorMsg.substring(0, 150),
          isQuotaError: errorCode === 429 || error?.status === 'RESOURCE_EXHAUSTED',
          isNotFound: errorCode === 400 && errorMsg.includes('not found')
        });
        lastError = error;
        
        // 모델이 존재하지 않는 경우 (400 에러) 다음 모델 시도
        if (errorCode === 400 && (errorMsg.includes('not found') || errorMsg.includes('Invalid model'))) {
          console.log(`   → Model ${model} does not exist, trying next...`);
          continue;
        }
        
        // 할당량 오류면 다음 모델 시도
        if (errorCode === 429 || error?.status === 'RESOURCE_EXHAUSTED') {
          console.log(`   → Quota exceeded for ${model}, trying next...`);
          continue;
        }
        
        // 다른 오류면 다음 모델 시도
        continue;
      }
    }
    
    // 모든 모델 실패 시 마지막 에러 throw
    if (lastError) {
      throw lastError;
    }

    console.log("Response received:", response);
    console.log("Candidates:", response.candidates);

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log("Found inline data, returning image");
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    console.warn("No inline data found in response");
    return null;
  } catch (error: any) {
    console.error("Nano Banana Generation Error:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      stack: error?.stack
    });
    
    // 할당량 초과 오류 처리
    if (error?.status === 'RESOURCE_EXHAUSTED' || error?.code === 429) {
      const retryDelay = error?.details?.find((d: any) => d['@type']?.includes('RetryInfo'))?.retryDelay || '약 1분';
      throw new Error(`이미지 생성 실패: API 할당량 초과\n\n${retryDelay} 후 다시 시도해주세요.\n사용량 확인: https://ai.dev/usage?tab=rate-limit`);
    }
    
    throw new Error(`이미지 생성 실패: ${error?.message || error?.toString() || '알 수 없는 오류'}`);
  }
};

/**
 * Edits an existing image based on a text prompt using Nano Banana (gemini-2.5-flash-image).
 */
export const editFashionImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    // Extract pure base64 and mime type
    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid image format");

    const mimeType = matches[1];
    const data = matches[2];

    console.log("Editing image with prompt:", prompt);

    // 무료 티어에서 사용 가능한 모델 시도
    const modelOptions = [
      'gemini-2.0-flash-exp-image-generation',  // 최신 무료 모델
      'gemini-2.0-flash-image',                 // 대안 1
      'gemini-1.5-flash-image',                 // 대안 2
      'gemini-2.5-flash-image'                  // 원본 (fallback)
    ];
    
    let lastError: any = null;
    
    for (const model of modelOptions) {
      try {
        console.log(`Trying model: ${model} for edit`);
        const response = await ai.models.generateContent({
          model: model,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: data
                }
              },
              { text: prompt }
            ]
          }
        });
        
        console.log(`✅ Success with model: ${model}`);
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      } catch (error: any) {
        const errorMsg = error?.message || error?.toString() || '알 수 없는 오류';
        const errorCode = error?.code || error?.status;
        console.log(`❌ Model ${model} failed:`, {
          model,
          code: errorCode,
          message: errorMsg.substring(0, 150),
          isQuotaError: errorCode === 429 || error?.status === 'RESOURCE_EXHAUSTED',
          isNotFound: errorCode === 400 && errorMsg.includes('not found')
        });
        lastError = error;
        
        // 모델이 존재하지 않는 경우 (400 에러) 다음 모델 시도
        if (errorCode === 400 && (errorMsg.includes('not found') || errorMsg.includes('Invalid model'))) {
          console.log(`   → Model ${model} does not exist, trying next...`);
          continue;
        }
        
        // 할당량 오류면 다음 모델 시도
        if (errorCode === 429 || error?.status === 'RESOURCE_EXHAUSTED') {
          console.log(`   → Quota exceeded for ${model}, trying next...`);
          continue;
        }
        
        // 다른 오류면 다음 모델 시도
        continue;
      }
    }
    
    // 모든 모델 실패 시 마지막 에러 throw
    if (lastError) {
      throw lastError;
    }
    
    return null;
  } catch (error: any) {
    console.error("Nano Banana Edit Error:", error);
    
    // 할당량 초과 오류 처리
    if (error?.status === 'RESOURCE_EXHAUSTED' || error?.code === 429) {
      const retryDelay = error?.details?.find((d: any) => d['@type']?.includes('RetryInfo'))?.retryDelay || '약 1분';
      throw new Error(`이미지 편집 실패: API 할당량 초과\n\n${retryDelay} 후 다시 시도해주세요.\n사용량 확인: https://ai.dev/usage?tab=rate-limit`);
    }
    
    throw new Error(`이미지 편집 실패: ${error?.message || error?.toString() || '알 수 없는 오류'}`);
  }
};

/**
 * Combines a user photo and a product image to generate a "Try On" visualization.
 */
/**
 * Helper function to wait for a specified number of seconds
 */
const wait = (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

/**
 * Combines a user photo and a product image to generate a "Try On" visualization.
 * Includes automatic retry logic for quota errors.
 */
export const tryOnFashionItem = async (userImageBase64: string, productImageBase64: string, prompt: string, retryCount = 0): Promise<string | null> => {
  const MAX_RETRIES = 2;
  
  try {
    const ai = getAI();
    // Process User Image
    const userMatches = userImageBase64.match(/^data:(.+);base64,(.+)$/);
    if (!userMatches) throw new Error("Invalid user image format");
    
    // Process Product Image (Assuming it might come in as full data URI or needs cleaning)
    // If it's passed from urlToBase64, it is a full Data URI.
    const productMatches = productImageBase64.match(/^data:(.+);base64,(.+)$/);
    if (!productMatches) throw new Error("Invalid product image format");

    console.log("Try-on with prompt:", prompt);

    // 무료 티어에서 사용 가능한 모델 시도
    // 참고: 이미지 생성은 실제로는 특별한 엔드포인트를 사용할 수 있습니다
    const modelOptions = [
      'gemini-2.0-flash-exp',           // 실험적 모델 (무료 티어에서 사용 가능할 수 있음)
      'gemini-2.0-flash-thinking-exp',  // 실험적 모델
      'gemini-1.5-flash',              // 안정적인 모델
      'gemini-2.5-flash',               // 최신 모델
      'gemini-2.0-flash-exp-image-generation',  // 이미지 생성 전용
      'gemini-2.0-flash-image',                 // 대안
      'gemini-1.5-flash-image',                 // 대안
      'gemini-2.5-flash-image'                  // 원본 (fallback)
    ];
    
    let lastError: any = null;
    
    for (const model of modelOptions) {
      try {
        console.log(`🔄 Trying model: ${model} for try-on`);
        const response = await ai.models.generateContent({
          model: model,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: userMatches[1],
                  data: userMatches[2]
                }
              },
              {
                inlineData: {
                  mimeType: productMatches[1],
                  data: productMatches[2]
                }
              },
              { text: `[Instruction] Generate a high-quality photorealistic fashion image. 
                       The first image is the reference person (User). 
                       The second image is the clothing item (Product). 
                       
                       Task: Visualize the person from the first image wearing the clothing item from the second image. 
                       - Maintain the person's pose, body shape, and facial features from the first image.
                       - Adapt the clothing item to fit the person naturally.
                       - ${prompt}` }
            ]
          }
        });
        
        console.log(`✅ Success with model: ${model}`);
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      } catch (error: any) {
        const errorMsg = error?.message || error?.toString() || '알 수 없는 오류';
        const errorCode = error?.code || error?.status;
        console.log(`❌ Model ${model} failed:`, {
          model,
          code: errorCode,
          message: errorMsg.substring(0, 150),
          isQuotaError: errorCode === 429 || error?.status === 'RESOURCE_EXHAUSTED',
          isNotFound: errorCode === 400 && errorMsg.includes('not found')
        });
        lastError = error;
        
        // 모델이 존재하지 않는 경우 (400 에러) 다음 모델 시도
        if (errorCode === 400 && (errorMsg.includes('not found') || errorMsg.includes('Invalid model'))) {
          console.log(`   → Model ${model} does not exist, trying next...`);
          continue;
        }
        
        // 할당량 오류면 다음 모델 시도
        if (errorCode === 429 || error?.status === 'RESOURCE_EXHAUSTED') {
          console.log(`   → Quota exceeded for ${model}, trying next...`);
          continue;
        }
        
        // 다른 오류면 다음 모델 시도
        continue;
      }
    }
    
    // 모든 모델 실패 시 마지막 에러 throw
    if (lastError) {
      throw lastError;
    }

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Nano Banana Try-On Error:", error);
    
    // 할당량 초과 오류 처리
    if (error?.status === 'RESOURCE_EXHAUSTED' || error?.code === 429) {
      // RetryInfo에서 재시도 시간 추출
      const retryInfo = error?.details?.find((d: any) => d['@type']?.includes('RetryInfo'));
      const retryDelaySeconds = retryInfo?.retryDelay ? parseFloat(retryInfo.retryDelay.replace('s', '')) : 60;
      const retryDelayMinutes = Math.ceil(retryDelaySeconds / 60);
      const retryDelay = retryDelaySeconds < 60 ? `${Math.ceil(retryDelaySeconds)}초` : `${retryDelayMinutes}분`;
      
      // 자동 재시도 (최대 2회) - 단, 할당량이 0이 아닌 경우에만
      // 할당량이 0인 경우 재시도해도 의미가 없으므로 바로 에러 반환
      const hasZeroLimit = error?.details?.some((d: any) => 
        d['@type']?.includes('QuotaFailure') && 
        d.violations?.some((v: any) => v.quotaDimensions?.limit === 0)
      ) || error?.message?.includes('limit: 0');
      
      if (!hasZeroLimit && retryCount < MAX_RETRIES) {
        console.log(`⚠️ 할당량 초과. ${retryDelaySeconds}초 후 자동 재시도... (${retryCount + 1}/${MAX_RETRIES})`);
        await wait(Math.min(retryDelaySeconds, 60)); // 최대 60초까지만 대기
        return tryOnFashionItem(userImageBase64, productImageBase64, prompt, retryCount + 1);
      }
      
      if (hasZeroLimit) {
        console.warn('⚠️ 할당량이 0으로 설정되어 있어 재시도해도 실패할 것입니다.');
      }
      
      const errorMsg = `
⚠️ API 할당량 초과 - 결제 정보 필요

무료 티어의 할당량이 소진되었고, 결제 정보가 없어 유료 플랜으로 전환할 수 없습니다.

📊 현재 상태:
- 모델: gemini-2.5-flash-preview-image
- 할당량: limit: 0 (무료 티어 소진)
- 결제 설정: 사용할 수 없음
- 재시도 가능 시간: 약 ${retryDelay} 후

💡 해결 방법 (우선순위):
1. ⭐ 결제 정보 추가 (권장)
   - Google Cloud Console 접속: https://console.cloud.google.com/billing
   - 프로젝트에 결제 계정 연결
   - 유료 플랜으로 자동 전환되어 할당량 제한 해소

2. 할당량 리셋 대기
   - 무료 티어는 일일/월별로 리셋됨
   - ${retryDelay} 후 다시 시도 (자동 재시도 시도됨)

3. 사용량 확인
   - Google AI Studio: https://ai.dev/usage?tab=rate-limit

⚠️ 중요: 결제 정보가 없으면 무료 티어 할당량 소진 후 더 이상 사용할 수 없습니다.
      `;
      console.error(errorMsg);
      
      // 사용자 친화적인 에러 메시지
      const userMessage = `⚠️ API 할당량 초과 - 결제 정보 필요

무료 티어 할당량이 소진되었고, 결제 정보가 없어 유료 플랜으로 전환할 수 없습니다.

해결 방법:
1. 결제 정보 추가 (권장): https://console.cloud.google.com/billing
2. ${retryDelay} 후 다시 시도
3. 사용량 확인: https://ai.dev/usage?tab=rate-limit

참고: 결제 정보를 추가하면 유료 플랜으로 전환되어 할당량 제한이 해소됩니다.`;
      
      throw new Error(userMessage);
    }
    
    // API 키 관련 오류인 경우 더 명확한 메시지 제공
    if (error?.message?.includes('API key') || error?.message?.includes('API_KEY') || error?.code === 400) {
      const apiKey = getApiKey();
      const errorDetails = {
        error: error?.message || error?.toString(),
        apiKeyStatus: apiKey ? (apiKey === 'your_api_key_here' ? 'placeholder (유효하지 않음)' : `설정됨 (길이: ${apiKey.length})`) : '없음',
        solution: '1. .env 파일에 실제 API 키를 설정하세요\n2. 개발 서버를 재시작하세요\n3. https://aistudio.google.com/apikey 에서 API 키를 발급받으세요'
      };
      console.error('API 키 오류 상세:', errorDetails);
      throw new Error(`가상 피팅 실패: API 키가 유효하지 않습니다.\n\n${errorDetails.solution}`);
    }
    
    throw new Error(`가상 피팅 실패: ${error?.message || error?.toString() || '알 수 없는 오류'}`);
  }
};