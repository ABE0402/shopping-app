import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

// ✅ 1. API 키 설정
const getApiKey = () => {
  const apiKey = "AIzaSyASManCGTuek3Wbjavu_Vv14YS7r5ctslA"; 
  console.log("🔥 Paid API Key Active:", apiKey);
  return apiKey;
};

const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey || apiKey.length < 10) throw new Error('API 키 오류');
  return new GoogleGenAI({ apiKey });
};

// ... (urlToBase64, blobToBase64, convertImageViaCanvas 함수는 기존 그대로 유지) ...
// (위의 3개 함수는 코드가 길어서 생략했습니다. 기존 코드를 그대로 두세요!)
export const urlToBase64 = async (url: string): Promise<string> => {
    /* 기존 코드 유지 */
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
    } catch (error) {
        throw new Error("이미지 변환 실패");
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
            resolve(canvas.toDataURL('image/png').split(',')[1]);
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
        parts.push({ text: `${prompt}\n\nStrict Instruction: Generate a high-quality image based on the inputs. Do not provide any text description. Output ONLY the generated image.` });

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
        if (e.message?.includes('429')) throw new Error("잠시 사용량이 많습니다. 10초 뒤 시도해주세요.");
        throw e;
    }
};

// ... (아래 내보내기 함수들은 기존과 동일) ...
export const generateFashionImage = async (prompt: string): Promise<string | null> => {
    return await runGenAI(prompt);
};

export const editFashionImage = async (base64Image: string, prompt: string): Promise<string | null> => {
    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) throw new Error("이미지 형식 오류");
    return await runGenAI(prompt, [{ mime: matches[1], data: matches[2] }]);
};

export const tryOnFashionItem = async (userImageBase64: string, productImageBase64: string, userRequest: string): Promise<string | null> => {
    // 1. 이미지 데이터 추출
    const userMatches = userImageBase64.match(/^data:(.+);base64,(.+)$/);
    const productMatches = productImageBase64.match(/^data:(.+);base64,(.+)$/);
    if (!userMatches || !productMatches) throw new Error("이미지 형식 오류");

    // 2. [핵심] 시스템 프롬프트 구성 (단계별 사고 유도)
    const systemPrompt = `
    You are a professional AI Photo Editor specialized in virtual fashion try-ons.
    
    [INPUTS]
    - IMAGE 1 (Reference): The User (Target Person).
    - IMAGE 2 (Garment): The Clothing Product.

    [TASK]
    Digitally dress the person in IMAGE 1 with the clothing from IMAGE 2. 
    This is a photo editing task, NOT a new image generation task.

    [EXECUTION STEPS - FOLLOW STRICTLY]
    1. **Analyze Body & Pose**: Identify the body shape and pose of the person in IMAGE 1.
    2. **Analyze Garment**: Understand the texture, fabric, and style of the clothing in IMAGE 2.
    3. **Virtual Mapping**: Warp and map the clothing from IMAGE 2 onto the body of IMAGE 1.
    4. **Refining**: Adjust lighting, shadows, and wrinkles of the clothing to match the environment of IMAGE 1.
    5. **Final Check**: Ensure the face, hair, and background of IMAGE 1 remain 100% UNCHANGED.

    [CRITICAL CONSTRAINTS]
    - **DO NOT CHANGE THE FACE**: The face in the output MUST be identical to IMAGE 1.
    - **DO NOT CHANGE THE BACKGROUND**: Keep the background consistent with IMAGE 1.
    - **REALISM**: The clothing must look like it is actually worn, not just pasted on top.
    - **COMPLETE VIEW**: Ensure the person's head and the styled outfit are fully visible.

    [USER REQUEST]
    ${userRequest || "얼굴 보이게 합성해줘"}
    `;

    // 3. AI 실행
    return await runGenAI(systemPrompt, [
        { mime: userMatches[1], data: userMatches[2] },
        { mime: productMatches[1], data: productMatches[2] }
    ]);
};

// 검색 기능 (유지)
export const searchProductsWithAI = async (query: string, allProducts: Product[]): Promise<number[]> => {
    // ... 기존 코드 유지 ...
    try {
      const ai = getAI();
      const productCatalog = allProducts.map(p => `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}`).join('\n');
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: { parts: [{ text: `You are a fashion coordinator. Find relevant product IDs from the catalog based on the user's query. The user is asking for recommendations. Your response must be a JSON object with a single key "matchedIds" containing an array of numbers.\n\nCatalog:\n${productCatalog}\n\nUser Query: "${query}"\n\nJSON response:` }] }
      });
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const cleanText = text.replace(/```json|```/g, '').trim(); 
      return JSON.parse(cleanText).matchedIds || [];
    } catch (error) {
      return [];
    }
};

// AI 코디네이터 설명 생성
export const generateRecommendationComment = async (query: string, products: Product[]): Promise<string | null> => {
  if (products.length === 0) return null;

  try {
    const ai = getAI();
    const productList = products.map(p => `- ${p.name} (${p.category})`).join('\n');
    const prompt = `
      당신은 전문 패션 코디네이터입니다. 사용자의 요청과 추천된 상품 목록을 보고, 이 상품들로 어떤 멋진 코디를 완성할 수 있는지 창의적이고 매력적인 설명을 한두 문장으로 만들어주세요 이모티콘 빼고요.

      사용자 요청: "${query}"

      추천 상품:
      ${productList}

      설명은 반드시 한국어로, 친근하고 스타일리시한 톤으로 작성해주세요. 예를 들어 "겨울 데이트를 위한 따뜻하면서도 스타일리시한 코디를 완성해보세요." 와 같이요. 설명만 간결하게 반환해주세요 이모티콘 빼고요.
    `;
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash-exp", contents: { parts: [{ text: prompt }] } });
    return response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (error) {
    console.error('AI 코디 설명 생성 오류:', error);
    return "코디 설명을 생성하는 데 실패했습니다.";
  }
};

// AI 추천 검색어 생성
export const generateSuggestedKeywords = async (query: string): Promise<string[]> => {
  try {
    const ai = getAI();
    const prompt = `
      A user in a fashion shopping app searched for "${query}" but found no results.
      Please suggest up to 5 alternative or related search keywords they could try.
      The keywords should be relevant to fashion, clothing, and style.
      Return your answer as a JSON object with a single key "suggestions" containing an array of Korean strings.
      For example: {"suggestions": ["패딩", "겨울 자켓", "따뜻한 옷", "스트릿 패션", "캐주얼 코디"]}

      JSON response:
    `;
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash-exp", contents: { parts: [{ text: prompt }] } });
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanText = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    return parsed.suggestions || [];
  } catch (error) {
    console.error('AI 키워드 제안 생성 오류:', error);
    // On error, return a default set of suggestions
    return ["인기 상품", "신상품", "상의", "아우터", "바지"];
  }
};

// AI 스타일링 아이템 카테고리 추천
export const generateStylingCategories = async (query: string, products: Product[], allCategories: string[]): Promise<string[]> => {
  if (products.length === 0) return [];

  try {
    const ai = getAI();
    const mainCategory = products[0]?.category;

    const prompt = `
      You are a fashion stylist. A user is looking for '${query}'.
      The main recommended items are in the '${mainCategory}' category.
      Suggest 3-4 other categories of items that would complete the look.
      Choose from the following available categories: ${JSON.stringify(allCategories.filter(c => c !== mainCategory))}.
      Do not suggest the main category '${mainCategory}'.

      Return your answer as a JSON object with a single key "suggestedCategories" containing an array of Korean strings.
      Example: {"suggestedCategories": ["가디건", "스카프", "샌들"]}

      JSON response:
    `;
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash-exp", contents: { parts: [{ text: prompt }] } });
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanText = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    return parsed.suggestedCategories || [];
  } catch (error) {
    console.error('AI 스타일링 카테고리 생성 오류:', error);
    return [];
  }
};